import { Link } from 'react-router-dom'
import LogoAuth from '../../components/common/LogoAuth'

export default function VerificacionCorreo() {
  return (
    <div className="contenedor-auth">
      <div className="panel-boleto" style={{ textAlign: 'center' }}>
        <LogoAuth />
        <h1>Revisa tu correo</h1>
        <p>
          Te enviamos un enlace de confirmación. Da clic en él para activar
          tu cuenta de PlanGo.
        </p>
        <Link className="btn btn-primario" to="/login" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 12 }}>
          Ya confirmé mi cuenta
        </Link>
      </div>
    </div>
  )
}
