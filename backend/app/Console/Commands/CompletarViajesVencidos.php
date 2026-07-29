<?php

namespace App\Console\Commands;

use App\Models\Viaje;
use Illuminate\Console\Command;

/**
 * Comando que revisa todos los viajes con estado "confirmado" cuya
 * fecha_fin ya pasó, y los marca automáticamente como "completado".
 *
 * Solo los viajes "confirmado" pasan a "completado" — un viaje que se
 * quedó en "planeado" (nunca se pagó) no se completa solo.
 *
 * Se corre automáticamente todos los días (ver routes/console.php),
 * pero también se puede ejecutar a mano en cualquier momento con:
 *   php artisan viajes:completar-vencidos
 */
class CompletarViajesVencidos extends Command
{
    protected $signature = 'viajes:completar-vencidos';

    protected $description = 'Marca como "completado" los viajes confirmados cuya fecha_fin ya pasó';

    public function handle(): int
    {
        $actualizados = Viaje::where('estado', 'confirmado')
            ->whereDate('fecha_fin', '<', now())
            ->update(['estado' => 'completado']);

        $this->info("Viajes marcados como completados: {$actualizados}");

        return self::SUCCESS;
    }
}