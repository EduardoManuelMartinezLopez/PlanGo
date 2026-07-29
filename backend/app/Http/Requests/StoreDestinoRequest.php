<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDestinoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización real (solo agente/admin) la hace el middleware
        // de rol en las rutas, no aquí.
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'pais' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'precio_desde' => ['required', 'numeric', 'min:0'],
            'imagen_url' => ['nullable', 'string', 'max:500'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'categorias' => ['nullable', 'array'],
            'categorias.*' => ['integer', 'exists:categorias,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del destino es obligatorio.',
            'pais.required' => 'El país es obligatorio.',
            'precio_desde.required' => 'El precio es obligatorio.',
            'precio_desde.numeric' => 'El precio debe ser un número.',
        ];
    }
}
