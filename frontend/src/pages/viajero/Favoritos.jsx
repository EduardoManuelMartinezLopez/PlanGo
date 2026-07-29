import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import cliente from '../../api/cliente'

export default function Favoritos() {
  const [destinos, setDestinos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cliente.get('/favoritos').then((res) => setDestinos(res.data.data || res.data)).finally(() => setCargando(false))
  }, [])

  return (
    <div className="pagina">
      <h1>Mis destinos favoritos</h1>
      {cargando && <div className="cargando">Cargando...</div>}
      {!cargando && destinos.length === 0 && <p>Aún no has marcado ningún destino como favorito.</p>}
      <div className="grid-tarjetas">
        {destinos.map((destino) => (
          <Link key={destino.id} to={`/explorar/${destino.id}`} className="tarjeta" style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
            <img src={destino.imagen_url} alt={destino.nombre} className="tarjeta-destino-imagen" />
            <div style={{ padding: 12 }}>
              <strong>{destino.nombre}</strong>
              <div>{destino.pais}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
