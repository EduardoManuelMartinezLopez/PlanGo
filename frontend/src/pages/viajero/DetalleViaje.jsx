import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import cliente from '../../api/cliente'
import Modal from '../../components/common/Modal'
import FormularioPagoStripe from '../../components/pago/FormularioPagoStripe'

export default function DetalleViaje() {
  const { id } = useParams()
  const [viaje, setViaje] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [telefono, setTelefono] = useState('')
  const [resena, setResena] = useState({ calificacion: 5, comentario: '' })
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [mensajeResena, setMensajeResena] = useState('')
  const [completando, setCompletando] = useState(false)
  const [yaResenado, setYaResenado] = useState(false)

  const cargarViaje = () => {
    setCargando(true)
    cliente.get(`/viajes/${id}`).then((res) => {
      const v = res.data.data || res.data
      setViaje(v)
      // Si el viaje ya está completado, revisamos si el usuario ya
      // dejó una reseña de ese destino, para precargar el formulario
      // en vez de dejarlo vacío (y así se vuelve "editar" en lugar de
      // mandar el formulario a ciegas otra vez).
      if (v.estado === 'completado' && v.destino?.id) {
        cliente.get(`/destinos/${v.destino.id}/mi-resena`).then((r) => {
          const existente = r.data.data
          if (existente) {
            setResena({ calificacion: existente.calificacion, comentario: existente.comentario || '' })
            setYaResenado(true)
          }
        })
      }
    }).finally(() => setCargando(false))
  }

  useEffect(() => { cargarViaje() }, [id])

  // El pago real ahora lo maneja <FormularioPagoStripe />. Cuando
  // termina con éxito, simplemente recargamos el viaje para que se
  // vea el nuevo estado "confirmado".
  const alConfirmarPago = () => {
    setMostrarPago(false)
    cargarViaje()
    window.dispatchEvent(new Event('notificaciones-actualizadas'))
  }

  const enviarResena = async (e) => {
    e.preventDefault()
    setEnviandoResena(true)
    setMensajeResena('')
    try {
      await cliente.post('/resenas', {
        destino_id: viaje.destino.id,
        calificacion: Number(resena.calificacion),
        comentario: resena.comentario,
      })
      setMensajeResena('¡Gracias por tu reseña!')
      setYaResenado(true)
    } catch {
      setMensajeResena('No se pudo guardar tu reseña.')
    } finally {
      setEnviandoResena(false)
    }
  }

  // Los viajes "confirmado" se marcan "completado" solos cuando pasa la
  // fecha_fin (proceso automático diario en el backend), pero este botón
  // deja al viajero adelantarlo manualmente si ya regresó del viaje.
  const marcarCompletado = async () => {
    setCompletando(true)
    try {
      await cliente.patch(`/viajes/${id}/completar`)
      cargarViaje()
      window.dispatchEvent(new Event('notificaciones-actualizadas'))
    } finally {
      setCompletando(false)
    }
  }

  if (cargando) return <div className="cargando">Cargando...</div>
  if (!viaje) return <div className="pagina">Viaje no encontrado.</div>

  // Gemini regresa el costo como un rango de texto, ej. "$5,000 - $10,000 MXN".
  // Por cada actividad sacamos los dos números del rango (5000 y 10000) y
  // usamos su promedio (7500) como estimado — así el total no se dispara.
  const totalItinerario = (viaje.itinerario || []).reduce((acc, act) => {
    const numeros = (act.costo_estimado || '').match(/\d[\d,]*/g) || []
    const valores = numeros
      .map((n) => parseInt(n.replace(/,/g, ''), 10))
      .filter((n) => !isNaN(n))
    if (valores.length === 0) return acc
    const promedio = valores.reduce((s, v) => s + v, 0) / valores.length
    return acc + promedio
  }, 0)

  return (
    <div className="pagina">
      <h1>{viaje.destino?.nombre}, {viaje.destino?.pais}</h1>
      <p>{viaje.fecha_inicio} — {viaje.fecha_fin} · <span className={`badge badge-${viaje.estado}`}>{viaje.estado}</span></p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 300 }}>
          <h3>Itinerario generado por IA</h3>
          {(viaje.itinerario || []).length === 0 && <p>Sin actividades registradas todavía.</p>}
          {Object.entries(
            (viaje.itinerario || []).reduce((acc, act) => {
              acc[act.dia] = acc[act.dia] || []
              acc[act.dia].push(act)
              return acc
            }, {})
          ).map(([dia, actividades]) => (
            <div key={dia} className="tarjeta" style={{ marginBottom: 12 }}>
              <strong>DÍA {dia}</strong>
              {actividades.map((act) => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span>{act.hora} — {act.actividad}</span>
                  <span style={{ color: '#6b6b63' }}>{act.costo_estimado}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          {viaje.destino?.latitud && (
            <div className="tarjeta" style={{ padding: 0, overflow: 'hidden', height: 220, marginBottom: 16 }}>
              <MapContainer center={[viaje.destino.latitud, viaje.destino.longitud]} zoom={9} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <Marker position={[viaje.destino.latitud, viaje.destino.longitud]}>
                  <Popup>{viaje.destino.nombre}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          <div className="tarjeta">
            <h3>Presupuesto Estimado</h3>
            <div>Actividades: ${Math.round(totalItinerario).toLocaleString('es-MX')}</div>
            <div>Presupuesto asignado: ${Number(viaje.presupuesto).toLocaleString('es-MX')}</div>
            <hr />
            <strong>Total estimado: ${Math.round(totalItinerario).toLocaleString('es-MX')}</strong>
          </div>

          {viaje.estado === 'planeado' && (
            <button className="btn btn-primario" style={{ width: '100%', marginTop: 16 }} onClick={() => setMostrarPago(true)}>
              Confirmar y pagar
            </button>
          )}

          {viaje.estado === 'confirmado' && (
            <button className="btn btn-secundario" style={{ width: '100%', marginTop: 16 }} onClick={marcarCompletado} disabled={completando}>
              {completando ? 'Marcando...' : '✓ Marcar viaje como completado'}
            </button>
          )}
        </div>
      </div>

      {viaje.estado === 'completado' && (
        <div className="tarjeta" style={{ marginTop: 24, maxWidth: 420 }}>
          <h3>{yaResenado ? 'Tu reseña de este destino' : 'Deja tu reseña de este destino'}</h3>
          {mensajeResena && <p>{mensajeResena}</p>}
          <form onSubmit={enviarResena}>
            <div className="campo">
              <label>Calificación</label>
              <select value={resena.calificacion} onChange={(e) => setResena({ ...resena, calificacion: e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Comentario</label>
              <textarea rows={3} value={resena.comentario} onChange={(e) => setResena({ ...resena, comentario: e.target.value })} />
            </div>
            <button className="btn btn-primario" disabled={enviandoResena}>
              {enviandoResena ? 'Guardando...' : yaResenado ? 'Actualizar reseña' : 'Enviar reseña'}
            </button>
          </form>
        </div>
      )}

      {mostrarPago && (
        <Modal titulo="Confirmar y pagar" onCerrar={() => setMostrarPago(false)}>
          <p>Vas a confirmar tu viaje a <strong>{viaje.destino?.nombre}</strong> por ${viaje.presupuesto} MXN.</p>
          <div className="campo">
            <label>Teléfono (para SMS/WhatsApp de confirmación, opcional)</label>
            <input type="tel" placeholder="+521234567890" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <FormularioPagoStripe
            viajeId={id}
            telefono={telefono}
            onExito={alConfirmarPago}
            onCancelar={() => setMostrarPago(false)}
          />
        </Modal>
      )}
    </div>
  )
}