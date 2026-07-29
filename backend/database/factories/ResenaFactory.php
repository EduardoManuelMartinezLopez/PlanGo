<?php

namespace Database\Factories;

use App\Models\Destino;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResenaFactory extends Factory
{
    /**
     * Comentarios de ejemplo en español, agrupados por qué tan buena fue
     * la calificación. Antes usábamos fake()->sentence(), que sin
     * configurar el locale en español genera frases de relleno en latín
     * ("Officiis rerum dicta...") — nada que ver con el idioma del resto
     * de la app.
     */
    protected function comentariosPorCalificacion(int $calificacion): array
    {
        return match (true) {
            $calificacion >= 5 => [
                'Una experiencia increíble, superó todas mis expectativas.',
                'Perfecto de principio a fin, sin duda voy a regresar.',
                'El mejor viaje que he hecho, todo salió excelente.',
                'Hermoso lugar, la pasamos increíble en familia.',
                'Totalmente recomendado, cada peso valió la pena.',
            ],
            $calificacion === 4 => [
                'Muy buen destino, solo el clima nos jugó en contra un día.',
                'Lo disfrutamos mucho, aunque algunas actividades estuvieron algo saturadas.',
                'Excelente experiencia en general, regresaría sin duda.',
                'Nos encantó, la comida local fue lo mejor del viaje.',
                'Buena relación calidad-precio, cumplió lo que prometía.',
            ],
            default => [
                'Estuvo bien, aunque esperaba un poco más por el precio.',
                'Cumplió, pero algunas actividades se sintieron apresuradas.',
                'Un destino bonito, aunque la logística podría mejorar.',
                'Se disfruta, aunque conviene ir en temporada baja.',
            ],
        };
    }

    public function definition(): array
    {
        $calificacion = fake()->numberBetween(3, 5);

        return [
            'user_id' => User::where('role', 'viajero')->inRandomOrder()->value('id'),
            'destino_id' => Destino::inRandomOrder()->value('id'),
            'calificacion' => $calificacion,
            'comentario' => fake()->randomElement($this->comentariosPorCalificacion($calificacion)),
        ];
    }
}