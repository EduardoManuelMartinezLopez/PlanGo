import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'

export default function Estadisticas() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cliente.get('/admin/estadisticas').then((res) => setDatos(res.data)).finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="cargando">Cargando...</div>
  if (!datos) return null

  const maxViajes = Math.max(...datos.destinos_mas_reservados.map((d) => d.total_viajes), 1)

  return (
    <div className="pagina">
      <h1>Panel de Estadísticas</h1>

      <div className="grid-tarjetas" style={{ marginBottom: 24 }}>
        <div className="tarjeta">
          <div>TOTAL DE USUARIOS</div>
          <h2>{datos.total_usuarios}</h2>
        </div>
        <div className="tarjeta">
          <div>VIAJES ACTIVOS</div>
          <h2>{datos.viajes_activos}</h2>
        </div>
        <div className="tarjeta">
          <div>INGRESOS ESTIMADOS</div>
          <h2>${Number(datos.ingresos_estimados).toLocaleString()}</h2>
        </div>
      </div>

      <h3>Destinos más reservados</h3>
      <div className="tarjeta">
        {datos.destinos_mas_reservados.map((d) => (
          <div key={d.nombre} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>{d.nombre}</span><span>{d.total_viajes}</span>
            </div>
            <div style={{ background: '#eee', borderRadius: 6, height: 10 }}>
              <div style={{
                width: `${(d.total_viajes / maxViajes) * 100}%`,
                background: 'var(--color-acento)',
                height: '100%',
                borderRadius: 6,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
