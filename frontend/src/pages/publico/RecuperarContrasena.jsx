import { useState } from 'react'
import { Link } from 'react-router-dom'
import cliente from '../../api/cliente'
import CampoTexto from '../../components/common/CampoTexto'
import LogoAuth from '../../components/common/LogoAuth'

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await cliente.post('/forgot-password', { email })
      setEnviado(true)
    } catch {
      setError('No se pudo enviar el enlace. Verifica tu correo.')
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="contenedor-auth">
        <div className="panel-boleto" style={{ textAlign: 'center' }}>
          <LogoAuth />
          <h1>Revisa tu correo</h1>
          <p>Te enviamos un enlace para continuar con la recuperación de tu contraseña.</p>
          <Link className="enlace" to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="contenedor-auth">
      <div className="panel-boleto">
        <LogoAuth />
        <h1>Recuperar Acceso</h1>
        <p>Ingresa tu correo electrónico para recuperar tu contraseña.</p>
        {error && <div className="mensaje-error-api">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <CampoTexto etiqueta="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primario" style={{ width: '100%' }} disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar instrucciones ▷'}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link className="enlace" to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  )
}
