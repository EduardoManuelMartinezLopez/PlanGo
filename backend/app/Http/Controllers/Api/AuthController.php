<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Notificacion;
use App\Models\User;
use App\Notifications\BienvenidaNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * POST /api/register
     * Crea el usuario, dispara el correo de verificación (evento
     * "Registered" que Laravel maneja automáticamente si el modelo User
     * implementa MustVerifyEmail) y el correo de bienvenida.
     */
    public function register(RegisterRequest $request)
    {
        $usuario = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'role' => 'viajero', // todo registro público siempre es viajero
        ]);

        // Este evento dispara automáticamente el correo de verificación
        // (Laravel ya trae la lógica, solo hay que implementar
        // MustVerifyEmail en el modelo User, lo cual ya hicimos).
        event(new Registered($usuario));

        // Correo de bienvenida
        $usuario->notify(new BienvenidaNotification());

        // Guardamos un registro en nuestra propia tabla de notificaciones,
        // para que se vea reflejado en la campanita del frontend.
        Notificacion::create([
            'user_id' => $usuario->id,
            'canal' => 'correo',
            'mensaje' => 'Correo de bienvenida y verificación enviado.',
        ]);

        return response()->json([
            'message' => 'Cuenta creada. Revisa tu correo para verificar tu cuenta.',
            'usuario' => new UsuarioResource($usuario),
        ], 201);
    }

    /**
     * GET /api/email/verify/{id}/{hash}
     * Este es el link al que da clic el usuario desde su correo.
     * La ruta está protegida con el middleware "signed", así que si
     * alguien modifica la URL a mano, Laravel la rechaza sola.
     */
    public function verificarCorreo(EmailVerificationRequest $request)
    {
        if (!$request->user()->hasVerifiedEmail()) {
            $request->fulfill();
        }

        // Redirige al usuario de vuelta al login del frontend con un
        // mensaje de éxito en la URL.
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        return redirect($frontendUrl . '/login?verificado=1');
    }

    /**
     * POST /api/email/reenviar
     * Por si el correo no llegó o expiró el link.
     */
    public function reenviarVerificacion(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Tu correo ya está verificado.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Correo de verificación reenviado.']);
    }

    /**
     * POST /api/login
     */
    public function login(LoginRequest $request)
    {
        $credenciales = $request->validated();

        if (!Auth::attempt($credenciales)) {
            throw ValidationException::withMessages([
                'email' => ['Usuario o contraseña incorrectos.'],
            ]);
        }

        $usuario = User::where('email', $credenciales['email'])->firstOrFail();

        // createToken genera el token de Sanctum que el frontend va a
        // guardar y mandar en cada petición protegida.
        $token = $usuario->createToken('token-plango')->plainTextToken;

        return response()->json([
            'usuario' => new UsuarioResource($usuario),
            'token' => $token,
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        // Borra solo el token que se usó en esta petición (no todos los
        // dispositivos donde el usuario tenga sesión iniciada).
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * GET /api/me
     * El frontend la usa para saber quién es el usuario autenticado
     * (por ejemplo, al recargar la página).
     */
    public function me(Request $request)
    {
        return response()->json(new UsuarioResource($request->user()));
    }

    /**
     * PATCH /api/me
     * Permite al usuario editar su propio nombre desde "Configuración
     * de Cuenta". El correo no se puede cambiar aquí a propósito: como
     * el login y la verificación de cuenta dependen del correo, cambiarlo
     * libremente abriría más problemas de los que resuelve (habría que
     * volver a verificarlo, revocar tokens, etc.).
     */
    public function actualizarPerfil(Request $request)
    {
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $usuario = $request->user();
        $usuario->update($datos);

        return response()->json(new UsuarioResource($usuario));
    }

    /**
     * PATCH /api/me/password
     * Cambio de contraseña estando logueado (distinto del flujo de
     * "olvidé mi contraseña", que va por correo). Pide la contraseña
     * actual para confirmar que de verdad es el dueño de la cuenta.
     */
    public function actualizarContrasena(Request $request)
    {
        $datos = $request->validate([
            'contrasena_actual' => ['required', 'string'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).+$/',
            ],
        ], [
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.regex' => 'La contraseña debe incluir al menos una mayúscula, un número y un carácter especial.',
            'password.confirmed' => 'Las contraseñas nuevas no coinciden.',
        ]);

        $usuario = $request->user();

        if (!Hash::check($datos['contrasena_actual'], $usuario->password)) {
            throw ValidationException::withMessages([
                'contrasena_actual' => 'La contraseña actual no es correcta.',
            ]);
        }

        $usuario->update(['password' => Hash::make($datos['password'])]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    /**
     * POST /api/forgot-password
     * Usa el sistema de recuperación de contraseña que Laravel ya trae
     * integrado (tabla password_reset_tokens). El link que se manda por
     * correo apunta al frontend, gracias a que configuramos
     * ResetPassword::createUrlUsing en AppServiceProvider.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $estado = Password::sendResetLink($request->only('email'));

        if ($estado !== Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'No se pudo enviar el enlace de recuperación.'], 422);
        }

        return response()->json(['message' => 'Te enviamos un enlace para recuperar tu contraseña.']);
    }

    /**
     * POST /api/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).+$/',
            ],
        ]);

        $estado = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $usuario, string $password) {
                $usuario->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        if ($estado !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'El enlace no es válido o ya expiró.'], 422);
        }

        return response()->json(['message' => 'Tu contraseña se actualizó correctamente.']);
    }

    /**
     * GET /api/auth/google/redirect
     * El frontend navega el navegador completo hasta esta ruta (no es
     * una llamada de axios, es un <a href> o window.location.href),
     * y esta ruta manda al usuario a la pantalla de Google para que
     * elija su cuenta y acepte los permisos.
     *
     * Usamos "stateless" porque esta API no usa sesiones de navegador
     * (usamos tokens de Sanctum), así que no hay nada que Socialite
     * necesite guardar en sesión entre el redirect y el callback.
     */
    public function googleRedirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * GET /api/auth/google/callback
     * Aquí regresa Google después de que el usuario acepta. Si el
     * correo ya existe en nuestra base (porque se había registrado
     * normal), simplemente lo vinculamos con su cuenta de Google en
     * vez de crear un usuario duplicado. Si es nuevo, lo creamos con
     * rol "viajero" (igual que el registro normal) y le mandamos el
     * mismo correo de bienvenida.
     *
     * Al final redirige al frontend con el token de Sanctum como
     * parámetro en la URL — el frontend lo recoge en la pantalla de
     * Login y lo guarda, exactamente igual que un login normal.
     */
    public function googleCallback()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $e) {
            return redirect($frontendUrl . '/login?google_error=1');
        }

        $usuario = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($usuario) {
            if (!$usuario->google_id) {
                $usuario->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            $usuario = User::create([
                'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'Usuario de Google'),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                // Nunca la va a usar (siempre entra por Google), pero
                // la columna es obligatoria en la base de datos.
                'password' => Hash::make(Str::random(40)),
                'role' => 'viajero',
                'email_verified_at' => now(), // Google ya confirmó que el correo es suyo
            ]);

            $usuario->notify(new BienvenidaNotification());
            Notificacion::create([
                'user_id' => $usuario->id,
                'canal' => 'correo',
                'mensaje' => 'Correo de bienvenida enviado (registro con Google).',
            ]);
        }

        $token = $usuario->createToken('token-plango-google')->plainTextToken;

        return redirect($frontendUrl . '/login?google_token=' . $token);
    }
}