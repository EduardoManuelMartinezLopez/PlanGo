<?php

namespace Database\Seeders;

use App\Models\Destino;
use App\Models\User;
use Illuminate\Database\Seeder;

class FavoritoSeeder extends Seeder
{
    public function run(): void
    {
        $viajeros = User::where('role', 'viajero')->get();
        $destinos = Destino::all();

        foreach ($viajeros as $viajero) {
            // Cada viajero marca entre 1 y 4 destinos aleatorios como favoritos
            $favoritos = $destinos->random(rand(1, 4))->pluck('id');
            $viajero->favoritos()->syncWithoutDetaching($favoritos);
        }
    }
}
