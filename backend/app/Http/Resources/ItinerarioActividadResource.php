<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItinerarioActividadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dia' => $this->dia,
            'hora' => $this->hora,
            'actividad' => $this->actividad,
            'descripcion' => $this->descripcion,
            'costo_estimado' => $this->costo_estimado,
        ];
    }
}
