<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Viaje extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'destino_id',
        'fecha_inicio',
        'fecha_fin',
        'presupuesto',
        'estado',
        'tipo_viaje',
    ];

    // Convierte fecha_inicio y fecha_fin en objetos Carbon automáticamente,
    // así podemos usar métodos como ->diffInDays() sin conversiones manuales.
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function destino(): BelongsTo
    {
        return $this->belongsTo(Destino::class);
    }

    // El itinerario día por día de este viaje
    public function itinerario(): HasMany
    {
        return $this->hasMany(ItinerarioActividad::class);
    }
}
