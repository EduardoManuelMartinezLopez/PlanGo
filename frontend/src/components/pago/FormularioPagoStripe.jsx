import { useEffect, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { stripePromise } from '../../lib/stripe'
import cliente from '../../api/cliente'

/**
 * Formulario de pago real con Stripe, en modo de prueba (test mode).
 * No se hace ningún cobro de verdad: usa las llaves "pk_test_"/"sk_test_"
 * de Stripe, que solo aceptan tarjetas de prueba como la de abajo.
 *
 * Flujo:
 * 1. Al montarse, le pide al backend que cree un "PaymentIntent" por
 *    el monto del viaje (POST /viajes/{id}/crear-intento-pago).
 * 2. Con el "client_secret" que regresa, Stripe.js dibuja el formulario
 *    de tarjeta (<PaymentElement />) — nosotros nunca vemos ni tocamos
 *    el número de tarjeta, va directo a los servidores de Stripe.
 * 3. Al enviar, Stripe confirma el pago en sus propios servidores.
 * 4. Si sale bien, le avisamos a nuestro backend (PATCH .../confirmar)
 *    mandando el ID del PaymentIntent — el backend lo vuelve a
 *    verificar directo con Stripe antes de confirmar el viaje.
 */
export default function FormularioPagoStripe({ viajeId, telefono, onExito, onCancelar }) {
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cliente
      .post(`/viajes/${viajeId}/crear-intento-pago`)
      .then((res) => setClientSecret(res.data.client_secret))
      .catch(() => setError('No se pudo iniciar el pago. Verifica que las llaves de Stripe estén configuradas.'))
  }, [viajeId])

  if (error) {
    return <div className="mensaje-error-api">{error}</div>
  }

  if (!clientSecret) {
    return <p>Preparando formulario de pago…</p>
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#0e3b36' } } }}
    >
      <FormularioInterno viajeId={viajeId} telefono={telefono} onExito={onExito} onCancelar={onCancelar} />
    </Elements>
  )
}

function FormularioInterno({ viajeId, telefono, onExito, onCancelar }) {
  const stripe = useStripe()
  const elements = useElements()
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcesando(true)
    setError('')

    // Le pedimos a Stripe que confirme el pago con los datos que el
    // usuario metió en el <PaymentElement />. "redirect: if_required"
    // evita que Stripe navegue a otra página cuando no hace falta
    // (por ejemplo con tarjeta simple, sí hace falta con 3D Secure).
    const { error: errorStripe, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (errorStripe) {
      setError(errorStripe.message || 'No se pudo procesar el pago.')
      setProcesando(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await cliente.patch(`/viajes/${viajeId}/confirmar`, {
          stripe_payment_intent_id: paymentIntent.id,
          telefono: telefono || undefined,
        })
        onExito()
      } catch {
        setError('El pago se completó, pero no se pudo confirmar el viaje. Contacta soporte.')
      }
    }

    setProcesando(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="aviso-modo-prueba">
        <strong>Modo de prueba de Stripe</strong> — no se hace ningún cobro real.
        Usa la tarjeta <code>4242 4242 4242 4242</code>, cualquier fecha futura,
        cualquier CVC de 3 dígitos y cualquier código postal.
      </div>

      <div style={{ margin: '16px 0' }}>
        <PaymentElement />
      </div>

      {error && <div className="mensaje-error-api">{error}</div>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secundario" onClick={onCancelar} disabled={procesando}>
          Cancelar
        </button>
        <button className="btn btn-primario" disabled={!stripe || procesando}>
          {procesando ? 'Procesando pago...' : 'Pagar y confirmar'}
        </button>
      </div>
    </form>
  )
}
