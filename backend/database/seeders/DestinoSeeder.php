<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Destino;
use Illuminate\Database\Seeder;

class DestinoSeeder extends Seeder
{
    public function run(): void
    {
        $destinos = [
            ['nombre' => 'Tulum', 'pais' => 'México', 'precio_desde' => 8000, 'lat' => 20.2114, 'lng' => -87.4654, 'categorias' => ['Playa', 'Aventura']],
            ['nombre' => 'Ciudad de México', 'pais' => 'México', 'precio_desde' => 3200, 'lat' => 19.4326, 'lng' => -99.1332, 'categorias' => ['Ciudad', 'Cultural']],
            ['nombre' => 'Oaxaca de Juárez', 'pais' => 'México', 'precio_desde' => 4500, 'lat' => 17.0732, 'lng' => -96.7266, 'categorias' => ['Cultural', 'Familiar']],
            ['nombre' => 'Puerto Escondido', 'pais' => 'México', 'precio_desde' => 5800, 'lat' => 15.8720, 'lng' => -97.0767, 'categorias' => ['Playa', 'Aventura']],
            ['nombre' => 'Tokio', 'pais' => 'Japón', 'precio_desde' => 45000, 'lat' => 35.6762, 'lng' => 139.6503, 'categorias' => ['Ciudad', 'Cultural']],
            ['nombre' => 'Kioto', 'pais' => 'Japón', 'precio_desde' => 42000, 'lat' => 35.0116, 'lng' => 135.7681, 'categorias' => ['Cultural']],
            ['nombre' => 'Santorini', 'pais' => 'Grecia', 'precio_desde' => 38000, 'lat' => 36.3932, 'lng' => 25.4615, 'categorias' => ['Playa', 'Ciudad']],
            ['nombre' => 'Machu Picchu', 'pais' => 'Perú', 'precio_desde' => 21000, 'lat' => -13.1631, 'lng' => -72.5450, 'categorias' => ['Aventura', 'Cultural']],
            ['nombre' => 'Bariloche', 'pais' => 'Argentina', 'precio_desde' => 24000, 'lat' => -41.1335, 'lng' => -71.3103, 'categorias' => ['Montaña', 'Aventura']],
            ['nombre' => 'Cartagena', 'pais' => 'Colombia', 'precio_desde' => 13000, 'lat' => 10.3910, 'lng' => -75.4794, 'categorias' => ['Playa', 'Cultural']],
            ['nombre' => 'París', 'pais' => 'Francia', 'precio_desde' => 32000, 'lat' => 48.8566, 'lng' => 2.3522, 'categorias' => ['Ciudad', 'Cultural']],
            ['nombre' => 'Petra', 'pais' => 'Jordania', 'precio_desde' => 27000, 'lat' => 30.3285, 'lng' => 35.4444, 'categorias' => ['Aventura', 'Cultural']],
            ['nombre' => 'Costa Rica (Monteverde)', 'pais' => 'Costa Rica', 'precio_desde' => 16000, 'lat' => 10.3009, 'lng' => -84.8016, 'categorias' => ['Aventura', 'Familiar']],
            ['nombre' => 'Cancún', 'pais' => 'México', 'precio_desde' => 9500, 'lat' => 21.1619, 'lng' => -86.8515, 'categorias' => ['Playa', 'Familiar']],
            ['nombre' => 'Barcelona', 'pais' => 'España', 'precio_desde' => 29000, 'lat' => 41.3874, 'lng' => 2.1686, 'categorias' => ['Ciudad', 'Cultural']],
        ];

        foreach ($destinos as $data) {
            $destino = Destino::create([
                'nombre' => $data['nombre'],
                'pais' => $data['pais'],
                'descripcion' => "Descubre {$data['nombre']}, uno de los destinos favoritos de los viajeros de PlanGo.",
                'precio_desde' => $data['precio_desde'],
                'imagen_url' => 'https://picsum.photos/seed/' . urlencode($data['nombre']) . '/600/400',
                'latitud' => $data['lat'],
                'longitud' => $data['lng'],
            ]);

            $idsCategorias = Categoria::whereIn('nombre', $data['categorias'])->pluck('id');
            $destino->categorias()->sync($idsCategorias);
        }
    }
}
