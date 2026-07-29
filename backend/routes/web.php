<?php

use Illuminate\Support\Facades\Route;

/**
 * PlanGo es una API pura — el frontend (React) vive en otro proyecto
 * aparte y le habla a esta API. Esta ruta web solo existe para
 * confirmar rápido que el backend está vivo si alguien entra a la
 * URL raíz por error.
 */
Route::get('/', function () {
    return response()->json([
        'proyecto' => 'PlanGo API',
        'estado' => 'funcionando',
        'documentacion' => '/api/destinos',
    ]);
});
