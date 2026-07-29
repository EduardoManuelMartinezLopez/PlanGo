<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

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