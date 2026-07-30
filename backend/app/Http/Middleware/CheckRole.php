<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware que restringe una ruta a ciertos roles.
 * Se usa en las rutas así: ->middleware('role:administrador,agente')
 * (puede recibir uno o varios roles separados por coma).
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$rolesPermitidos): Response
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        if (!in_array($usuario->role, $rolesPermitidos)) {
            return response()->json([
                'message' => 'No tienes permiso para realizar esta acción.',
            ], 403);
        }

        return $next($request);
    }
}
