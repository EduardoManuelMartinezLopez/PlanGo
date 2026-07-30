<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreViajeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'destino_id' => ['required', 'integer', 'exists:destinos,id'],
            'fecha_inicio' => ['required', 'date', 'after_or_equal:today'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'presupuesto' => ['required', 'numeric', 'min:0'],
            'tipo_viaje' => ['required', 'string', 'in:aventura,relax,cultural,familiar'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_inicio.after_or_equal' => 'La fecha de inicio no puede ser en el pasado.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la de inicio.',
        ];
    }
}
