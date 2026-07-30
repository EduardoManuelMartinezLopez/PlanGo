<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificacionResource;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    /**
     * GET /api/notificaciones
     * Las últimas 15 notificaciones del usuario, para el dropdown
     * de la campanita.
     */
    public function index(Request $request)
    {
        $notificaciones = $request->user()
            ->notificaciones()
            ->latest()
            ->limit(15)
            ->get();

        return NotificacionResource::collection($notificaciones);
    }

    /**
     * PATCH /api/notificaciones/{id}/leida
     */
    public function marcarLeida(Request $request, int $id)
    {
        $notificacion = $request->user()->notificaciones()->findOrFail($id);
        $notificacion->update(['leida' => true]);

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }
}
