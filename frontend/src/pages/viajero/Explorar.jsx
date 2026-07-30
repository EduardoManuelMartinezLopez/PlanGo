import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import cliente from '../../api/cliente'

export default function Explorar() {
  const [parametros, setParametros] = useSearchParams()
  const [destinos, setDestinos] = useState([])
  const [meta, setMeta] = useState({})
  const [categorias, setCategorias] = useState([])
  const [favoritos, setFavoritos] = useState(new Set())
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const pagina = parametros.get('page') || 1
  const buscar = parametros.get('buscar') || ''
  const categoriaId = parametros.get('categoria_id') || ''

  useEffect(() => {
    cliente.get('/categorias').then((res) => setCategorias(res.data.data || res.data))
  }, [])

  useEffect(() => {
    setCargando(true)
    setError('')
    cliente
      .get('/destinos', { params: { page: pagina, buscar, categoria_id: categoriaId, limit: 9 } })
      .then((res) => {
        setDestinos(res.data.data)
        setMeta(res.data.meta)
      })
      .catch(() => setError('No se pudieron cargar los destinos. Intenta de nuevo.'))
      .finally(() => setCargando(false))
  }, [pagina, buscar, categoriaId])

  useEffect(() => {
    cliente.get('/favoritos').then((res) => {
      const ids = new Set((res.data.data || res.data).map((d) => d.id))
      setFavoritos(ids)
    })
  }, [])

  // Cambia un parámetro de la URL (buscar, categoría, o página). Si el
  // cambio es de búsqueda/categoría, regresamos a la página 1 porque los
  // resultados cambian por completo. Pero si el cambio ES la página
  // (el usuario dio clic en un número de paginación), no la reseteamos,
  // o nunca podríamos avanzar de la página 1.
  const actualizarParametro = (clave, valor) => {
    const nuevos = new URLSearchParams(parametros)
    nuevos.set(clave, valor)
    if (clave !== 'page') {
      nuevos.set('page', 1)
    }
    setParametros(nuevos)
  }

  const alternarFavorito = async (id) => {
    await cliente.post(`/favoritos/${id}`)
    setFavoritos((prev) => {
      const copia = new Set(prev)
      copia.has(id) ? copia.delete(id) : copia.add(id)
      return copia
    })
  }

  return (
    <div className="pagina">
      <h1>Descubre tu próximo destino</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar destino..."
          defaultValue={buscar}
          style={{ maxWidth: 260 }}
          onChange={(e) => actualizarParametro('buscar', e.target.value)}
        />
        <select value={categoriaId} onChange={(e) => actualizarParametro('categoria_id', e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {error && <div className="mensaje-error-api">{error}</div>}
      {cargando && <div className="cargando">Cargando destinos...</div>}

      <div className="grid-tarjetas">
        {destinos.map((destino) => (
          <div key={destino.id} className="tarjeta" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={destino.imagen_url} alt={destino.nombre} className="tarjeta-destino-imagen" />
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{destino.nombre}</strong>
                <button className="favorito-corazon" onClick={() => alternarFavorito(destino.id)}>
                  {favoritos.has(destino.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ fontSize: 13, color: '#6b6b63' }}>{destino.pais}</div>
              <div className="estrellas">★ {destino.calificacion_promedio || 'Sin reseñas'}</div>
              <div>Desde ${destino.precio_desde}</div>
              <Link to={`/explorar/${destino.id}`} className="btn btn-secundario" style={{ marginTop: 8, textDecoration: 'none', width: '100%' }}>
                Ver detalle
              </Link>
            </div>
          </div>
        ))}
      </div>

      {meta?.last_page > 1 && (
        <div className="paginacion">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={String(n) === String(pagina) ? 'activa' : ''}
              onClick={() => actualizarParametro('page', n)}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}