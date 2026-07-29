import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import cliente from '../../api/cliente'
import CampoTexto from '../../components/common/CampoTexto'

export default function NuevoViaje() {
  const [parametros] = useSearchParams()
  const navigate = useNavigate()
  const [destinos, setDestinos] = useState([])
  const [form, setForm] = useState({
    destino_id: parametros.get('destino_id') || '',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: '',
    tipo_viaje: 'aventura',
  })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    cliente.get('/destinos', { params: { limit: 100 } }).then((res) => setDestinos(res.data.data))
  }, [])

  const validar = () => {
    const nuevosErrores = {}
    if (!form.destino_id) nuevosErrores.destino_id = 'Elige un destino.'
    if (!form.fecha_inicio) nuevosErrores.fecha_inicio = 'La fecha de inicio es obligatoria.'
    if (!form.fecha_fin) nuevosErrores.fecha_fin = 'La fecha de fin es obligatoria.'
    if (form.fecha_fin && form.fecha_inicio && form.fecha_fin < form.fecha_inicio) {
      nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio.'
    }
    if (!form.presupuesto || form.presupuesto <= 0) nuevosErrores.presupuesto = 'Ingresa un presupuesto válido.'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    if (!validar()) return

    setGenerando(true)
    try {
      const { data } = await cliente.post('/viajes', form)
      navigate(`/mis-viajes/${data.data?.id || data.id}`)
    } catch (err) {
      setErrorGeneral('No se pudo generar el itinerario. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="pagina">
      <div className="tarjeta" style={{ maxWidth: 480 }}>
        <h1>Planea tu próximo viaje</h1>
        <p>Define los detalles básicos y deja que nuestra inteligencia artificial construya el itinerario perfecto.</p>

        {errorGeneral && <div className="mensaje-error-api">{errorGeneral}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label>Destino</label>
            <select value={form.destino_id} onChange={(e) => setForm({ ...form, destino_id: e.target.value })}>
              <option value="">¿A dónde quieres ir?</option>
              {destinos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}, {d.pais}</option>
              ))}
            </select>
            {errores.destino_id && <div className="error-campo">{errores.destino_id}</div>}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <CampoTexto etiqueta="Fecha de inicio" type="date" value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} error={errores.fecha_inicio} />
            <CampoTexto etiqueta="Fecha de fin" type="date" value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} error={errores.fecha_fin} />
          </div>

          <CampoTexto etiqueta="Presupuesto (MXN)" type="number" value={form.presupuesto}
            onChange={(e) => setForm({ ...form, presupuesto: e.target.value })} error={errores.presupuesto} />

          <div className="campo">
            <label>Tipo de viaje</label>
            <select value={form.tipo_viaje} onChange={(e) => setForm({ ...form, tipo_viaje: e.target.value })}>
              <option value="aventura">Aventura</option>
              <option value="relax">Relax</option>
              <option value="cultural">Cultural</option>
              <option value="familiar">Familiar</option>
            </select>
          </div>

          <button className="btn btn-primario" style={{ width: '100%' }} disabled={generando}>
            {generando ? 'Generando itinerario...' : '✨ Generar itinerario con IA'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#6b6b63' }}>Impulsado por Gemini AI</p>
        </form>
      </div>
    </div>
  )
}
