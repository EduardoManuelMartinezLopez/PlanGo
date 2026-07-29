<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;


/**
 * Correo de bienvenida que se manda justo después de que un usuario
 * se registra. Laravel usa el servidor SMTP que configures en .env
 * (que en producción va a ser tu Postfix en el VPS).
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
