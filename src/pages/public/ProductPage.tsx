import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { LoadingPage } from '@/components/shared/LoadingPage'
import { publicService, type PublicProduct } from '@/services/public.service'
import { ordersService } from '@/services/orders.service'
import { orderFormSchema, type OrderFormData } from '@/lib/validations/order'
import { formatPrice } from '@/utils/format'
import { PROVINCES_ECUADOR, APP_NAME } from '@/utils/constants'

export function ProductPage() {
  const { businessSlug, productSlug } = useParams()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<number | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { quantity: 1 },
  })

  useEffect(() => {
    const load = async () => {
      if (!businessSlug || !productSlug) return
      const { product: p, error } = await publicService.getPublicProduct(businessSlug, productSlug)
      if (error || !p) {
        setNotFound(true)
      } else {
        setProduct(p)
      }
      setLoading(false)
    }
    load()
  }, [businessSlug, productSlug])

  const onSubmit = async (data: OrderFormData) => {
    if (!product) return
    setOrderError(null)

    const { orderNumber, error } = await ordersService.createOrder({
      productId: product.id,
      businessId: product.businessId,
      firstName: data.firstName,
      secondName: data.secondName || undefined,
      lastName: data.lastName,
      secondLastName: data.secondLastName || undefined,
      phone: data.phone,
      province: data.province,
      city: data.city,
      address: data.address,
      reference: data.reference || undefined,
      quantity: data.quantity,
      customerNotes: data.customerNotes || undefined,
    })

    if (error) {
      setOrderError(error)
      return
    }

    setOrderSuccess(orderNumber)
  }

  if (loading) return <LoadingPage />

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 to-white px-4">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-10 w-10 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Producto no encontrado</h1>
          <p className="text-secondary-500">Este producto no existe o no está disponible.</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  // Éxito del pedido
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 to-white px-4">
        <div className="text-center max-w-sm">
          <div className="mb-6">
            <div className="h-20 w-20 rounded-full bg-success-100 flex items-center justify-center mx-auto">
              <svg className="h-10 w-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">¡Pedido realizado!</h1>
          <p className="text-secondary-600 mb-1">Tu pedido <span className="font-semibold">#{orderSuccess}</span> fue registrado.</p>
          <p className="text-sm text-secondary-500 mb-8">
            El vendedor se pondrá en contacto contigo para confirmar la entrega.
          </p>
          {product.businessWhatsapp && (
            <a
              href={`https://wa.me/593${product.businessWhatsapp.slice(1)}?text=Hola, acabo de realizar el pedido %23${orderSuccess} de ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="bg-green-600 hover:bg-green-700" fullWidth size="lg">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar por WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>
    )
  }

  const provinceOptions = PROVINCES_ECUADOR.map((p) => ({ value: p, label: p }))
  const hasImages = product.images.length > 0
  const discount = product.previousPrice
    ? Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100)
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-secondary-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.businessLogo && (
              <img src={product.businessLogo} alt="" className="h-7 w-7 rounded-full object-cover" />
            )}
            <span className="text-sm font-medium text-secondary-700">{product.businessName}</span>
          </div>
          {product.businessWhatsapp && (
            <a
              href={`https://wa.me/593${product.businessWhatsapp.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 p-1.5 rounded-full hover:bg-green-50 transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          {hasImages ? (
            <>
              <div className="aspect-square bg-secondary-50 rounded-2xl overflow-hidden mb-3 shadow-sm">
                <img
                  src={product.images[selectedImage]?.publicUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === selectedImage ? 'border-primary-500 ring-2 ring-primary-200' : 'border-secondary-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.publicUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Placeholder elegante cuando no hay imágenes */
            <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 via-primary-100/50 to-secondary-50 rounded-2xl flex flex-col items-center justify-center shadow-sm border border-primary-100/50">
              <div className="h-20 w-20 rounded-full bg-white/80 flex items-center justify-center mb-4 shadow-sm">
                <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-sm text-primary-600/70 font-medium">{product.businessName}</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl sm:text-4xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.previousPrice && (
              <>
                <span className="text-lg text-secondary-400 line-through">
                  {formatPrice(product.previousPrice)}
                </span>
                <span className="bg-danger-100 text-danger-700 text-sm font-bold px-2.5 py-1 rounded-lg">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <p className="text-secondary-600 leading-relaxed whitespace-pre-line text-base">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Benefits */}
        {product.benefits && (
          <div className="mb-8 bg-gradient-to-r from-success-50 to-emerald-50 rounded-xl p-5 border border-success-100">
            <h2 className="text-base font-semibold text-secondary-900 mb-3 flex items-center gap-2">
              <svg className="h-5 w-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Beneficios
            </h2>
            <div className="text-secondary-700 whitespace-pre-line text-sm leading-relaxed">
              {product.benefits}
            </div>
          </div>
        )}

        {/* Delivery & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {product.deliveryInfo && (
            <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75M3.375 14.25h1.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-1.5m18.75 0h-1.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h1.5" />
                </svg>
                <h3 className="font-semibold text-secondary-900 text-sm">Entrega</h3>
              </div>
              <p className="text-sm text-secondary-600 whitespace-pre-line">{product.deliveryInfo}</p>
            </div>
          )}
          {product.paymentInfo && (
            <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                <h3 className="font-semibold text-secondary-900 text-sm">Pago</h3>
              </div>
              <p className="text-sm text-secondary-600 whitespace-pre-line">{product.paymentInfo}</p>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 bg-secondary-50 px-3 py-1.5 rounded-full">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Compra segura
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 bg-secondary-50 px-3 py-1.5 rounded-full">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Pago contra entrega
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary-500 bg-secondary-50 px-3 py-1.5 rounded-full">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5" />
            </svg>
            Envío Ecuador
          </div>
        </div>

        {/* CTA / Form */}
        {!showForm ? (
          <div className="sticky bottom-4 sm:static">
            <Button
              size="lg"
              fullWidth
              onClick={() => setShowForm(true)}
              className="shadow-lg shadow-primary-500/25 text-base py-4"
            >
              🛒 COMPRAR AHORA — {formatPrice(product.price)}
            </Button>
          </div>
        ) : (
          <div className="border-t-2 border-primary-100 pt-8 mt-4" id="order-form">
            <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
              <h2 className="text-lg font-bold text-secondary-900 mb-1">Completa tu pedido</h2>
              <p className="text-sm text-secondary-600">
                Llena tus datos y recibirás tu <strong>{product.name}</strong> con pago contra entrega.
              </p>
            </div>

            {orderError && <Alert variant="error" className="mb-4">{orderError}</Alert>}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Primer nombre" placeholder="Juan" error={errors.firstName?.message} {...register('firstName')} />
                <Input label="Segundo nombre (opcional)" placeholder="" error={errors.secondName?.message} {...register('secondName')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Primer apellido" placeholder="Pérez" error={errors.lastName?.message} {...register('lastName')} />
                <Input label="Segundo apellido (opcional)" placeholder="" error={errors.secondLastName?.message} {...register('secondLastName')} />
              </div>
              <Input label="Teléfono" type="tel" placeholder="0991234567" error={errors.phone?.message} hint="10 dígitos" {...register('phone')} />
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Provincia"
                    options={provinceOptions}
                    placeholder="Selecciona tu provincia"
                    error={errors.province?.message}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
              <Input label="Ciudad" placeholder="Tu ciudad" error={errors.city?.message} {...register('city')} />
              <Textarea label="Dirección" placeholder="Calle principal, número, sector..." error={errors.address?.message} {...register('address')} />
              <Input label="Referencia (opcional)" placeholder="Cerca de..." error={errors.reference?.message} {...register('reference')} />
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Cantidad"
                    type="number"
                    min="1"
                    max="100"
                    error={errors.quantity?.message}
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                )}
              />
              <Textarea label="Observaciones (opcional)" placeholder="Algún detalle adicional..." error={errors.customerNotes?.message} {...register('customerNotes')} />

              {/* Order summary */}
              <div className="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-700 font-medium">Total a pagar:</span>
                  <span className="text-2xl font-bold text-primary-600">{formatPrice(product.price)}</span>
                </div>
                <p className="text-xs text-secondary-500 mt-1">Pago contra entrega</p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  className="shadow-lg shadow-primary-500/25 text-base py-4"
                >
                  ✅ CONFIRMAR PEDIDO
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer / Branding */}
      {product.showBranding && (
        <footer className="border-t border-secondary-100 py-6 mt-12 bg-secondary-50">
          <p className="text-center text-xs text-secondary-400">
            Powered by <span className="font-medium">{APP_NAME}</span>
          </p>
        </footer>
      )}
    </div>
  )
}
