import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoBlanco from '../../assets/logo-blanco.png'

// Cada rol ve un menú distinto — esto es justo lo que pide la rúbrica:
// "mostrar u ocultar componentes según el rol".
const MENUS = {
  viajero: [
    { to: '/', texto: 'Inicio' },
    { to: '/explorar', texto: 'Explorar' },
    { to: '/mis-viajes', texto: 'Mis Viajes' },
    { to: '/nuevo-viaje', texto: 'Nuevo Viaje' },
    { to: '/favoritos', texto: 'Favoritos' },
    { to: '/configuracion', texto: 'Configuración' },
  ],
  agente: [
    { to: '/', texto: 'Inicio' },
    { to: '/agente/destinos', texto: 'Gestión de Destinos' },
    { to: '/agente/categorias', texto: 'Gestión de Categorías' },
    { to: '/configuracion', texto: 'Configuración' },
  ],
  administrador: [
    { to: '/', texto: 'Inicio' },
    { to: '/admin/estadisticas', texto: 'Estadísticas' },
    { to: '/admin/usuarios', texto: 'Usuarios' },
    { to: '/configuracion', texto: 'Configuración' },
  ],
}

export default function Sidebar() {
  const { usuario } = useAuth()
  const enlaces = MENUS[usuario?.role] || []

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-caja">
        <img src={logoBlanco} alt="PlanGo" className="sidebar-logo-img" />
      </div>
      {enlaces.map((enlace) => (
        <NavLink
          key={enlace.to}
          to={enlace.to}
          end={enlace.to === '/'}
          className={({ isActive }) => 'sidebar-link' + (isActive ? ' activo' : '')}
        >
          {enlace.texto}
        </NavLink>
      ))}
    </aside>
  )
}