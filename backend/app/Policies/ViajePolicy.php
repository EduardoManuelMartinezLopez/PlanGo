<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Viaje;

/**
 * Esta Policy controla si un usuario puede ver/editar/borrar UN viaje en
 * particular. La diferencia con el middleware de rol es que aquí no basta
 * con saber el rol, hace falta saber DE QUIÉN es ese viaje específico.
 */
class ViajePolicy
{
    public function ver(User $user, Viaje $viaje): bool
    {
        // Un administrador puede ver cualquier viaje; un viajero solo los suyos.
        return $user->esAdministrador() || $viaje->user_id === $user->id;
    }

    public function actualizar(User $user, Viaje $viaje): bool
    {
        return $user->esAdministrador() || $viaje->user_id === $user->id;
    }

    public function eliminar(User $user, Viaje $viaje): bool
    {
        return $user->esAdministrador() || $viaje->user_id === $user->id;
    }
}
