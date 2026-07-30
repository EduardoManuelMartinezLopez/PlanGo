import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import cliente from '../../api/cliente'
import CampoContrasena from '../../components/common/CampoContrasena'
import LogoAuth from '../../components/common/LogoAuth'

const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/

export default function RestablecerContrasena() {
  const [parametros] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [errorCampo, setErrorCampo] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrorCampo('')

    if (!REGEX_PASSWORD.test(form.password)) {
      setErrorCampo('Mínimo 8 caracteres, con 1 mayúscula, 1 número y 1 carácter especial.')
      return
    }

    setCargando(true)
    try {
      await cliente.post('/reset-password', {
        ...form,
        token: parametros.get('token'),
        email: parametros.get('email'),
      })
      navigate('/login')
    } catch {
      setError('El enlace no es válido o ya expiró. Solicita uno nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor-auth">
      <div className="panel-boleto">
        <LogoAuth />
        <h1>Nueva contraseña</h1>
        {error && <div className="mensaje-error-api">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <CampoContrasena
            etiqueta="Nueva contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errorCampo}
          />
          <CampoContrasena
            etiqueta="Confirmar contraseña"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          />
          <button className="btn btn-primario" style={{ width: '100%' }} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}