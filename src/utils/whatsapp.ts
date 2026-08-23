/**
 * Genera un enlace de WhatsApp con mensaje automático.
 * Formato Ecuador: 0XXXXXXXXX → 593XXXXXXXXX
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  // Convertir formato local a internacional
  const internationalPhone = phone.startsWith('0')
    ? `593${phone.slice(1)}`
    : phone

  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`
}

/**
 * Genera mensaje de confirmación de pedido.
 */
export function generateOrderConfirmationMessage(
  customerName: string,
  orderNumber: number,
  productName: string,
  total: string,
): string {
  return `Hola ${customerName}, recibimos su pedido #${orderNumber} de ${productName} por ${total} con pago contra entrega.\n\n¿Confirma su pedido?`
}

/**
 * Genera mensaje de pedido enviado.
 */
export function generateShippedMessage(
  customerName: string,
  orderNumber: number,
): string {
  return `Hola ${customerName}, su pedido #${orderNumber} ha sido enviado. Le llegará en los próximos días.\n\nGracias por su compra.`
}
