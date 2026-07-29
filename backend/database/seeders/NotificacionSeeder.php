<?php

namespace Database\Seeders;

use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificacionSeeder extends Seeder
{
    /**
     * Notificaciones de ejemplo, para que la tabla no empiece vacía y
     * puedas ver la campanita del navbar funcionando desde el primer
     * inicio de sesión (antes de que se dispare ninguna de verdad).
     */
    public function run(): void
    {
        $viajeros = User::where('role', 'viajero')->get();

        foreach ($viajeros as $viajero) {
            Notificacion::create([
                'user_id' => $viajero->id,
                'canal' => 'correo',
                'mensaje' => 'Correo de bienvenida enviado.',
                'leida' => true,
            ]);
        }
    }
}
