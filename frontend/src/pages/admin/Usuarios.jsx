import { useEffect, useState } from 'react'
import cliente from '../../api/cliente'
import ModalConfirmar from '../../components/common/ModalConfirmar'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [meta, setMeta] = useState({})
  const [pagina, setPagina] = useState(1)
  const [filtroRol, setFiltroRol] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Cambio de rol pendiente de confirmar: { usuario, nuevoRol }
  const [cambioPendiente, setCambioPendiente] = useState(null)
  const [guardandoRol, setGuardandoRol] = useState(false)

  // Usuario pendiente de eliminar
  const [porBorrar, setPorBorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  const cargar = () => {
    setCargando(true)
    cliente.get('/admin/usuarios', { params: { page: pagina, role: filtroRol, limit: 10 } })
      .then((res) => { setUsuarios(res.data.data); setMeta(res.data.meta) })
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [pagina, filtroRol])

  // El <select> ya no cambia el rol directo: solo abre el modal de
  // confirmación. El cambio real ocurre en confirmarCambioRol().
  const pedirCambioRol = (usuario, nuevoRol) => {
    if (nuevoRol === usuario.role) return
    setError('')
    setCambioPendiente({ usuario, nuevoRol })
  }

  const confirmarCambioRol = async () => {
    setGuardandoRol(true)
    try {
      await cliente.patch(`/admin/usuarios/${cambioPendiente.usuario.id}/rol`, { role: cambioPendiente.nuevoRol })
      setCambioPendiente(null)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar el rol.')
      setCambioPendiente(null)
    } finally {
      setGuardandoRol(false)
    }
  }

  const confirmarEliminar = async () => {
    setBorrando(true)
    try {
      await cliente.delete(`/admin/usuarios/${porBorrar.id}`)
      setPorBorrar(null)
      cargar()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el usuario.')
      setPorBorrar(null)
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div className="pagina">
      <h1>Gestión de Usuarios</h1>

      <select value={filtroRol} onChange={(e) => { setFiltroRol(e.target.value); setPagina(1) }} style={{ maxWidth: 220, marginBottom: 16 }}>
        <option value="">Todos los roles</option>
        <option value="viajero">Viajero</option>
        <option value="agente">Agente de viajes</option>
        <option value="administrador">Administrador</option>
      </select>

      {error && <div className="mensaje-error-api">{error}</div>}
      {cargando && <div className="cargando">Cargando...</div>}

      <table className="tabla">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Verificado</th><th></th></tr></thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => pedirCambioRol(u, e.target.value)}>
                  <option value="viajero">Viajero</option>
                  <option value="agente">Agente</option>
                  <option value="administrador">Administrador</option>
                </select>
              </td>
              <td>{u.correo_verificado ? '✅' : '⚠️'}</td>
              <td>
                <button
                  className="enlace"
                  style={{ color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setPorBorrar(u)}
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
            <button key={n} className={n === pagina ? 'activa' : ''} onClick={() => setPagina(n)}>{n}</button>
          ))}
        </div>
      )}

      {cambioPendiente && (
        <ModalConfirmar
          titulo="Cambiar rol de usuario"
          mensaje={`¿Seguro que quieres cambiar el rol de "${cambioPendiente.usuario.name}" de ${cambioPendiente.usuario.role} a ${cambioPendiente.nuevoRol}? Esto cambia sus permisos de inmediato.`}
          onConfirmar={confirmarCambioRol}
          onCancelar={() => setCambioPendiente(null)}
          cargando={guardandoRol}
        />
      )}

      {porBorrar && (
        <ModalConfirmar
          titulo="Eliminar usuario"
          mensaje={`¿Seguro que quieres eliminar a "${porBorrar.name}"? Se borrarán también sus viajes, reseñas, favoritos y notificaciones. Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setPorBorrar(null)}
          cargando={borrando}
        />
      )}
    </div>
  )
}