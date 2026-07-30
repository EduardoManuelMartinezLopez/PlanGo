<?php

namespace Database\Seeders;

use App\Models\Resena;
use Illuminate\Database\Seeder;

class ResenaSeeder extends Seeder
{
    public function run(): void
    {
        Resena::factory()->count(15)->create();
    }
}
