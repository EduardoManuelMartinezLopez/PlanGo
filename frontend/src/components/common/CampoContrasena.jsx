import { useState } from 'react'

/**
 * Igual que CampoTexto, pero para contraseñas: agrega un ícono de
 * ojito adentro del input para mostrar/ocultar el texto sin necesidad
 * de un botón aparte. Se usa en Login, Registro, Recuperar/Restablecer
 * contraseña y Configuración de cuenta, para que todos se vean iguales.
 */
export default function CampoContrasena({ etiqueta, error, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="campo">
      <label>{etiqueta}</label>
      <div style={{ position: 'relative' }}>
        <input {...props} type={visible ? 'text' : 'password'} style={{ paddingRight: 40, width: '100%' }} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 4,
            opacity: 0.7,
          }}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <div className="error-campo">{error}</div>}
    </div>
  )
}