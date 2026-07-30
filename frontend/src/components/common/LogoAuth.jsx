import logo from '../../assets/logo.png'

// Logo de PlanGo, usado en Login, Registro y las demás pantallas
// públicas (verificación de correo, recuperar/restablecer contraseña).
// Para cambiar el logo del proyecto, solo hay que reemplazar el
// archivo frontend/src/assets/logo.png por el definitivo — no hace
// falta tocar ningún componente.
export default function LogoAuth() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 20 }}>
      <img src={logo} alt="PlanGo" style={{ maxWidth: 110, height: 'auto' }} />
    </div>
  )
}
