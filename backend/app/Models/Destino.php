<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destino extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'pais',
        'descripcion',
        'precio_desde',
        'imagen_url',
        'latitud',
        'longitud',
    ];

    // Un destino puede tener varias categorías (N:M vía destino_categoria)
    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(Categoria::class, 'destino_categoria');
    }

    // Todos los viajes que se han planeado hacia este destino
    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }

    // Todas las reseñas que ha recibido este destino
    public function resenas(): HasMany
    {
        return $this->hasMany(Resena::class);
    }

    // Usuarios que lo tienen como favorito (a través de la tabla favoritos)
    public function usuariosFavoritos(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favoritos');
    }
}
