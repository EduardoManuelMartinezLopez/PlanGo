<?php

namespace Database\Factories;

use App\Models\Destino;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ViajeFactory extends Factory
{
    public function definition(): array
    {
        $inicio = fake()->dateTimeBetween('-2 months', '+3 months');
        $fin = (clone $inicio)->modify('+' . fake()->numberBetween(3, 10) . ' days');

        return [
            'user_id' => User::where('role', 'viajero')->inRandomOrder()->value('id'),
            'destino_id' => Destino::inRandomOrder()->value('id'),
            'fecha_inicio' => $inicio->format('Y-m-d'),
            'fecha_fin' => $fin->format('Y-m-d'),
            'presupuesto' => fake()->numberBetween(5000, 60000),
            'estado' => fake()->randomElement(['planeado', 'confirmado', 'completado']),
            'tipo_viaje' => fake()->randomElement(['aventura', 'relax', 'cultural', 'familiar']),
        ];
    }
}
