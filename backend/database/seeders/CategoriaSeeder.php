<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Playa', 'icono' => 'beach'],
            ['nombre' => 'Montaña', 'icono' => 'mountain'],
            ['nombre' => 'Ciudad', 'icono' => 'city'],
            ['nombre' => 'Cultural', 'icono' => 'landmark'],
            ['nombre' => 'Aventura', 'icono' => 'compass'],
            ['nombre' => 'Familiar', 'icono' => 'users'],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
