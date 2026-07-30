<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreResenaRequest;
use App\Http\Resources\ResenaResource;
use App\Models\Resena;
use Illuminate\Http\Request;

class ResenaController extends Controller
{
    /**
     * GET /api/destinos/{destino}/resenas
     */
    public function index(int $destinoId)
    {
        $resenas = Resena::with('usuario')
            ->where('destino_id', $destinoId)
            ->latest()
            ->paginate(10);

        return ResenaResource::collection($resenas);
    }

    /**
     * GET /api/destinos/{destino}/mi-resena
     * Regresa la reseña que el usuario autenticado ya dejó para este
     * destino (o null si todavía no ha dejado ninguna). El frontend usa
     * esto para precargar el formulario y mostrar "Actualizar reseña"
     * en vez de dejar que el viajero mande el formulario vacío una y
     * otra vez sin saber que ya había opinado antes.
     */
    public function miResena(Request $request, int $destinoId)
    {
        $resena = Resena::where('destino_id', $destinoId)
            ->where('user_id', $request->user()->id)
            ->first();

        return $resena ? new ResenaResource($resena) : response()->json(['data' => null]);
    }

    /**
     * POST /api/resenas
     * Solo se puede dejar reseña si el usuario tiene al menos un viaje
     * "completado" a ese destino (evita reseñas falsas de quien nunca
     * viajó ahí).
     */
    public function store(StoreResenaRequest $request)
    {
        $usuario = $request->user();
        $datos = $request->validated();

        $tieneViajeCompletado = $usuario->viajes()
            ->where('destino_id', $datos['destino_id'])
            ->where('estado', 'completado')
            ->exists();

        if (!$tieneViajeCompletado) {
            return response()->json([
                'message' => 'Solo puedes reseñar destinos donde ya completaste un viaje.',
            ], 403);
        }

        $resena = Resena::updateOrCreate(
            ['user_id' => $usuario->id, 'destino_id' => $datos['destino_id']],
            ['calificacion' => $datos['calificacion'], 'comentario' => $datos['comentario'] ?? null]
        );

        return new ResenaResource($resena->load('usuario'));
    }
}