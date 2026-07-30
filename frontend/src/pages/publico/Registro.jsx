import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import cliente from '../../api/cliente'
import CampoTexto from '../../components/common/CampoTexto'
import CampoContrasena from '../../components/common/CampoContrasena'
import BotonGoogle from '../../components/common/BotonGoogle'
import LogoAuth from '../../components/common/LogoAuth'

// Misma regla que valida el backend: mínimo 8 caracteres, 1 mayúscula,
// 1 número, 1 carácter especial. La validamos AQUÍ también (bajo el
// input) para no depender solo del servidor.
const REGEX_PASSWORD = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)

  const validar = () => {
    const nuevosErrores = {}
    if (!form.name.trim()) nuevosErrores.name = 'El nombre es obligatorio.'
    if (!form.email) nuevosErrores.email = 'El correo es obligatorio.'
    if (!REGEX_PASSWORD.test(form.password)) {
      nuevosErrores.password = 'Mínimo 8 caracteres, con 1 mayúscula, 1 número y 1 carácter especial.'
    }
    if (form.password !== form.password_confirmation) {
      nuevosErrores.password_confirmation = 'Las contraseñas no coinciden.'
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    if (!validar()) return

    setCargando(true)
    try {
      await cliente.post('/register', form)
      navigate('/verificar-correo')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrores(
          Object.fromEntries(
            Object.entries(err.response.data.errors || {}).map(([k, v]) => [k, v[0]])
          )
        )
      } else {
        setErrorGeneral('Ocurrió un error al crear tu cuenta. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor-auth">
      <div className="panel-boleto">
        <LogoAuth />
        <h1>Nuevo Registro de Viajero</h1>
        <p>Comienza tu aventura con PlanGo. Crea tu cuenta oficial de viajero.</p>

        {errorGeneral && <div className="mensaje-error-api">{errorGeneral}</div>}

        <BotonGoogle texto="Registrarme con Google" />
        <div className="separador-o">o con tu correo</div>

        <form onSubmit={handleSubmit} noValidate>
          <CampoTexto
            etiqueta="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errores.name}
          />
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
          <CampoContrasena
            etiqueta="Confirmar contraseña"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            error={errores.password_confirmation}
          />
          <button className="btn btn-primario" style={{ width: '100%' }} disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta →'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link className="enlace" to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}