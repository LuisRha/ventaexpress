import type { PaymentProvider } from './types'

export type { PaymentProvider, PaymentCustomerData, PaymentSubscriptionData, WebhookEvent, WebhookResult } from './types'

/**
 * Factory para obtener el proveedor de pagos configurado.
 * Se implementará con el proveedor seleccionado (Payphone, Kushki, PayPal, etc.)
 * 
 * La aplicación NUNCA referencia directamente un proveedor.
 * Siempre usa esta abstracción.
 */
export function getPaymentProvider(): PaymentProvider {
  const providerName = import.meta.env.VITE_PAYMENT_PROVIDER || 'mock'

  switch (providerName) {
    // Futuras implementaciones:
    // case 'payphone': return new PayphoneProvider()
    // case 'kushki': return new KushkiProvider()
    // case 'paypal': return new PayPalProvider()
    default:
      return createMockProvider()
  }
}

/**
 * Proveedor mock para desarrollo.
 * Simula las operaciones de pagos sin conectar a servicios reales.
 */
function createMockProvider(): PaymentProvider {
  return {
    name: 'mock',
    async createCustomer(data) {
      console.log('[MockPayment] createCustomer:', data)
      return { providerId: `mock_cust_${Date.now()}` }
    },
    async createSubscription(data) {
      console.log('[MockPayment] createSubscription:', data)
      return {
        providerId: `mock_sub_${Date.now()}`,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    },
    async cancelSubscription(subscriptionId) {
      console.log('[MockPayment] cancelSubscription:', subscriptionId)
    },
    verifyWebhookSignature(_payload, _signature) {
      return true
    },
    async handleWebhook(event) {
      console.log('[MockPayment] handleWebhook:', event)
      return { processed: true, action: 'mock_processed' }
    },
    async getCheckoutUrl(data) {
      console.log('[MockPayment] getCheckoutUrl:', data)
      return '/dashboard/plan?payment=success'
    },
  }
}
