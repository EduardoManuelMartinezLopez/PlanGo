<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DestinoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'pais' => $this->pais,
            'descripcion' => $this->descripcion,
            'precio_desde' => (float) $this->precio_desde,
            'imagen_url' => $this->imagen_url,
            'latitud' => $this->latitud ? (float) $this->latitud : null,
            'longitud' => $this->longitud ? (float) $this->longitud : null,
            'categorias' => CategoriaResource::collection($this->whenLoaded('categorias')),
            // Listado de reseñas individuales (no solo el promedio) — antes
            // faltaba esta línea, por eso nunca se veían en pantalla.
            'resenas' => ResenaResource::collection($this->whenLoaded('resenas')),
            'calificacion_promedio' => $this->when(
                $this->relationLoaded('resenas'),
                fn () => round($this->resenas->avg('calificacion') ?? 0, 1)
            ),
            'total_resenas' => $this->when(
                $this->relationLoaded('resenas'),
                fn () => $this->resenas->count()
            ),
        ];
    }
}