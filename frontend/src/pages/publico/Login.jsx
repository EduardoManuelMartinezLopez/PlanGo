import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CampoTexto from '../../components/common/CampoTexto'
import CampoContrasena from '../../components/common/CampoContrasena'
import BotonGoogle from '../../components/common/BotonGoogle'
import LogoAuth from '../../components/common/LogoAuth'

export default function Login() {
  const { iniciarSesion, iniciarSesionConToken } = useAuth()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)

  // Si venimos de regreso del flujo de Google, el backend nos mandó
  // el token de Sanctum como parámetro en la URL. Lo tomamos, iniciamos
  // sesión con él, y mandamos al usuario adentro — sin que tenga que
  // llenar ningún formulario.
  useEffect(() => {
    const googleToken = parametros.get('google_token')
    if (googleToken) {
      iniciarSesionConToken(googleToken)
        .then(() => navigate('/'))
        .catch(() => setErrorGeneral('No se pudo completar el inicio de sesión con Google.'))
    } else if (parametros.get('google_error') === '1') {
      setErrorGeneral('No se pudo iniciar sesión con Google. Intenta de nuevo.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validar = () => {
    const nuevosErrores = {}
    if (!form.email) nuevosErrores.email = 'El correo es obligatorio.'
    if (!form.password) nuevosErrores.password = 'La contraseña es obligatoria.'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    if (!validar()) return

    setCargando(true)
    try {
      const usuario = await iniciarSesion(form.email, form.password)
      navigate(usuario.role === 'viajero' ? '/' : '/')
    } catch (err) {
      setErrorGeneral(
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Usuario o contraseña incorrectos.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor-auth">
      <div className="panel-boleto">
        <LogoAuth />
        <h1>LOGIN</h1>
        <p>¿Deseas algún viaje? Inicia sesión y conoce lo mejor de PlanGo.</p>

        {parametros.get('verificado') === '1' && (
          <div className="mensaje-error-api" style={{ background: '#d4edda', color: '#1e5c31' }}>
            ¡Tu cuenta fue verificada! Ya puedes iniciar sesión.
          </div>
        )}
        {errorGeneral && <div className="mensaje-error-api">{errorGeneral}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <CampoTexto
            etiqueta="Correo electrónico"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errores.email}
          />
          <CampoContrasena
            etiqueta="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errores.password}
          />
          <button className="btn btn-primario" style={{ width: '100%' }} disabled={cargando}>
            {cargando ? 'Entrando...' : 'Iniciar sesión →'}
          </button>
        </form>

        <div className="separador-o">o</div>
        <BotonGoogle texto="Iniciar sesión con Google" />

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Link className="enlace" to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
          <Link className="enlace" to="/registro">Crear cuenta</Link>
        </div>
      </div>
    </div>
  )
}