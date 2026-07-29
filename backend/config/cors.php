<?php

/**
 * Configuración de CORS: le permite al frontend (que vive en otro
 * puerto/dominio) hacer peticiones a esta API sin que el navegador las
 * bloquee. En local es localhost:5173; en el VPS, cambia FRONTEND_URL.
 */
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
