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

    /**
     * GET /api/viajes
     * Solo regresa los viajes del usuario autenticado (o todos, si es
     * administrador) — paginado y filtrable por estado.
     */
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

    /**
     * POST /api/viajes
     * Crea el viaje Y genera el itinerario con IA en el mismo paso.
     */
    public function store(StoreViajeRequest $request)
    {
        $datos = $request->validated();
        $destino = Destino::findOrFail($datos['destino_id']);

        $viaje = Viaje::create([
            ...$datos,
            'user_id' => $request->user()->id,
            'estado' => 'planeado',
        ]);

        // Llamamos a Gemini para generar el itinerario sugerido
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

    /**
     * PATCH /api/viajes/{viaje}/confirmar
     * Simula el pago (Stripe modo prueba) y dispara las 3 confirmaciones:
     * correo, SMS y WhatsApp.
     */
    /**
     * POST /api/viajes/{viaje}/crear-intento-pago
     * Paso 1 del pago real con Stripe: el frontend llama esta ruta
     * ANTES de mostrar el formulario de tarjeta. Creamos un
     * "PaymentIntent" en modo de prueba por el monto del presupuesto
     * del viaje, y regresamos su "client_secret" — es lo único que el
     * frontend necesita para que Stripe.js dibuje el formulario de
     * tarjeta y confirme el pago directamente con Stripe (la tarjeta
     * nunca pasa por nuestro backend, así Stripe lo exige por seguridad).
     */
    public function crearIntentoPago(Request $request, Viaje $viaje)
    {
        Gate::authorize('actualizar', $viaje);

        Stripe::setApiKey(config('services.stripe.secret'));

        // Stripe trabaja en centavos, no en pesos, por eso *100.
        $intento = PaymentIntent::create([
            'amount' => (int) round(((float) $viaje->presupuesto) * 100),
            'currency' => 'mxn',
            'metadata' => [
                'viaje_id' => $viaje->id,
                'user_id' => $request->user()->id,
            ],
            // Evita que Stripe ofrezca métodos de pago (como OXXO) que
            // necesitan configuración extra en el dashboard — para la
            // demo solo queremos tarjeta.
            'payment_method_types' => ['card'],
        ]);

        return response()->json([
            'client_secret' => $intento->client_secret,
        ]);
    }

    /**
     * Calcula el total estimado del itinerario, igual que lo hace el
     * frontend en DetalleViaje.jsx: cada actividad trae su costo como
     * un rango de texto (ej. "$5,000 - $10,000 MXN"), así que sacamos
     * los números del rango y promediamos, luego sumamos entre todas
     * las actividades. Lo usamos aquí para que el mensaje de la
     * notificación de "pago confirmado" muestre el mismo total que ya
     * ve el usuario en la tarjeta de "Presupuesto Estimado".
     */
    private function calcularTotalItinerario(Viaje $viaje): float
    {
        $total = 0;

        foreach ($viaje->itinerario as $actividad) {
            preg_match_all('/\d[\d,]*/', $actividad->costo_estimado ?? '', $coincidencias);
            $numeros = array_map(fn ($n) => (float) str_replace(',', '', $n), $coincidencias[0]);

            if (count($numeros) > 0) {
                $total += array_sum($numeros) / count($numeros);
            }
        }

        return $total;
    }

    /**
     * PATCH /api/viajes/{viaje}/confirmar
     * Paso 2: el frontend ya confirmó el pago con Stripe.js en el
     * navegador (usando el client_secret de arriba) y nos manda el ID
     * de ese PaymentIntent. Aquí lo volvemos a consultar directo con
     * la API de Stripe — nunca confiamos en lo que diga el frontend,
     * porque cualquiera podría mandar un ID inventado desde la consola
     * del navegador. Solo si Stripe confirma que de verdad se completó
     * ("succeeded"), marcamos el viaje como confirmado y disparamos
     * las 3 confirmaciones: correo, SMS y WhatsApp.
     */
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
        $totalItinerario = $this->calcularTotalItinerario($viaje->load('itinerario'));

        // Notificación del pago en sí (distinta de los canales de mensajería)
        Notificacion::create([
            'user_id' => $usuario->id,
            'canal' => 'pago',
            'mensaje' => "Pago confirmado para tu viaje a {$viaje->destino->nombre} (\$" . number_format($totalItinerario, 0, '.', ',') . " MXN).",
        ]);

        // Correo real
        $usuario->notify(new ViajeConfirmadoNotification($viaje));
        Notificacion::create([
            'user_id' => $usuario->id,
            'canal' => 'correo',
            'mensaje' => 'Correo de confirmación de viaje enviado.',
        ]);

        // SMS y WhatsApp, solo si el usuario dio un teléfono
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

    /**
     * PATCH /api/viajes/{viaje}/completar
     * Permite al viajero marcar manualmente su viaje como "completado"
     * (por ejemplo, si ya regresó y no quiere esperar al proceso
     * automático de medianoche). Solo aplica a viajes ya "confirmado"
     * — uno que se quedó en "planeado" (nunca se pagó) no se puede
     * completar directamente.
     *
     * NOTA: para simplificar las pruebas del proyecto no exigimos que
     * la fecha_fin ya haya pasado; en un sistema real esa validación
     * de fecha sí se agregaría aquí.
     */
    public function completar(Request $request, Viaje $viaje)
    {
        Gate::authorize('actualizar', $viaje);

        if ($viaje->estado !== 'confirmado') {
            return response()->json([
                'message' => 'Solo puedes marcar como completado un viaje que ya esté confirmado.',
            ], 422);
        }

        $viaje->update(['estado' => 'completado']);

        Notificacion::create([
            'user_id' => $request->user()->id,
            'canal' => 'pago',
            'mensaje' => "Marcaste tu viaje a {$viaje->destino->nombre} como completado. ¡Esperamos que la hayas pasado increíble!",
        ]);

        return new ViajeResource($viaje->load(['destino', 'itinerario']));
    }

    public function destroy(Request $request, Viaje $viaje)
    {
        Gate::authorize('eliminar', $viaje);

        $viaje->delete();

        return response()->json(['message' => 'Viaje eliminado correctamente.']);
    }
}