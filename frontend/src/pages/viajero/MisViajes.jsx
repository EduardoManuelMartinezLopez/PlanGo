import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import cliente from '../../api/cliente'
import ModalConfirmar from '../../components/common/ModalConfirmar'

export default function MisViajes() {
  const [parametros, setParametros] = useSearchParams()
  const [viajes, setViajes] = useState([])
  const [meta, setMeta] = useState({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Viaje pendiente de eliminar (para el modal de confirmación)
  const [porBorrar, setPorBorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  const pagina = parametros.get('page') || 1
  const estado = parametros.get('estado') || ''

  const cargar = () => {
    setCargando(true)
    setError('')
    cliente
      .get('/viajes', { params: { page: pagina, estado, limit: 8 } })
      .then((res) => {
        setViajes(res.data.data)
        setMeta(res.data.meta)
      })
      .catch(() => setError('No se pudieron cargar tus viajes.'))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [pagina, estado])

  const cambiarFiltro = (nuevoEstado) => {
    const nuevos = new URLSearchParams(parametros)
    nuevos.set('estado', nuevoEstado)
    nuevos.set('page', 1)
    setParametros(nuevos)
  }

  const eliminar = async () => {
    setBorrando(true)
    try {
      await cliente.delete(`/viajes/${porBorrar.id}`)
      setPorBorrar(null)
      cargar()
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="pagina">
      <h1>Mis Viajes Guardados</h1>

      <div style={{ marginBottom: 16 }}>
        <select value={estado} onChange={(e) => cambiarFiltro(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">Todos los estados</option>
          <option value="planeado">Planeado</option>
          <option value="confirmado">Confirmado</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {error && <div className="mensaje-error-api">{error}</div>}
      {cargando && <div className="cargando">Cargando...</div>}
      {!cargando && viajes.length === 0 && <p>Todavía no tienes viajes planeados.</p>}

      <table className="tabla">
        <thead>
          <tr><th>Destino</th><th>Fechas</th><th>Presupuesto</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr key={v.id}>
              <td>{v.destino?.nombre}</td>
              <td>{v.fecha_inicio} — {v.fecha_fin}</td>
              <td>${v.presupuesto}</td>
              <td><span className={`badge badge-${v.estado}`}>{v.estado}</span></td>
              <td>
                <Link className="enlace" to={`/mis-viajes/${v.id}`} style={{ marginRight: 12 }}>Ver detalles</Link>
                <button
                  className="enlace"
                  style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setPorBorrar(v)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta?.last_page > 1 && (
        <div className="paginacion">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={String(n) === String(pagina) ? 'activa' : ''}
              onClick={() => {
                const nuevos = new URLSearchParams(parametros)
                nuevos.set('page', n)
                setParametros(nuevos)
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {porBorrar && (
        <ModalConfirmar
          titulo="Eliminar viaje"
          mensaje={`¿Seguro que quieres eliminar tu viaje a "${porBorrar.destino?.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={eliminar}
          onCancelar={() => setPorBorrar(null)}
          cargando={borrando}
        />
      )}
    </div>
  )
}