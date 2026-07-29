import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import cliente from '../../api/cliente'

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [notificaciones, setNotificaciones] = useState([])
  const [mostrarDropdown, setMostrarDropdown] = useState(false)

  useEffect(() => {
    cliente.get('/notificaciones').then((res) => setNotificaciones(res.data.data || res.data))
  }, [])

  const iniciales = usuario?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleCerrarSesion = async () => {
    await cerrarSesion()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-buscador">
        <input type="text" placeholder="Buscar destino..." />
      </div>
      <div className="navbar-derecha">
        <button
          className="btn btn-secundario"
          style={{ padding: '6px 10px' }}
          onClick={() => setMostrarDropdown((v) => !v)}
        >
          🔔 {notificaciones.filter((n) => !n.leida).length > 0 && `(${notificaciones.filter((n) => !n.leida).length})`}
        </button>
        <div className="avatar" title={usuario?.name}>{iniciales}</div>
        <span>{usuario?.name}</span>
        <button className="btn btn-secundario" onClick={handleCerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      {mostrarDropdown && (
        <div className="dropdown-notificaciones">
          {notificaciones.length === 0 && (
            <div className="notificacion-item">Sin notificaciones por ahora.</div>
          )}
          {notificaciones.map((n) => (
            <div key={n.id} className="notificacion-item">
              <div>{n.mensaje}</div>
              <small>{n.canal} · {new Date(n.creado_en).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
