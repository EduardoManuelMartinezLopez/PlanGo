import { createContext, useContext, useEffect, useState } from 'react'
import cliente from '../api/cliente'

const AuthContext = createContext(null)

// Este Provider envuelve toda la app y guarda quién es el usuario
// autenticado (o null si nadie ha iniciado sesión). Cualquier
// componente puede leerlo con el hook useAuth() de más abajo.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al cargar la app, si ya había un token guardado, preguntamos al
  // backend quién es ese usuario (así no se pierde la sesión al
  // recargar la página).
  useEffect(() => {
    const token = localStorage.getItem('plango_token')
    if (!token) {
      setCargando(false)
      return
    }

    cliente
      .get('/me')
      .then((res) => setUsuario(res.data))
      .catch(() => localStorage.removeItem('plango_token'))
      .finally(() => setCargando(false))
  }, [])

  const iniciarSesion = async (email, password) => {
    const { data } = await cliente.post('/login', { email, password })
    localStorage.setItem('plango_token', data.token)
    setUsuario(data.usuario)
    return data.usuario
  }

  // Usado por el login con Google: el backend ya generó el token de
  // Sanctum y lo mandó como parámetro en la URL al redirigir de vuelta
  // al frontend. Aquí solo lo guardamos y preguntamos quién es.
  const iniciarSesionConToken = async (token) => {
    localStorage.setItem('plango_token', token)
    const { data } = await cliente.get('/me')
    setUsuario(data)
    return data
  }

  const cerrarSesion = async () => {
    try {
      await cliente.post('/logout')
    } finally {
      localStorage.removeItem('plango_token')
      setUsuario(null)
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, iniciarSesionConToken, cerrarSesion, setUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
