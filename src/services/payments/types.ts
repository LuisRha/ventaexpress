// ============================================
// ABSTRACCIÓN DE PAGOS
// ============================================
// Interface que cualquier proveedor debe implementar.
// Permite cambiar de proveedor sin reescribir la app.

export interface PaymentCustomerData {
  email: string
  name: string
  businessId: string
}

export interface PaymentSubscriptionData {
  customerId: string
  planId: string
  priceAmount: number
  currency: string
}

export interface PaymentProviderCustomer {
  providerId: string
}

export interface PaymentProviderSubscription {
  providerId: string
  status: string
  currentPeriodEnd?: string
}

export interface WebhookEvent {
  type: string
  data: Record<string, unknown>
}

export interface WebhookResult {
  processed: boolean
  action?: string
  error?: string
}

export interface PaymentProvider {
  name: string
  createCustomer(data: PaymentCustomerData): Promise<PaymentProviderCustomer>
  createSubscription(data: PaymentSubscriptionData): Promise<PaymentProviderSubscription>
  cancelSubscription(subscriptionId: string): Promise<void>
  verifyWebhookSignature(payload: string, signature: string): boolean
  handleWebhook(event: WebhookEvent): Promise<WebhookResult>
  getCheckoutUrl(data: PaymentSubscriptionData): Promise<string>
}
