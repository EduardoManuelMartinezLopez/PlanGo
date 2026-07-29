<?php

namespace Database\Factories;

use App\Models\Viaje;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItinerarioActividadFactory extends Factory
{
    /**
     * Descripciones de ejemplo en español para cada tipo de actividad.
     * Antes usábamos fake()->sentence(), que sin configurar el locale
     * en español genera texto de relleno en latín.
     */
    protected array $descripcionesPorActividad = [
        'Visita guiada' => 'Recorrido con guía local por los puntos más importantes de la zona.',
        'Tour gastronómico' => 'Prueba de platillos típicos en mercados y restaurantes locales.',
        'Excursión a la playa' => 'Día libre en la playa, ideal para descansar y nadar.',
        'Recorrido cultural' => 'Visita a museos y sitios históricos representativos del destino.',
        'Snorkel' => 'Actividad acuática guiada para explorar la vida marina de la zona.',
        'Cena de bienvenida' => 'Cena de bienvenida con platillos típicos de la región.',
    ];

    public function definition(): array
    {
        $actividad = fake()->randomElement(array_keys($this->descripcionesPorActividad));

        return [
            'viaje_id' => Viaje::inRandomOrder()->value('id'),
            'dia' => fake()->numberBetween(1, 5),
            'hora' => fake()->time('h:i A'),
            'actividad' => $actividad,
            'descripcion' => $this->descripcionesPorActividad[$actividad],
            'costo_estimado' => '$' . fake()->numberBetween(200, 1500) . ' MXN',
        ];
    }
}