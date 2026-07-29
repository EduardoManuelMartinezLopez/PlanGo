<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Controla exactamente qué campos del usuario salen en el JSON.
 * Aquí es donde nos aseguramos de NUNCA exponer el password.
 */
class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'correo_verificado' => !is_null($this->email_verified_at),
            'creado_en' => $this->created_at,
        ];
    }
}
