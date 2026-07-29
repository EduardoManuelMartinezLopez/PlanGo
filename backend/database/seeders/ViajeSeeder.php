<?php

namespace Database\Seeders;

use App\Models\ItinerarioActividad;
use App\Models\Viaje;
use Illuminate\Database\Seeder;

class ViajeSeeder extends Seeder
{
    public function run(): void
    {
        Viaje::factory()->count(15)->create()->each(function (Viaje $viaje) {
            $dias = min((int) $viaje->fecha_inicio->diffInDays($viaje->fecha_fin) + 1, 4);

            for ($dia = 1; $dia <= $dias; $dia++) {
                ItinerarioActividad::factory()->count(2)->create([
                    'viaje_id' => $viaje->id,
                    'dia' => $dia,
                ]);
            }
        });
    }
}
