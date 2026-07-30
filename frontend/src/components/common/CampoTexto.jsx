/**
 * Input reutilizable que muestra el mensaje de error justo debajo del
 * campo (nunca con alert), como pide la rúbrica.
 */
export default function CampoTexto({ etiqueta, error, ...props }) {
  return (
    <div className="campo">
      <label>{etiqueta}</label>
      <input {...props} />
      {error && <div className="error-campo">{error}</div>}
    </div>
  )
}
