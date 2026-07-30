# PlanGo — Frontend (proyecto completo, instalación desde cero)

Sigue esto DESPUÉS de terminar `backend/INSTRUCCIONES-BACKEND.md` y de
dejar el backend corriendo con `php artisan serve` (ábrelo en otra
ventana de PowerShell aparte y déjalo corriendo — el frontend lo
necesita prendido todo el tiempo).

## 1. Instalar las dependencias

Abre una PowerShell **nueva** (deja la del backend corriendo aparte) y
entra a la carpeta `frontend` (donde está este archivo):

```powershell
npm install
```

Esto descarga React, Vite, y todo lo demás (incluido Stripe.js para el
formulario de pago). Puede tardar unos minutos la primera vez.

## 2. Tu archivo .env

Ya viene un archivo `.env` con lo básico (la URL del backend en
local). Ábrelo con VS Code y confirma que diga:

```
VITE_API_URL=http://127.0.0.1:8000/api
```

Deja `VITE_STRIPE_PUBLIC_KEY` vacío por ahora — sin ella, el formulario
de pago avisa que falta configurarse, pero el resto de la app funciona
normal. Cuando tengas tu llave de Stripe (ver `GUIA-DESPLIEGUE.md`),
la pegas ahí y reinicias `npm run dev`.

## 3. Correr el proyecto

```powershell
npm run dev
```

Te va a dar una URL, normalmente `http://localhost:5173`. Ábrela en tu
navegador.

## 4. Probar que todo esté conectado

1. Deberías ver la pantalla de Login de PlanGo con el logo.
2. Entra con `developer@plango.test` / `Developer#2026` (viene del
   seeder del backend).
3. Si ves destinos de viaje reales en "Explorar", el frontend y el
   backend ya están hablando entre sí correctamente.

## Si algo no carga / pantalla en blanco

- Abre la consola del navegador (F12 → pestaña "Console") y lee el
  error — casi siempre dice exactamente qué archivo falta.
- Confirma que el backend (`php artisan serve`) siga corriendo en su
  propia ventana — si lo cerraste, el frontend no tiene con quién
  hablar y muchas pantallas se quedan cargando para siempre.
- Si cambiaste el `.env` del frontend, tienes que **reiniciar**
  `npm run dev` (Ctrl+C y volver a correrlo) — Vite no relee el `.env`
  solo.

## Estructura rápida (por si te pierdes)

```
frontend/src/
  api/cliente.js         → configuración de Axios (URL del backend, token)
  context/AuthContext.jsx → quién es el usuario logueado, en toda la app
  components/             → piezas reutilizables (Navbar, Sidebar, Modal...)
  pages/publico/           → Login, Registro, recuperar/restablecer contraseña
  pages/viajero/           → pantallas que ve un viajero
  pages/agente/            → pantallas que ve un agente de viajes
  pages/admin/             → pantallas que ve un administrador
  styles/global.css        → todos los estilos del proyecto, un solo archivo
```

## Para la entrega (documentación que pide la rúbrica)

El `npm run build` genera la versión de producción (la que se sube al
VPS, ya optimizada) — pero eso se hace hasta la parte del despliegue,
no en tu máquina local. Ver `GUIA-DESPLIEGUE.md`.
