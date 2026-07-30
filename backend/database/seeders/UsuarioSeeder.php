<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Estas son las credenciales fijas que pide la rúbrica, para que
        // la maestra pueda entrar sin afectar los datos de nadie más.
        // Documentadas también en el README.
        User::create([
            'name' => 'Administrador PlanGo',
            'email' => 'admin@plango.test',
            'password' => Hash::make('Admin#2026'),
            'role' => 'administrador',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Agente de Viajes',
            'email' => 'agente@plango.test',
            'password' => Hash::make('Agente#2026'),
            'role' => 'agente',
            'email_verified_at' => now(),
        ]);

        // Un viajero "developer" fijo, fácil de usar para pruebas rápidas
        User::create([
            'name' => 'Usuario Developer',
            'email' => 'developer@plango.test',
            'password' => Hash::make('Developer#2026'),
            'role' => 'viajero',
            'email_verified_at' => now(),
        ]);

        // Más viajeros de prueba generados al azar, ya verificados
        User::factory()->count(12)->create([
            'role' => 'viajero',
            'email_verified_at' => now(),
        ]);
    }
}
