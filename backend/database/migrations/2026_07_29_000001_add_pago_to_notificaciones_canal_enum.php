<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * La columna "canal" es un ENUM limitado a ['correo', 'sms', 'whatsapp'],
 * así que para poder registrar "se confirmó el pago con Stripe" como su
 * propia notificación (no un canal de mensajería, sino un evento del
 * sistema) hay que agregar 'pago' a la lista de valores permitidos.
 *
 * Usamos SQL directo (ALTER TABLE ... MODIFY) en vez del método change()
 * de Laravel porque change() en columnas existentes requiere instalar
 * el paquete doctrine/dbal, que no necesitamos solo por este cambio.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE notificaciones MODIFY canal ENUM('correo', 'sms', 'whatsapp', 'pago') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notificaciones MODIFY canal ENUM('correo', 'sms', 'whatsapp') NOT NULL");
    }
};
