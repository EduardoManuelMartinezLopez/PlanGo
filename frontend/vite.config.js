import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite. El "base" es importante para el despliegue en
// el VPS: si tu app va a vivir en una subcarpeta (ej. tuservidor.com/plango),
// cámbialo por ese path; si va en la raíz del dominio, déjalo en '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
  },
})
