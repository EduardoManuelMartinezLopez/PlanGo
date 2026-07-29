<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UsuarioSeeder::class,
            CategoriaSeeder::class,
            DestinoSeeder::class,
            ViajeSeeder::class,
            ResenaSeeder::class,
            FavoritoSeeder::class,
            NotificacionSeeder::class,
        ]);
    }
}
