# PlanGo — Backend (proyecto completo, instalación desde cero)

Este ya es un proyecto Laravel completo — no necesitas tener nada
creado antes. Solo sigue estos pasos en orden.

## 1. Instalar las dependencias

Abre PowerShell dentro de la carpeta `backend` (donde está este
archivo) y corre:

```powershell
composer install
```

Esto va a tardar unos minutos — descarga Laravel y todos los paquetes
que el proyecto necesita (incluido Sanctum y el SDK de Twilio).

## 2. Tu archivo .env

⚠️ **Este proyecto YA trae un `.env` real, con el correo, Gemini,
Twilio, Google y Stripe ya configurados.** NO corras
`copy .env.example .env` — eso borraría todo y lo reemplazaría con la
plantilla vacía (esto ya nos pasó una vez, así que evítalo).

Solo abre el `.env` que ya viene en la carpeta con VS Code y confirma
que tenga tu contraseña real de MySQL en el siguiente paso.

## 3. Configurar tu base de datos

Abre el archivo `.env` que acabas de crear con VS Code. Busca estas
líneas y pon tu contraseña real de MySQL:

```
DB_DATABASE=plango_db
DB_USERNAME=root
DB_PASSWORD=aqui_tu_contraseña_de_mysql
```

Si todavía no existe la base de datos, créala. En PowerShell:

```powershell
mysql -u root -p
```

Y dentro de MySQL:

```sql
CREATE DATABASE plango_db;
exit;
```

## 4. Generar la clave de la aplicación

Ahora que ya existe el `.env`, esto sí va a funcionar:

```powershell
php artisan key:generate
```

## 5. Migrar y sembrar los datos de prueba

```powershell
php artisan migrate:fresh --seed
```

## 6. Correr el servidor

```powershell
php artisan serve
```

Abre `http://127.0.0.1:8000/api/destinos` en tu navegador. Si ves un
JSON con destinos de viaje, todo está funcionando.

## 7. IMPORTANTE: correr también el worker de colas

Los correos (bienvenida, verificación, recuperar contraseña,
confirmación de viaje) se mandan **en segundo plano** para que la
pantalla no se quede esperando a que termine de hablar con Gmail. Pero
eso significa que, sin este paso, **los correos nunca se mandan** — se
quedan esperando en la tabla `jobs` para siempre.

Abre una PowerShell **nueva** (deja `php artisan serve` corriendo en
la suya), entra a la carpeta `backend`, y corre:

```powershell
php artisan queue:listen
```

Déjala corriendo todo el tiempo que uses el proyecto — verás ahí mismo
los correos procesándose en vivo, línea por línea, útil para detectar
errores si alguno no llega.

## Usuarios de prueba (ya cargados por el seeder)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@plango.test | Admin#2026 |
| Agente de viajes | agente@plango.test | Agente#2026 |
| Viajero (developer) | developer@plango.test | Developer#2026 |

## Conectar las integraciones reales (opcional, cuando quieras)

Edita tu `.env` y llena estas líneas (están vacías por default, el
sistema funciona igual sin ellas, solo no manda nada real todavía):

```
GEMINI_API_KEY=       (créala gratis en aistudio.google.com/apikey)
TWILIO_SID=           (créala gratis en twilio.com/try-twilio)
TWILIO_TOKEN=
TWILIO_SMS_FROM=
```

Después de editar el `.env`, reinicia `php artisan serve` (Ctrl+C y
vuelve a correrlo) para que tome los cambios.

## Para la entrega (documentación que pide la rúbrica)

**Generar el respaldo .sql**, después de migrar y sembrar:
```powershell
mysqldump -u root -p plango_db > plango_backup.sql
```
Muévelo a una carpeta `database-backup/` en la raíz de tu repositorio.
