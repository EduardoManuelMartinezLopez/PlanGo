<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Campos que se pueden asignar en masa (create()/update() con un
     * arreglo). Si un campo no está aquí, Laravel lo bloquea por
     * seguridad — por eso "role" tiene que estar en esta lista para
     * que el admin pueda cambiar el rol de otros usuarios.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'password',
        'role',
        'email_verified_at',
    ];

    /**
     * Campos que nunca se deben mostrar cuando el modelo se convierte
     * a JSON/array (por ejemplo, en las respuestas de la API).
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ---- Relaciones ----

    // Todos los viajes que ha planeado este usuario
    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class);
    }

    // Todas las reseñas que ha escrito
    public function resenas(): HasMany
    {
        return $this->hasMany(Resena::class);
    }

    // Los destinos que marcó como favoritos
    public function favoritos(): BelongsToMany
    {
        return $this->belongsToMany(Destino::class, 'favoritos');
    }

    // Notificaciones (correo/SMS/WhatsApp) que se le han enviado
    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    // ---- Métodos de ayuda para roles ----

    public function esAdministrador(): bool
    {
        return $this->role === 'administrador';
    }

    public function esAgente(): bool
    {
        return $this->role === 'agente';
    }

    public function esViajero(): bool
    {
        return $this->role === 'viajero';
    }

    // ---- Correos en segundo plano (no bloquean la respuesta al usuario) ----

    /**
     * Laravel llama esto solo cuando se registra un usuario nuevo
     * (evento Registered) o cuando alguien pide reenviar el correo.
     * Usamos nuestra versión "Queued" en vez de la que trae Laravel
     * por defecto, para que el registro no se quede esperando a que
     * termine de mandarse el correo por Gmail.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\VerifyEmailQueued());
    }

    /**
     * Laravel llama esto automáticamente dentro de
     * Password::sendResetLink() (usado en AuthController::forgotPassword).
     * Mismo motivo que arriba: que no se quede esperando al SMTP.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordQueued($token));
    }
}