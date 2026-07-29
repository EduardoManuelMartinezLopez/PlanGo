<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Este servicio habla con la API de Gemini (Google AI Studio) para generar
 * el itinerario de un viaje a partir de los datos que da el usuario.
 *
 * Para que funcione de verdad necesitas:
 * 1. Crear una API key gratis en https://aistudio.google.com/apikey
 * 2. Ponerla en tu archivo .env como: GEMINI_API_KEY=tu_key_aqui
 *
 * NOTA IMPORTANTE (julio 2026): Google reemplazó su API anterior
 * (endpoint "generateContent") por la nueva "Interactions API"
 * (endpoint "/v1beta/interactions"), y el modelo gratuito vigente
 * pasó de "gemini-2.0-flash" a "gemini-3.5-flash". Este archivo ya
 * está actualizado a la versión nueva.
 */
class GeminiService
{
    protected string $systemPrompt = <<<'PROMPT'
Eres el asistente virtual de viajes de PlanGo, una plataforma de planificación de viajes.

CONTEXTO Y ROL:
- Ayudas a los usuarios a planear itinerarios de viaje personalizados.
- Respondes siempre en español, de forma clara, amable y concisa.

OBJETIVO:
A partir de la información que te dé el usuario (destino, fechas, presupuesto,
tipo de viaje: aventura/relax/cultural/familiar), debes:
1. Sugerir un itinerario día por día.
2. Recomendar actividades y lugares de interés en el destino.
3. Dar un estimado aproximado de presupuesto por rubro, aclarando que son
   cifras referenciales.

RESTRICCIONES:
- No inventes precios exactos de vuelos u hoteles; usa rangos aproximados.
- No proporciones información fuera del ámbito de viajes.
PROMPT;

    /**
     * El esquema JSON que le pedimos a Gemini que respete estrictamente
     * (Structured Output). Así no dependemos de que el modelo "obedezca"
     * el formato solo por instrucciones de texto.
     */
    protected function esquemaItinerario(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'dias' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'dia' => ['type' => 'integer'],
                            'actividades' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'hora' => ['type' => 'string'],
                                        'actividad' => ['type' => 'string'],
                                        'descripcion' => ['type' => 'string'],
                                        'costo_estimado' => ['type' => 'string'],
                                    ],
                                    'required' => ['hora', 'actividad', 'descripcion', 'costo_estimado'],
                                ],
                            ],
                        ],
                        'required' => ['dia', 'actividades'],
                    ],
                ],
                'presupuesto_total_estimado' => ['type' => 'string'],
                'recomendaciones' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
            ],
            'required' => ['dias', 'presupuesto_total_estimado', 'recomendaciones'],
        ];
    }

    /**
     * Genera un itinerario llamando a la API de Gemini.
     *
     * @param string $destino Nombre del destino (ej. "Tulum, Quintana Roo")
     * @param string $fechaInicio Formato Y-m-d
     * @param string $fechaFin Formato Y-m-d
     * @param float $presupuesto
     * @param string $tipoViaje aventura|relax|cultural|familiar
     * @return array Estructura decodificada del JSON que regresa Gemini
     */
    public function generarItinerario(
        string $destino,
        string $fechaInicio,
        string $fechaFin,
        float $presupuesto,
        string $tipoViaje
    ): array {
        $apiKey = env('GEMINI_API_KEY');

        $prompt = "Destino: {$destino}\n"
            . "Fecha de inicio: {$fechaInicio}\n"
            . "Fecha de fin: {$fechaFin}\n"
            . "Presupuesto total: \${$presupuesto} MXN\n"
            . "Tipo de viaje: {$tipoViaje}\n"
            . "Genera el itinerario siguiendo el formato indicado.";

        try {
            $respuesta = Http::timeout(30)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Api-Revision' => '2026-05-20',
                ])
                ->post('https://generativelanguage.googleapis.com/v1beta/interactions', [
                    'model' => 'gemini-3.5-flash',
                    'system_instruction' => $this->systemPrompt,
                    'input' => $prompt,
                    'response_format' => [
                        'type' => 'text',
                        'mime_type' => 'application/json',
                        'schema' => $this->esquemaItinerario(),
                    ],
                ]);

            if ($respuesta->failed()) {
                Log::error('Error al llamar a Gemini: ' . $respuesta->body());
                return $this->itinerarioDeRespaldo();
            }

            // La Interactions API regresa un arreglo "steps"; el texto final
            // viene en el step de tipo "model_output".
            $pasos = $respuesta->json('steps', []);
            $texto = null;
            foreach ($pasos as $paso) {
                if (($paso['type'] ?? null) === 'model_output') {
                    $texto = $paso['content'][0]['text'] ?? null;
                    break;
                }
            }

            return json_decode($texto ?? '', true) ?? $this->itinerarioDeRespaldo();
        } catch (\Throwable $e) {
            Log::error('Excepción al generar itinerario con IA: ' . $e->getMessage());
            return $this->itinerarioDeRespaldo();
        }
    }

    /**
     * Si Gemini falla (sin API key configurada, sin internet, etc.), en vez
     * de romper la app regresamos un itinerario genérico de ejemplo. Así el
     * resto del sistema (guardar el viaje, mostrarlo) sigue funcionando.
     */
    protected function itinerarioDeRespaldo(): array
    {
        return [
            'dias' => [
                [
                    'dia' => 1,
                    'actividades' => [
                        [
                            'hora' => '9:00 AM',
                            'actividad' => 'Llegada y check-in',
                            'descripcion' => 'Registro en el hotel y descanso.',
                            'costo_estimado' => 'N/A',
                        ],
                    ],
                ],
            ],
            'presupuesto_total_estimado' => 'No disponible por el momento',
            'recomendaciones' => [
                'No se pudo generar el itinerario con IA en este momento, inténtalo de nuevo más tarde.',
            ],
        ];
    }
}