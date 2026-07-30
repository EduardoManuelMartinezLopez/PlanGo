<?php

namespace App\Notifications;

use App\Models\Viaje;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Correo que se manda cuando un usuario confirma y paga un viaje.
 * ShouldQueue: igual que BienvenidaNotification, se manda en
 * segundo plano para no retrasar la respuesta del pago con Stripe.
 */
class ViajeConfirmadoNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Viaje $viaje)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $destino = $this->viaje->destino->nombre ?? 'tu destino';

        return (new MailMessage)
            ->subject('Tu viaje a ' . $destino . ' está confirmado')
            ->greeting("¡Hola, {$notifiable->name}!")
            ->line("Tu viaje a {$destino} ha sido confirmado.")
            ->line('Fechas: ' . $this->viaje->fecha_inicio . ' al ' . $this->viaje->fecha_fin)
            ->line('Presupuesto: $' . number_format((float) $this->viaje->presupuesto, 2) . ' MXN')
            ->action('Ver mi itinerario', env('FRONTEND_URL', 'http://localhost:5173') . '/viajes/' . $this->viaje->id)
            ->line('¡Que tengas un excelente viaje!');
    }
}
