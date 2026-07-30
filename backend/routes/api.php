<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\DestinoController;
use App\Http\Controllers\Api\FavoritoController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\ResenaController;
use App\Http\Controllers\Api\ViajeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas públicas (no requieren estar autenticado)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Login / registro con Google
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

// Este es el link que llega en el correo de verificación. Va con
// "signed" para que Laravel rechace la URL si alguien la modifica.
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verificarCorreo'])
    ->middleware(['signed'])
    ->name('verification.verify');

// Destinos y categorías se pueden VER sin estar logueado (para que
// "Explorar" funcione incluso antes de iniciar sesión), pero crear,
// editar o borrar sí requiere autenticación + rol correcto (más abajo).
Route::get('/destinos', [DestinoController::class, 'index']);
Route::get('/destinos/{destino}', [DestinoController::class, 'show']);
Route::get('/destinos/{destino}/resenas', [ResenaController::class, 'index']);
Route::get('/categorias', [CategoriaController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Rutas protegidas (requieren un token válido de Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'actualizarPerfil']);
Route::patch('/me/password', [AuthController::class, 'actualizarContrasena']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/reenviar', [AuthController::class, 'reenviarVerificacion']);

    // --- Viajero (cualquier usuario autenticado) ---
    Route::get('/viajes', [ViajeController::class, 'index']);
    Route::post('/viajes', [ViajeController::class, 'store']);
    Route::get('/viajes/{viaje}', [ViajeController::class, 'show']);
    Route::post('/viajes/{viaje}/crear-intento-pago', [ViajeController::class, 'crearIntentoPago']);
    Route::patch('/viajes/{viaje}/confirmar', [ViajeController::class, 'confirmar']);
    Route::patch('/viajes/{viaje}/completar', [ViajeController::class, 'completar']);
    Route::delete('/viajes/{viaje}', [ViajeController::class, 'destroy']);

    Route::post('/resenas', [ResenaController::class, 'store']);
    Route::get('/destinos/{destino}/mi-resena', [ResenaController::class, 'miResena']);

    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::post('/favoritos/{destino}', [FavoritoController::class, 'alternar']);

    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::patch('/notificaciones/{id}/leida', [NotificacionController::class, 'marcarLeida']);

    // --- Solo Agente de viajes o Administrador ---
    Route::middleware('role:agente,administrador')->group(function () {
        Route::post('/destinos', [DestinoController::class, 'store']);
        Route::put('/destinos/{destino}', [DestinoController::class, 'update']);
        Route::patch('/destinos/{destino}', [DestinoController::class, 'update']);
        Route::delete('/destinos/{destino}', [DestinoController::class, 'destroy']);

        Route::post('/categorias', [CategoriaController::class, 'store']);
        Route::put('/categorias/{categoria}', [CategoriaController::class, 'update']);
        Route::delete('/categorias/{categoria}', [CategoriaController::class, 'destroy']);
    });

    // --- Solo Administrador ---
    Route::middleware('role:administrador')->prefix('admin')->group(function () {
        Route::get('/estadisticas', [AdminController::class, 'estadisticas']);
        Route::get('/usuarios', [AdminController::class, 'usuarios']);
        Route::patch('/usuarios/{usuario}/rol', [AdminController::class, 'actualizarRol']);
        Route::delete('/usuarios/{usuario}', [AdminController::class, 'eliminar']);
    });
});