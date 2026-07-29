<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItinerarioActividad extends Model
{
    use HasFactory;

    // Le decimos a Laravel el nombre real de la tabla, porque el
    // plural automático que hubiera adivinado no es el correcto.
    protected $table = 'itinerario_actividades';

    protected $fillable = [
        'viaje_id',
        'dia',
        'hora',
        'actividad',
        'descripcion',
        'costo_estimado',
    ];

    public function viaje(): BelongsTo
    {
        return $this->belongsTo(Viaje::class);
    }
}
