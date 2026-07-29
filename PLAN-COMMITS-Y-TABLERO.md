# PlanGo — Plan de commits finales y tablero de GitHub Projects

Esto es solo para ustedes dos, para organizar las últimas horas antes
de la entrega. La rúbrica es clara: si un integrante no tiene commits
reales, ESE integrante saca 0 sin reentrega — así que lo de aquí abajo
no es opcional, hay que repartirlo de verdad, no solo de nombre.

## Regla de oro para que los commits sean reales

Cada quien hace `git add`, `git commit` y `git push` **desde su propia
cuenta de GitHub**, de los archivos que le tocaron. No sirve que uno
suba todo y el otro solo apruebe un Pull Request sin tocar código —
eso también puede leerse como participación desigual.

## Reparto sugerido de lo que falta

### Eduardo (backend + cuentas + despliegue)

- [ ] Crear las cuentas de Twilio, Google Cloud (OAuth) y Stripe, y
      pegar las credenciales en el `.env` local
- [ ] Commit: `feat: login y registro con Google (Socialite)`
      → `backend/app/Http/Controllers/Api/AuthController.php`,
        `backend/app/Models/User.php`,
        `backend/config/services.php`,
        `backend/routes/api.php`,
        `backend/database/migrations/2026_07_29_000000_add_google_id_to_users_table.php`,
        `backend/composer.json`
- [ ] Commit: `feat: pago real con Stripe PaymentIntent`
      → `backend/app/Http/Controllers/Api/ViajeController.php`,
        `backend/config/services.php` (si no quedó ya en el commit
        anterior), `backend/routes/api.php`
- [ ] Probar todo en local, hacer `git push`
- [ ] Desplegar en el VPS — **ojo:** la carpeta correcta confirmada
      por la config de Nginx es `/var/www/PlanGo/backend`, NO la de
      ninguna actividad escolar (Act4 u otra). Antes de tocar nada en
      el VPS, confirmar con `cat /etc/nginx/sites-enabled/*` a qué
      carpeta apunta `plango.duckdns.org`
- [ ] Llenar las URLs finales en el README (dominio, API base, links
      de Figma y GitHub Projects)

### Kelly (frontend + logo + pruebas)

- [ ] Commit: `feat: botón de login con Google en Login y Registro`
      → `frontend/src/components/common/BotonGoogle.jsx`,
        `frontend/src/pages/publico/Login.jsx`,
        `frontend/src/pages/publico/Registro.jsx`,
        `frontend/src/context/AuthContext.jsx`
- [ ] Commit: `feat: logo de PlanGo en pantallas públicas y sidebar`
      → `frontend/src/components/common/LogoAuth.jsx`,
        `frontend/src/assets/logo.png`, `frontend/src/assets/logo-blanco.png`,
        `frontend/src/components/layout/Sidebar.jsx`,
        los 5 archivos de `frontend/src/pages/publico/*.jsx`
- [ ] Commit: `feat: formulario real de pago con Stripe Elements`
      → `frontend/src/lib/stripe.js`,
        `frontend/src/components/pago/FormularioPagoStripe.jsx`,
        `frontend/src/pages/viajero/DetalleViaje.jsx`,
        `frontend/package.json`
- [ ] Revisar su parte ya en el sitio desplegado (una vez que Eduardo
      termine el deploy) — probar los 3 roles, no solo el suyo
- [ ] Probar la colección de Bruno contra la URL del VPS (no
      localhost) y dejar evidencia (captura o los `.bru` actualizados)

## Tablero de GitHub Projects — mover las tarjetas

No basta con que el código exista, el tablero tiene que reflejar el
trabajo real hecho hoy. Antes de la entrega:

1. Las tareas relacionadas con Google OAuth, Stripe y logo que sigan
   en "Backlog" o "To Do" → muévanlas a "Done" (o creen tarjetas
   nuevas si no existían, una por cada commit de la lista de arriba)
2. Las tareas que ya estaban en "In Review" y ya se probaron →
   pásenlas a "Done"
3. Asignen cada tarjeta a quien de verdad hizo ese trabajo (Eduardo o
   Kelly), no las dejen sin asignar

## Checklist de las últimas horas

- [ ] Ambos tienen commits visibles en el historial de GitHub de hoy
- [ ] El tablero de GitHub Projects está actualizado y coincide con
      lo que de verdad se hizo
- [ ] El README tiene las URLs finales, no placeholders
- [ ] Alguien (Eduardo o Kelly) mandó el mensaje de "unión" al sandbox
      de WhatsApp de Twilio desde su celular, para que la demo en vivo
      funcione (ver `GUIA-DESPLIEGUE.md`, sección de Twilio)
