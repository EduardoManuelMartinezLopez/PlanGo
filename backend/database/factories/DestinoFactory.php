<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DestinoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->city(),
            'pais' => fake()->country(),
            'descripcion' => 'Un destino ideal para explorar, descansar y vivir nuevas experiencias.',
            'precio_desde' => fake()->numberBetween(2000, 25000),
            'imagen_url' => 'https://picsum.photos/seed/' . fake()->uuid() . '/600/400',
            'latitud' => fake()->latitude(-60, 60),
            'longitud' => fake()->longitude(-120, 120),
        ];
    }
}