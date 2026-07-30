import { loadStripe } from '@stripe/stripe-js'

// loadStripe() descarga el script de Stripe.js una sola vez y lo
// reutiliza — por eso vive en su propio archivo en vez de llamarse
// dentro del componente cada vez que se abre el modal de pago.
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
