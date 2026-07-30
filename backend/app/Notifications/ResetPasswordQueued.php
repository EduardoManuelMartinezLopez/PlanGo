<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordBase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Igual que VerifyEmailQueued: agrega ShouldQueue + el trait Queueable
 * (obligatorio, si falta Laravel truena con "Undefined property
 * $connection"). Sigue usando el link hacia el frontend que ya
 * configuramos en AppServiceProvider (ResetPassword::createUrlUsing),
 * porque ese callback se comparte con la clase base.
 */
class ResetPasswordQueued extends ResetPasswordBase implements ShouldQueue
{
    use Queueable;
}
