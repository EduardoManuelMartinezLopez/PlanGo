<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreViajeRequest;
use App\Http\Resources\ViajeResource;
use App\Models\Destino;
use App\Models\ItinerarioActividad;
use App\Models\Notificacion;
use App\Models\Viaje;
use App\Notifications\ViajeConfirmadoNotification;
use App\Services\GeminiService;
use App\Services\TwilioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class ViajeController extends Controller
{
    public function __construct(protected GeminiService $gemini, protected TwilioService $twilio)
    {
    }

    public function index(Request $request)
    {
        $usuario = $request->user();

        $query = Viaje::with(['destino', 'itinerario'])
            ->when(!$usuario->esAdministrador(), fn ($q) => $q->where('user_id', $usuario->id));

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $porPagina = (int) $request->input('limit', 10);
        $viajes = $query->latest()->paginate($porPagina)->withQueryString();

        return ViajeResource::collection($viajes);
    }

    public function store(StoreViajeRequest $request)
    {
        $datos = $request->validated();
        $destino = Destino::findOrFail($datos['destino_id']);

        $viaje = Viaje::create([
            ...$datos,
            'user_id' => $request->user()->id,
            'estado' => 'planeado',
        ]);

        $resultado = $this->gemini->generarItinerario(
            destino: $destino->nombre . ', ' . $destino->pais,
            fechaInicio: $datos['fecha_inicio'],
            fechaFin: $datos['fecha_fin'],
            presupuesto: (float) $datos['presupuesto'],
            tipoViaje: $datos['tipo_viaje'],
        );

        foreach ($resultado['dias'] ?? [] as $dia) {
            foreach ($dia['actividades'] ?? [] as $actividad) {
                ItinerarioActividad::create([
                    'viaje_id' => $viaje->id,
                    'dia' => $dia['dia'],
                    'hora' => $actividad['hora'] ?? null,
                    'actividad' => $actividad['actividad'] ?? 'Actividad',
                    'descripcion' => $actividad['descripcion'] ?? null,
                    'costo_estimado' => $actividad['costo_estimado'] ?? null,
                ]);
            }
        }

        return new ViajeResource($viaje->load(['destino', 'itinerario']));
    }

    public function show(Request $request, Viaje $viaje)
    {
        Gate::authorize('ver', $viaje);

        return new ViajeResource($viaje->load(['destino', 'itinerario']));
    }

    public function crearIntentoPago(Request $request, Viaje $viaje)
    {
        Gate::authorize('actualizar', $viaje);

        Stripe::setApiKey(config('services.stripe.secret'));

        $intento = PaymentIntent::create([
            'amount' => (int) round(((float) $viaje->presupuesto) * 100),
            'currency' => 'mxn',
            'metadata' => [
                'viaje_id' => $viaje->id,
                'user_id' => $request->user()->id,
            ],
            'payment_method_types' => ['card'],
        ]);

        return response()->json([
            'client_secret' => $intento->client_secret,
        ]);
    }

    public function confirmar(Request $request, Viaje $viaje)
    {
        Gate::authorize('actualizar', $viaje);

        $request->validate([
            'stripe_payment_intent_id' => ['required', 'string'],
            'telefono' => ['nullable', 'string'],
        ]);

        Stripe::setApiKey(config('services.stripe.secret'));
        $intento = PaymentIntent::retrieve($request->input('stripe_payment_intent_id'));

        if ($intento->status !== 'succeeded') {
            return response()->json([
                'message' => 'El pago todavía no se ha completado con Stripe.',
            ], 422);
        }

        $viaje->update(['estado' => 'confirmado']);

        $usuario = $request->user();

        Notificacion::create([
            'user_id' => $usuario->id,
            'canal' => 'pago',
            'mensaje' => "Pago confirmado para tu viaje a {$viaje->destino->nombre} (\${$viaje->presupuesto} MXN).",
        ]);

        $usuario->notify(new ViajeConfirmadoNotification($viaje));
        Notificacion::create([
            'user_id' => $usuario->id,
            'canal' => 'correo',
            'mensaje' => 'Correo de confirmación de viaje enviado.',
        ]);

        if ($request->filled('telefono')) {
            $mensaje = "PlanGo: tu viaje a {$viaje->destino->nombre} está confirmado. ¡Buen viaje!";

            if ($this->twilio->enviarSms($request->input('telefono'), $mensaje)) {
                Notificacion::create([
                    'user_id' => $usuario->id,
                    'canal' => 'sms',
                    'mensaje' => 'SMS de confirmación enviado.',
                ]);
            }

            if ($this->twilio->enviarWhatsapp($request->input('telefono'), $mensaje)) {
                Notificacion::create([
                    'user_id' => $usuario->id,
                    'canal' => 'whatsapp',
                    'mensaje' => 'WhatsApp de confirmación enviado.',
                ]);
            }
        }

        return new ViajeResource($viaje->load(['destino', 'itinerario']));
    }

    public function completar(Request $request, Viaje $viaje)
    {
        Gate::authorize('actualizar', $viaje);

        if ($viaje->estado !== 'confirmado') {
            return response()->json([
                'message' => 'Solo puedes marcar como completado un viaje que ya esté confirmado.',
            ], 422);
        }

        $viaje->update(['estado' => 'completado']);

        return new ViajeResource($viaje->load(['destino', 'itinerario']));
    }

    public function destroy(Request $request, Viaje $viaje)
    {
        Gate::authorize('eliminar', $viaje);

        $viaje->delete();

        return response()->json(['message' => 'Viaje eliminado correctamente.']);
    }
}