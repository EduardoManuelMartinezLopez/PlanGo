import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Envuelve cualquier página que requiera sesión iniciada. Si además se
 * le pasa "rolesPermitidos", solo deja pasar a esos roles — así es como
 * ocultamos/bloqueamos rutas según el rol en React, como pide la rúbrica.
 */
export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <div className="cargando">Cargando...</div>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
