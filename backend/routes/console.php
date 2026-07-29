<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Todos los días, revisa los viajes "confirmado" cuya fecha_fin ya pasó
// y los marca como "completado" automáticamente. Así, sin que nadie
// tenga que hacer nada, los viajeros pueden dejar reseña después de su
// viaje.
Schedule::command('viajes:completar-vencidos')->daily();