<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'canal' => $this->canal,
            'mensaje' => $this->mensaje,
            'leida' => $this->leida,
            'creado_en' => $this->created_at,
        ];
    }
}
