<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;

/**
 * Envía SMS y WhatsApp reales usando Twilio.
 *
 * Para que funcione necesitas:
 * 1. Crear una cuenta gratis en https://www.twilio.com/try-twilio
 *    (te da saldo de prueba gratuito)
 * 2. Activar el "WhatsApp Sandbox" en tu consola de Twilio
 * 3. Poner en tu .env:
 *    TWILIO_SID=tu_account_sid
 *    TWILIO_TOKEN=tu_auth_token
 *    TWILIO_SMS_FROM=tu_numero_de_twilio
 *    TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  (número del sandbox)
 * 4. Instalar el paquete: composer require twilio/sdk
 */
class TwilioService
{
    protected Client $cliente;

    public function __construct()
    {
        $this->cliente = new Client(
            env('TWILIO_SID'),
            env('TWILIO_TOKEN')
        );
    }

    public function enviarSms(string $numeroDestino, string $mensaje): bool
    {
        try {
            $this->cliente->messages->create($numeroDestino, [
                'from' => env('TWILIO_SMS_FROM'),
                'body' => $mensaje,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error('Error al enviar SMS con Twilio: ' . $e->getMessage());
            return false;
        }
    }

    public function enviarWhatsapp(string $numeroDestino, string $mensaje): bool
    {
        try {
            $this->cliente->messages->create('whatsapp:' . $numeroDestino, [
                'from' => env('TWILIO_WHATSAPP_FROM'),
                'body' => $mensaje,
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::error('Error al enviar WhatsApp con Twilio: ' . $e->getMessage());
            return false;
        }
    }
}
