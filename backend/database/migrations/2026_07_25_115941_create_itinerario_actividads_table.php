<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // El archivo se llama "..._actividads_..." porque así lo generó
        // Artisan solo, pero la tabla de verdad sí se llama bien:
        // "itinerario_actividades".
        Schema::create('itinerario_actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('viaje_id')->constrained('viajes')->cascadeOnDelete();
            $table->unsignedTinyInteger('dia');
            $table->string('hora')->nullable();
            $table->string('actividad');
            $table->text('descripcion')->nullable();
            $table->string('costo_estimado')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('itinerario_actividades');
    }
};
