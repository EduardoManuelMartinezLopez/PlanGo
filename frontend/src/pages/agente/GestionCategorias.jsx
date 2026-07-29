import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'
import Modal from '../../components/common/Modal'
import ModalConfirmar from '../../components/common/ModalConfirmar'
import CampoTexto from '../../components/common/CampoTexto'

export default function GestionCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [nombre, setNombre] = useState('')
  const [porBorrar, setPorBorrar] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargar = () => {
    setCargando(true)
    cliente.get('/categorias').then((res) => setCategorias(res.data.data || res.data)).finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const abrirNuevo = () => { setEditando(null); setNombre(''); setMostrarForm(true) }
  const abrirEditar = (c) => { setEditando(c); setNombre(c.nombre); setMostrarForm(true) }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (editando) {
        await cliente.put(`/categorias/${editando.id}`, { nombre })
      } else {
        await cliente.post('/categorias', { nombre })
      }
      setMostrarForm(false)
      cargar()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    await cliente.delete(`/categorias/${porBorrar.id}`)
    setPorBorrar(null)
    cargar()
  }

  return (
    <div className="pagina">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Gestión de Categorías</h1>
        <button className="btn btn-primario" onClick={abrirNuevo}>+ Nueva categoría</button>
      </div>

      {cargando && <div className="cargando">Cargando...</div>}
      <table className="tabla">
        <thead><tr><th>Nombre</th><th></th></tr></thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>
                <button className="enlace" style={{ marginRight: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => abrirEditar(c)}>Editar</button>
                <button className="enlace" style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setPorBorrar(c)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarForm && (
        <Modal titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onCerrar={() => setMostrarForm(false)}>
          <form onSubmit={guardar}>
            <CampoTexto etiqueta="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <button className="btn btn-primario" style={{ width: '100%' }} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </Modal>
      )}

      {porBorrar && (
        <ModalConfirmar
          titulo="Eliminar categoría"
          mensaje={`¿Seguro que quieres eliminar "${porBorrar.nombre}"?`}
          onConfirmar={eliminar}
          onCancelar={() => setPorBorrar(null)}
        />
      )}
    </div>
  )
}
