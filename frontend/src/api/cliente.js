import axios from 'axios'

// Todas las peticiones al backend pasan por aquí. Cambia VITE_API_URL
// en tu archivo .env del frontend según dónde esté corriendo tu API
// (local o en el VPS).
const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

// Antes de cada petición, si hay un token guardado, lo mandamos en el
// header Authorization automáticamente — así no hay que acordarse de
// hacerlo en cada llamada.
cliente.interceptors.request.use((config) => {
  const token = localStorage.getItem('plango_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el backend responde 401 (token vencido o inválido), mandamos al
// usuario de regreso al login automáticamente.
cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('plango_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default cliente
