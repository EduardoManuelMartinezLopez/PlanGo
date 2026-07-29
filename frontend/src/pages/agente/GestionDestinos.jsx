import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'
import Modal from '../../components/common/Modal'
import ModalConfirmar from '../../components/common/ModalConfirmar'
import CampoTexto from '../../components/common/CampoTexto'

const FORM_VACIO = { nombre: '', pais: '', descripcion: '', precio_desde: '', imagen_url: '', latitud: '', longitud: '', categorias: [] }

export default function GestionDestinos() {
  const [destinos, setDestinos] = useState([])
  const [meta, setMeta] = useState({})
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Todas las categorías disponibles, para mostrarlas como checkboxes
  // en el formulario de nuevo/editar destino.
  const [categorias, setCategorias] = useState([])

  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [porBorrar, setPorBorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  // Estado para el botón de "buscar coordenadas automáticamente"
  const [buscandoCoords, setBuscandoCoords] = useState(false)
  const [mensajeCoords, setMensajeCoords] = useState('')

  const cargar = () => {
    setCargando(true)
    cliente.get('/destinos', { params: { page: pagina, limit: 10 } })
      .then((res) => { setDestinos(res.data.data); setMeta(res.data.meta) })
      .catch(() => setError('No se pudieron cargar los destinos.'))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [pagina])

  // Las categorías se cargan una sola vez, no dependen de la página.
  useEffect(() => {
    cliente.get('/categorias')
      .then((res) => setCategorias(res.data.data))
      .catch(() => {})
  }, [])

  const abrirNuevo = () => { setEditando(null); setForm(FORM_VACIO); setErrores({}); setMensajeCoords(''); setMostrarForm(true) }
  const abrirEditar = (d) => {
    setEditando(d)
    setForm({
      nombre: d.nombre,
      pais: d.pais,
      descripcion: d.descripcion || '',
      precio_desde: d.precio_desde,
      imagen_url: d.imagen_url || '',
      latitud: d.latitud ?? '',
      longitud: d.longitud ?? '',
      // d.categorias viene del backend como [{id, nombre, icono}, ...]
      categorias: (d.categorias || []).map((c) => c.id),
    })
    setErrores({})
    setMensajeCoords('')
    setMostrarForm(true)
  }

  // Marca/desmarca una categoría en el arreglo de categorías seleccionadas.
  const alternarCategoria = (id) => {
    setForm((f) => ({
      ...f,
      categorias: f.categorias.includes(id)
        ? f.categorias.filter((c) => c !== id)
        : [...f.categorias, id],
    }))
  }

  // Busca automáticamente la latitud/longitud del destino usando Nominatim
  // (el servicio gratuito de OpenStreetMap, el mismo que dibuja el mapa en
  // la app) — así el agente no tiene que ir a copiar coordenadas a mano
  // desde Google Maps.
  const buscarCoordenadas = async () => {
    if (!form.nombre.trim()) {
      setMensajeCoords('Escribe primero el nombre del destino.')
      return
    }
    setBuscandoCoords(true)
    setMensajeCoords('')
    try {
      const consulta = encodeURIComponent(`${form.nombre}, ${form.pais}`)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${consulta}&format=json&limit=1`)
      const resultados = await res.json()
      if (resultados.length === 0) {
        setMensajeCoords('No se encontraron coordenadas para ese lugar. Puedes escribirlas manualmente.')
        return
      }
      setForm((f) => ({ ...f, latitud: resultados[0].lat, longitud: resultados[0].lon }))
      setMensajeCoords('✅ Coordenadas encontradas y llenadas automáticamente.')
    } catch {
      setMensajeCoords('No se pudo conectar con el servicio de mapas. Puedes escribirlas manualmente.')
    } finally {
      setBuscandoCoords(false)
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      // Si el agente deja lat/long en blanco, mandamos null (no "") para
      // que la regla "nullable" del backend los acepte sin marcar error.
      const datos = {
        ...form,
        latitud: form.latitud === '' ? null : form.latitud,
        longitud: form.longitud === '' ? null : form.longitud,
      }
      if (editando) {
        await cliente.put(`/destinos/${editando.id}`, datos)
      } else {
        await cliente.post('/destinos', datos)
      }
      setMostrarForm(false)
      cargar()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrores(Object.fromEntries(Object.entries(err.response.data.errors).map(([k, v]) => [k, v[0]])))
      }
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    setBorrando(true)
    try {
      await cliente.delete(`/destinos/${porBorrar.id}`)
      setPorBorrar(null)
      cargar()
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="pagina">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Gestión de Destinos</h1>
        <button className="btn btn-primario" onClick={abrirNuevo}>+ Nuevo destino</button>
      </div>

      {error && <div className="mensaje-error-api">{error}</div>}
      {cargando && <div className="cargando">Cargando...</div>}

      <table className="tabla">
        <thead><tr><th>Nombre</th><th>País</th><th>Categorías</th><th>Precio desde</th><th></th></tr></thead>
        <tbody>
          {destinos.map((d) => (
            <tr key={d.id}>
              <td>{d.nombre}</td>
              <td>{d.pais}</td>
              <td>{(d.categorias || []).map((c) => c.nombre).join(', ') || '—'}</td>
              <td>${d.precio_desde}</td>
              <td>
                <button className="enlace" style={{ marginRight: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => abrirEditar(d)}>Editar</button>
                <button className="enlace" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setPorBorrar(d)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meta?.last_page > 1 && (
        <div className="paginacion">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((n) => (
            <button key={n} className={n === pagina ? 'activa' : ''} onClick={() => setPagina(n)}>{n}</button>
          ))}
        </div>
      )}

      {mostrarForm && (
        <Modal titulo={editando ? 'Editar destino' : 'Nuevo destino'} onCerrar={() => setMostrarForm(false)}>
          <form onSubmit={guardar} noValidate>
            <CampoTexto etiqueta="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errores.nombre} />
            <CampoTexto etiqueta="País" value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} error={errores.pais} />
            <CampoTexto etiqueta="Precio desde" type="number" value={form.precio_desde} onChange={(e) => setForm({ ...form, precio_desde: e.target.value })} error={errores.precio_desde} />
            <CampoTexto etiqueta="URL de imagen" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 4 }}>
              <button
                type="button"
                className="btn btn-secundario"
                onClick={buscarCoordenadas}
                disabled={buscandoCoords}
              >
                {buscandoCoords ? 'Buscando...' : '📍 Buscar coordenadas automáticamente'}
              </button>
            </div>
            {mensajeCoords && (
              <p style={{ fontSize: 13, marginTop: -4, marginBottom: 8 }}>{mensajeCoords}</p>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <CampoTexto
                  etiqueta="Latitud (opcional)"
                  type="number"
                  step="any"
                  value={form.latitud}
                  onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                  error={errores.latitud}
                />
              </div>
              <div style={{ flex: 1 }}>
                <CampoTexto
                  etiqueta="Longitud (opcional)"
                  type="number"
                  step="any"
                  value={form.longitud}
                  onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                  error={errores.longitud}
                />
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#6b6b63', marginTop: -8 }}>
              Escribe el nombre y el país, luego dale clic al botón de
              arriba para llenar la latitud y longitud automáticamente. Sin
              estos datos el destino se guarda igual, solo que no se mostrará
              el mapa en la pantalla de detalle del viaje.
            </p>
            <div className="campo">
              <label>Descripción</label>
              <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>

            <div className="campo">
              <label>Categorías</label>
              {categorias.length === 0 && <p style={{ fontSize: 13, opacity: 0.7 }}>No hay categorías creadas todavía.</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 4 }}>
                {categorias.map((c) => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      checked={form.categorias.includes(c.id)}
                      onChange={() => alternarCategoria(c.id)}
                    />
                    {c.nombre}
                  </label>
                ))}
              </div>
              {errores.categorias && <div className="error-campo">{errores.categorias}</div>}
            </div>

            <button className="btn btn-primario" style={{ width: '100%' }} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </Modal>
      )}

      {porBorrar && (
        <ModalConfirmar
          titulo="Eliminar destino"
          mensaje={`¿Seguro que quieres eliminar "${porBorrar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirmar={eliminar}
          onCancelar={() => setPorBorrar(null)}
          cargando={borrando}
        />
      )}
    </div>
  )
}