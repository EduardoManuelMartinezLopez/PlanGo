<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResenaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'calificacion' => $this->calificacion,
            'comentario' => $this->comentario,
            'autor' => $this->whenLoaded('usuario', fn () => $this->usuario->name),
            'creado_en' => $this->created_at,
        ];
    }
}
