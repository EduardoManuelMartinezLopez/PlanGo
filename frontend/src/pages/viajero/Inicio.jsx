import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import cliente from '../../api/cliente'
import { useAuth } from '../../context/AuthContext'

export default function Inicio() {
  const { usuario } = useAuth()

  if (usuario?.role === 'administrador') {
    return <InicioAdministrador nombre={usuario.name} />
  }

  if (usuario?.role === 'agente') {
    return <InicioAgente nombre={usuario.name} />
  }

  return <InicioViajero nombre={usuario?.name} />
}

function InicioAdministrador({ nombre }) {
  return (
    <div className="pagina">
      <h1>Bienvenido, {nombre?.split(' ')[0]}</h1>
      <p>Desde aquí puedes supervisar el sistema completo de PlanGo.</p>
      <div className="grid-tarjetas" style={{ marginTop: 24 }}>
        <Link to="/admin/estadisticas" className="tarjeta" style={{ textDecoration: 'none', color: 'inherit' }}>
          <strong>Panel de Estadísticas</strong>
          <p style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>
            Usuarios totales, viajes activos e ingresos estimados.
          </p>
        </Link>
        <Link to="/admin/usuarios" className="tarjeta" style={{ textDecoration: 'none', color: 'inherit' }}>
          <strong>Gestión de Usuarios</strong>
          <p style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>
            Administra los roles de todos los usuarios registrados.
          </p>
        </Link>
      </div>
    </div>
  )
}

function InicioAgente({ nombre }) {
  return (
    <div className="pagina">
      <h1>Bienvenido, {nombre?.split(' ')[0]}</h1>
      <p>Desde aquí puedes gestionar el catálogo de destinos de PlanGo.</p>
      <div className="grid-tarjetas" style={{ marginTop: 24 }}>
        <Link to="/agente/destinos" className="tarjeta" style={{ textDecoration: 'none', color: 'inherit' }}>
          <strong>Gestión de Destinos</strong>
          <p style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>
            Crea, edita y elimina los destinos disponibles.
          </p>
        </Link>
        <Link to="/agente/categorias" className="tarjeta" style={{ textDecoration: 'none', color: 'inherit' }}>
          <strong>Gestión de Categorías</strong>
          <p style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>
            Administra las categorías que se usan para filtrar destinos.
          </p>
        </Link>
      </div>
    </div>
  )
}

function InicioViajero({ nombre }) {
  const [viajes, setViajes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cliente.get('/viajes?limit=5')
      .then((res) => setViajes(res.data.data))
      .finally(() => setCargando(false))
  }, [])

  const proximoViaje = viajes.find((v) => v.estado === 'confirmado') || viajes[0]

  return (
    <div className="pagina">
      <h1>Hola, {nombre?.split(' ')[0]}!! ¿A dónde vamos ahora?</h1>
      <p>Tu itinerario está listo para despegar.</p>

      <div className="grid-tarjetas" style={{ marginBottom: 24 }}>
        <div className="tarjeta">
          <div>VIAJES PLANEADOS</div>
          <h2>{viajes.length}</h2>
        </div>
        {proximoViaje && (
          <div className="tarjeta">
            <div>PRÓXIMO VIAJE</div>
            <h2>{proximoViaje.destino?.nombre}</h2>
            <small>{proximoViaje.fecha_inicio}</small>
          </div>
        )}
      </div>

      <h3>Viajes Recientes</h3>
      {cargando && <div className="cargando">Cargando...</div>}
      <div className="grid-tarjetas">
        {viajes.map((viaje) => (
          <Link key={viaje.id} to={`/mis-viajes/${viaje.id}`} className="tarjeta" style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>{viaje.destino?.nombre}</strong>
            <div><span className={`badge badge-${viaje.estado}`}>{viaje.estado}</span></div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link className="btn btn-primario" to="/explorar" style={{ textDecoration: 'none' }}>Explorar destinos</Link>
        <Link className="btn btn-secundario" to="/nuevo-viaje" style={{ textDecoration: 'none' }}>Planear nuevo viaje</Link>
      </div>
    </div>
  )
}