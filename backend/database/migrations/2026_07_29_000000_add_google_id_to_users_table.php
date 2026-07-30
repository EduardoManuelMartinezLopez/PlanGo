<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Agrega la columna google_id, necesaria para el login con Google
 * (extra de +5 pts). Cuando un usuario entra con Google por primera
 * vez, guardamos aquí su ID de Google para reconocerlo en futuros
 * inicios de sesión sin depender de que use siempre el mismo correo.
 *
 * No tocamos la columna "password" (sigue siendo NOT NULL): a los
 * usuarios que se registran con Google les generamos una contraseña
 * aleatoria que nunca van a usar, así evitamos tener que modificar el
 * esquema de una columna ya existente (lo cual pediría el paquete
 * doctrine/dbal, que no necesitamos instalar solo por esto).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('google_id');
        });
    }
};
