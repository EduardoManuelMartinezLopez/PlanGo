import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import cliente from '../../api/cliente'
import CampoContrasena from '../../components/common/CampoContrasena'

const ROL_LEGIBLE = { viajero: 'Viajero', agente: 'Agente de Viajes', administrador: 'Administrador' }

export default function Configuracion() {
  const { usuario, setUsuario } = useAuth()
  const [reenviando, setReenviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // --- Editar nombre ---
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nombre, setNombre] = useState(usuario?.name || '')
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [errorNombre, setErrorNombre] = useState('')
  const [mensajeNombre, setMensajeNombre] = useState('')

  // --- Cambiar contraseña ---
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [formPassword, setFormPassword] = useState({
    contrasena_actual: '',
    password: '',
    password_confirmation: '',
  })
  const [erroresPassword, setErroresPassword] = useState({})
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [mensajePassword, setMensajePassword] = useState('')

  const reenviarVerificacion = async () => {
    setReenviando(true)
    setMensaje('')
    try {
      await cliente.post('/email/reenviar')
      setMensaje('Correo de verificación reenviado.')
    } catch {
      setMensaje('No se pudo reenviar el correo.')
    } finally {
      setReenviando(false)
    }
  }

  const guardarNombre = async (e) => {
    e.preventDefault()
    setGuardandoNombre(true)
    setErrorNombre('')
    setMensajeNombre('')
    try {
      const { data } = await cliente.patch('/me', { name: nombre })
      setUsuario((prev) => ({ ...prev, name: data.name }))
      setMensajeNombre('Nombre actualizado.')
      setEditandoNombre(false)
    } catch (err) {
      setErrorNombre(err.response?.data?.errors?.name?.[0] || 'No se pudo actualizar el nombre.')
    } finally {
      setGuardandoNombre(false)
    }
  }

  const cambiarPassword = async (e) => {
    e.preventDefault()
    setGuardandoPassword(true)
    setErroresPassword({})
    setMensajePassword('')
    try {
      await cliente.patch('/me/password', formPassword)
      setMensajePassword('Contraseña actualizada correctamente.')
      setFormPassword({ contrasena_actual: '', password: '', password_confirmation: '' })
      setMostrarPassword(false)
    } catch (err) {
      if (err.response?.status === 422) {
        setErroresPassword(
          Object.fromEntries(Object.entries(err.response.data.errors).map(([k, v]) => [k, v[0]]))
        )
      } else {
        setMensajePassword('No se pudo actualizar la contraseña.')
      }
    } finally {
      setGuardandoPassword(false)
    }
  }

  return (
    <div className="pagina">
      <h1>Configuración de Cuenta</h1>

      <div className="tarjeta" style={{ maxWidth: 460, marginBottom: 24 }}>
        <h3>Perfil del {ROL_LEGIBLE[usuario?.role] || 'Usuario'}</h3>
        <div className="avatar" style={{ width: 60, height: 60, fontSize: 20, marginBottom: 12 }}>
          {usuario?.name?.[0]}
        </div>

        {!editandoNombre ? (
          <p>
            <strong>Nombre:</strong> {usuario?.name}{' '}
            <button
              className="enlace"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => { setNombre(usuario?.name || ''); setEditandoNombre(true); setMensajeNombre('') }}
            >
              Editar
            </button>
          </p>
        ) : (
          <form onSubmit={guardarNombre} style={{ marginBottom: 12 }}>
            <div className="campo">
              <label>Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
              {errorNombre && <div className="error-campo">{errorNombre}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primario" disabled={guardandoNombre}>
                {guardandoNombre ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" className="btn btn-secundario" onClick={() => setEditandoNombre(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
        {mensajeNombre && <p style={{ fontSize: 13, color: '#2e7d32' }}>{mensajeNombre}</p>}

        <p><strong>Correo:</strong> {usuario?.email}</p>
        <p>
          <strong>Estado de la cuenta:</strong>{' '}
          {usuario?.correo_verificado ? '✅ Identidad verificada' : '⚠️ Correo sin verificar'}
        </p>
        {!usuario?.correo_verificado && (
          <button className="btn btn-secundario" onClick={reenviarVerificacion} disabled={reenviando}>
            {reenviando ? 'Enviando...' : 'Reenviar correo de verificación'}
          </button>
        )}
        {mensaje && <p style={{ marginTop: 8 }}>{mensaje}</p>}
      </div>

      <div className="tarjeta" style={{ maxWidth: 460 }}>
        <h3>Contraseña</h3>
        {!mostrarPassword ? (
          <button className="btn btn-secundario" onClick={() => { setMostrarPassword(true); setMensajePassword('') }}>
            Cambiar contraseña
          </button>
        ) : (
          <form onSubmit={cambiarPassword}>
            <CampoContrasena
              etiqueta="Contraseña actual"
              value={formPassword.contrasena_actual}
              onChange={(e) => setFormPassword({ ...formPassword, contrasena_actual: e.target.value })}
              error={erroresPassword.contrasena_actual}
            />
            <CampoContrasena
              etiqueta="Contraseña nueva"
              value={formPassword.password}
              onChange={(e) => setFormPassword({ ...formPassword, password: e.target.value })}
              error={erroresPassword.password}
            />
            <CampoContrasena
              etiqueta="Confirmar contraseña nueva"
              value={formPassword.password_confirmation}
              onChange={(e) => setFormPassword({ ...formPassword, password_confirmation: e.target.value })}
            />
            <p style={{ fontSize: 12, color: '#6b6b63' }}>
              Mínimo 8 caracteres, con al menos una mayúscula, un número y un carácter especial.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primario" disabled={guardandoPassword}>
                {guardandoPassword ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
              <button type="button" className="btn btn-secundario" onClick={() => setMostrarPassword(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
        {mensajePassword && <p style={{ marginTop: 8, fontSize: 13 }}>{mensajePassword}</p>}
      </div>
    </div>
  )
}