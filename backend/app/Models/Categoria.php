<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Categoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'icono',
    ];

    public function destinos(): BelongsToMany
    {
        return $this->belongsToMany(Destino::class, 'destino_categoria');
    }
}
