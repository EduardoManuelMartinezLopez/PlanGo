<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Correo de bienvenida que se manda justo después de que un usuario
 * se registra. Laravel usa el servidor SMTP que configures en .env
 * (que en producción va a ser tu Postfix en el VPS).
 *
 * Implementa ShouldQueue para que el registro NO se quede esperando
 * a que termine de conectarse a Gmail y mandar el correo — Laravel
 * guarda el envío en la tabla "jobs" y lo procesa en segundo plano,
 * así la pantalla de registro avanza al instante. Para que esto
 * funcione de verdad hace falta tener corriendo, en paralelo,
 * "php artisan queue:listen" (o usar "composer run dev", que ya lo
 * incluye) — si no hay nadie escuchando la cola, el correo se queda
 * esperando en la tabla y nunca se manda.
 */
class BienvenidaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('¡Bienvenido a PlanGo!')
            ->greeting("¡Hola, {$notifiable->name}!")
            ->line('Gracias por registrarte en PlanGo, tu planificador de viajes.')
            ->line('Ya puedes explorar destinos y empezar a planear tu próxima aventura.')
            ->action('Explorar destinos', env('FRONTEND_URL', 'http://localhost:5173') . '/explorar')
            ->line('¡Buen viaje!');
    }
}
