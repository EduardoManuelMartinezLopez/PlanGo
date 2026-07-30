<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Laravel ya trae "VerifyEmail" listo (genera el link firmado y el
 * correo), pero por defecto NO se manda en cola — se manda al
 * instante, deteniendo la respuesta del registro hasta que Gmail
 * confirme que lo recibió. Esta clase es idéntica a la de Laravel,
 * pero agrega "implements ShouldQueue" y el trait "Queueable" (sin
 * este trait, Laravel truena con "Undefined property $connection")
 * para que se procese en segundo plano. La usamos desde
 * User::sendEmailVerificationNotification().
 */
class VerifyEmailQueued extends VerifyEmailBase implements ShouldQueue
{
    use Queueable;
}
