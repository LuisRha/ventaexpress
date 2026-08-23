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
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
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
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <div className="mb-4">
            <svg className="h-16 w-16 text-success-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Pedido realizado</h1>
          <p className="text-secondary-600 mb-1">Tu pedido #{orderSuccess} fue registrado correctamente.</p>
          <p className="text-sm text-secondary-500 mb-6">
            El vendedor se pondrá en contacto contigo para confirmar la entrega.
          </p>
          {product.businessWhatsapp && (
            <a
              href={`https://wa.me/593${product.businessWhatsapp.slice(1)}?text=Hola, acabo de realizar el pedido %23${orderSuccess} de ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700" fullWidth>
                Contactar por WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>
    )
  }

  const provinceOptions = PROVINCES_ECUADOR.map((p) => ({ value: p, label: p }))

  return (
    <div className="min-h-screen bg-white">
      {/* SEO meta tags se manejarán con helmet en producción */}

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Image Gallery */}
        <div className="mb-6">
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square bg-secondary-100 rounded-xl overflow-hidden mb-3">
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
                      className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === selectedImage ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img.publicUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-secondary-100 rounded-xl flex items-center justify-center">
              <svg className="h-16 w-16 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-primary-600">{formatPrice(product.price)}</span>
            {product.previousPrice && (
              <span className="text-lg text-secondary-400 line-through">{formatPrice(product.previousPrice)}</span>
            )}
            {product.previousPrice && (
              <span className="bg-danger-100 text-danger-700 text-sm font-medium px-2 py-0.5 rounded">
                -{Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100)}%
              </span>
            )}
          </div>
          {product.description && (
            <p className="text-secondary-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          )}
        </div>

        {/* Benefits */}
        {product.benefits && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">Beneficios</h2>
            <div className="text-secondary-700 whitespace-pre-line">{product.benefits}</div>
          </div>
        )}

        {/* Delivery */}
        {product.deliveryInfo && (
          <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
            <h3 className="font-medium text-secondary-900 mb-1">Entrega</h3>
            <p className="text-sm text-secondary-600 whitespace-pre-line">{product.deliveryInfo}</p>
          </div>
        )}

        {/* Payment */}
        {product.paymentInfo && (
          <div className="mb-8 p-4 bg-secondary-50 rounded-lg">
            <h3 className="font-medium text-secondary-900 mb-1">Pago</h3>
            <p className="text-sm text-secondary-600 whitespace-pre-line">{product.paymentInfo}</p>
          </div>
        )}

        {/* CTA / Form */}
        {!showForm ? (
          <div className="sticky bottom-4 sm:static">
            <Button size="lg" fullWidth onClick={() => setShowForm(true)}>
              COMPRAR AHORA
            </Button>
          </div>
        ) : (
          <div className="border-t border-secondary-200 pt-6" id="order-form">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">Completa tu pedido</h2>

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

              <div className="pt-2">
                <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
                  CONFIRMAR PEDIDO
                </Button>
                <p className="text-xs text-secondary-500 text-center mt-2">
                  Pago contra entrega. El vendedor te contactará para confirmar.
                </p>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer / Branding */}
      {product.showBranding && (
        <footer className="border-t border-secondary-100 py-4 mt-8">
          <p className="text-center text-xs text-secondary-400">
            Powered by {APP_NAME}
          </p>
        </footer>
      )}
    </div>
  )
}
