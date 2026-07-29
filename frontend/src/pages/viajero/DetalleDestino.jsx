import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import cliente from '../../api/cliente'

export default function DetalleDestino() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [destino, setDestino] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cliente.get(`/destinos/${id}`).then((res) => setDestino(res.data.data || res.data)).finally(() => setCargando(false))
  }, [id])

  if (cargando) return <div className="cargando">Cargando...</div>
  if (!destino) return <div className="pagina">Destino no encontrado.</div>

  return (
    <div className="pagina">
      <img src={destino.imagen_url} alt={destino.nombre} style={{ width: '100%', maxWidth: 500, borderRadius: 12 }} />
      <h1>{destino.nombre}, {destino.pais}</h1>
      <div className="estrellas">★ {destino.calificacion_promedio || 'Sin calificación'} ({destino.total_resenas || 0} reseñas)</div>
      <p>{destino.descripcion}</p>
      <p>Desde <strong>${destino.precio_desde} MXN</strong></p>

      <button className="btn btn-primario" onClick={() => navigate(`/nuevo-viaje?destino_id=${destino.id}`)}>
        Planear un viaje aquí
      </button>

      <h3 style={{ marginTop: 32 }}>Reseñas de viajeros</h3>
      {(destino.resenas || []).length === 0 && <p>Todavía no hay reseñas para este destino.</p>}
      {(destino.resenas || []).map((r) => (
        <div key={r.id} className="tarjeta" style={{ marginBottom: 8 }}>
          <strong>{r.usuario?.name || r.autor}</strong> — <span className="estrellas">{'★'.repeat(r.calificacion)}</span>
          <p>{r.comentario}</p>
        </div>
      ))}
    </div>
  )
}