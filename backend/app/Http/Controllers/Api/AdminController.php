<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UsuarioResource;
use App\Models\Destino;
use App\Models\User;
use App\Models\Viaje;
use Illuminate\Http\Request;

/**
 * Todas las rutas de este controlador están protegidas en routes/api.php
 * con el middleware "role:administrador" — solo un administrador puede
 * llegar aquí.
 */
class AdminController extends Controller
{
    /**
     * GET /api/admin/estadisticas
     * Los números y la gráfica que se muestran en el Panel de
     * Estadísticas del rol Administrador.
     */
    public function estadisticas()
    {
        return response()->json([
            'total_usuarios' => User::count(),
            'viajes_activos' => Viaje::whereIn('estado', ['planeado', 'confirmado'])->count(),
            'ingresos_estimados' => (float) Viaje::where('estado', 'confirmado')->sum('presupuesto'),
            'destinos_mas_reservados' => Destino::withCount('viajes')
                ->orderByDesc('viajes_count')
                ->limit(5)
                ->get(['id', 'nombre'])
                ->map(fn ($destino) => [
                    'nombre' => $destino->nombre,
                    'total_viajes' => $destino->viajes_count,
                ]),
        ]);
    }

    /**
     * GET /api/admin/usuarios
     */
    public function usuarios(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $porPagina = (int) $request->input('limit', 10);

        return UsuarioResource::collection($query->paginate($porPagina)->withQueryString());
    }

    /**
     * PATCH /api/admin/usuarios/{usuario}/rol
     */
    public function actualizarRol(Request $request, User $usuario)
    {
        $request->validate([
            'role' => ['required', 'in:administrador,viajero,agente'],
        ]);

        // Un administrador no puede cambiar su propio rol desde aquí —
        // evita que se bloquee a sí mismo sin querer.
        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes cambiar tu propio rol.',
            ], 422);
        }

        $usuario->update(['role' => $request->input('role')]);

        return new UsuarioResource($usuario);
    }

    /**
     * DELETE /api/admin/usuarios/{usuario}
     *
     * Borra al usuario. Las tablas relacionadas (viajes, reseñas,
     * favoritos, notificaciones) tienen cascadeOnDelete en sus
     * migraciones, así que MySQL limpia esos registros solo.
     */
    public function eliminar(Request $request, User $usuario)
    {
        if ($usuario->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta.',
            ], 422);
        }

        $usuario->delete();

        return response()->json(null, 204);
    }
}