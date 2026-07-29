<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ViajeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'estado' => $this->estado,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'presupuesto' => (float) $this->presupuesto,
            'tipo_viaje' => $this->tipo_viaje,
            'destino' => new DestinoResource($this->whenLoaded('destino')),
            'itinerario' => ItinerarioActividadResource::collection($this->whenLoaded('itinerario')),
            'creado_en' => $this->created_at,
        ];
    }
}
