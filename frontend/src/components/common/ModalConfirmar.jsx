import Modal from './Modal'

/**
 * Modal de confirmación reutilizable para acciones destructivas
 * (eliminar destino, eliminar viaje, etc.) — nunca usamos confirm()
 * nativo del navegador, como pide la rúbrica.
 */
export default function ModalConfirmar({ titulo, mensaje, onConfirmar, onCancelar, cargando }) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <p>{mensaje}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn btn-secundario" onClick={onCancelar} disabled={cargando}>
          Cancelar
        </button>
        <button className="btn btn-peligro" onClick={onConfirmar} disabled={cargando}>
          {cargando ? 'Procesando...' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  )
}
