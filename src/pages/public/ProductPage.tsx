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
import { publicService, type ProductLandingData } from '@/services/public.service'
import { ordersService } from '@/services/orders.service'
import { orderFormSchema, type OrderFormData } from '@/lib/validations/order'
import { formatPrice } from '@/utils/format'
import { PROVINCES_ECUADOR, APP_NAME } from '@/utils/constants'
import type { ProductOption, ProductFAQ } from '@/types/product-landing'

export function ProductPage() {
  const { businessSlug, productSlug } = useParams()
  const [product, setProduct] = useState<ProductLandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<number | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
      if (error || !p) setNotFound(true)
      else setProduct(p)
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
    if (error) { setOrderError(error); return }
    setOrderSuccess(orderNumber)
  }

  if (loading) return <LoadingPage />
  if (notFound) return <NotFoundView />
  if (!product) return null
  if (orderSuccess) return <SuccessView orderNumber={orderSuccess} product={product} />

  const hasImages = product.images.length > 0
  const hasOptions = product.productOptions.length > 0
  const hasSections = product.sections.length > 0
  const hasReviews = product.reviews.length > 0
  const hasFaq = product.faq.length > 0
  const hasFeatures = product.features.length > 0
  const discount = product.previousPrice
    ? Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100)
    : null

  const currentPrice = hasOptions && product.productOptions[selectedOption]
    ? product.productOptions[selectedOption].price
    : product.price

  const provinceOptions = PROVINCES_ECUADOR.map((p) => ({ value: p, label: p }))

  return (
    <div className="min-h-screen bg-white">
      {/* Badge top */}
      {product.badgeText && (
        <div className="bg-secondary-900 text-white text-center py-2 px-4">
          <p className="text-sm font-medium">{product.badgeText}</p>
        </div>
      )}

      {/* Hero section */}
      <section className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            {hasImages ? (
              <>
                <div className="aspect-square bg-secondary-50 rounded-2xl overflow-hidden mb-3">
                  <img src={product.images[selectedImage]?.publicUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button key={img.id} type="button" onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${idx === selectedImage ? 'border-primary-500 ring-2 ring-primary-200' : 'border-secondary-200 opacity-70 hover:opacity-100'}`}>
                        <img src={img.publicUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-primary-50 via-primary-100/50 to-secondary-50 rounded-2xl flex flex-col items-center justify-center border border-primary-100/50">
                <div className="h-24 w-24 rounded-full bg-white/80 flex items-center justify-center mb-4 shadow-sm">
                  <svg className="h-12 w-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-primary-600/70 font-medium">{product.businessName}</p>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 leading-tight">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="mt-2 text-lg text-secondary-600">{product.subtitle}</p>
            )}

            {/* Reviews summary */}
            {product.reviewsSummary && product.reviewsSummary.count > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.round(product.reviewsSummary.rating))}
                </div>
                <span className="text-sm text-secondary-600">
                  {product.reviewsSummary.rating} · {product.reviewsSummary.count.toLocaleString()} reseñas
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="mt-4 text-secondary-600 leading-relaxed">{product.description}</p>
            )}

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-secondary-900">{formatPrice(currentPrice)}</span>
              {product.previousPrice && (
                <>
                  <span className="text-lg text-secondary-400 line-through">{formatPrice(product.previousPrice)}</span>
                  <span className="bg-danger-100 text-danger-700 text-sm font-bold px-2.5 py-1 rounded-lg">-{discount}%</span>
                </>
              )}
            </div>

            {/* Features */}
            {hasFeatures && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.features.map((f, i) => (
                  <div key={i} className="text-center bg-secondary-50 rounded-xl p-3 border border-secondary-100">
                    <p className="text-lg font-bold text-secondary-900">{f.value}</p>
                    <p className="text-xs text-secondary-500">{f.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-secondary-700 mb-2">Colores</p>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 border border-secondary-200 rounded-full text-sm">
                      <span className="h-4 w-4 rounded-full border border-secondary-300" style={{ backgroundColor: c.value }}></span>
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product options / packs */}
            {hasOptions && (
              <div className="mt-6">
                <p className="text-sm font-medium text-secondary-700 mb-3">Elige tu opción</p>
                <div className="space-y-3">
                  {product.productOptions.map((opt: ProductOption, i: number) => (
                    <button key={i} type="button" onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedOption === i ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200' : 'border-secondary-200 hover:border-secondary-300'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-secondary-900">{opt.title}</span>
                            {opt.popular && <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">Popular</span>}
                          </div>
                          <p className="text-sm text-secondary-500 mt-0.5">{opt.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-secondary-400 line-through">{formatPrice(opt.originalPrice)}</p>
                          <p className="text-lg font-bold text-secondary-900">{formatPrice(opt.price)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {!showForm ? (
              <div className="mt-8">
                <Button size="lg" fullWidth onClick={() => setShowForm(true)} className="py-4 text-base shadow-lg shadow-primary-500/25">
                  Comprar — Pago al recibir
                </Button>
                {product.shippingText && (
                  <p className="text-center text-sm text-secondary-500 mt-2">{product.shippingText}</p>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <OrderForm
                  product={product}
                  errors={errors}
                  register={register}
                  control={control}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                  orderError={orderError}
                  provinceOptions={provinceOptions}
                  currentPrice={currentPrice}
                />
              </div>
            )}

            {/* Trust badges */}
            {product.trustBadges.length > 0 ? (
              <div className="mt-6 grid grid-cols-3 gap-2">
                {product.trustBadges.map((badge, i) => (
                  <div key={i} className="text-center py-3">
                    <p className="text-xs font-bold text-secondary-900">{badge.label}</p>
                    <p className="text-xs text-secondary-500">{badge.sublabel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="text-center py-3"><p className="text-xs font-bold text-secondary-900">Pago</p><p className="text-xs text-secondary-500">al recibir</p></div>
                <div className="text-center py-3"><p className="text-xs font-bold text-secondary-900">Envío</p><p className="text-xs text-secondary-500">gratis</p></div>
                <div className="text-center py-3"><p className="text-xs font-bold text-secondary-900">Entrega</p><p className="text-xs text-secondary-500">24-72h</p></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content sections */}
      {hasSections && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="space-y-16">
            {product.sections.map((sec, i) => (
              <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${sec.reversed ? 'lg:flex-row-reverse' : ''}`}>
                {sec.imageUrl && (
                  <div className={`${sec.reversed ? 'lg:order-2' : ''}`}>
                    <img src={sec.imageUrl} alt={sec.title} className="rounded-2xl w-full object-cover shadow-lg" />
                  </div>
                )}
                <div className={`${sec.reversed ? 'lg:order-1' : ''} ${!sec.imageUrl ? 'lg:col-span-2 max-w-2xl mx-auto' : ''}`}>
                  {sec.subtitle && <p className="text-sm font-medium text-primary-600 mb-1">{sec.subtitle}</p>}
                  <h2 className="text-2xl font-bold text-secondary-900 mb-3">{sec.title}</h2>
                  <p className="text-secondary-600 leading-relaxed mb-4">{sec.description}</p>
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-2">
                      {sec.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-secondary-700">
                          <svg className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {hasReviews && (
        <section className="bg-secondary-50 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-secondary-900">Reseñas</h2>
              {product.reviewsSummary && product.reviewsSummary.count > 0 && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold text-secondary-900">{product.reviewsSummary.rating}</span>
                  <div className="text-yellow-400 text-xl">{'★'.repeat(Math.round(product.reviewsSummary.rating))}</div>
                  <span className="text-secondary-500">· {product.reviewsSummary.count.toLocaleString()} reseñas</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-secondary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-sm">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{review.name}</p>
                      <p className="text-xs text-secondary-500">{review.city}</p>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  <p className="text-sm text-secondary-700 leading-relaxed">{review.text}</p>
                  {review.detail && <p className="text-xs text-secondary-400 mt-2">{review.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {hasFaq && (
        <section className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-2">
            {product.faq.map((item: ProductFAQ, i: number) => (
              <div key={i} className="border border-secondary-200 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary-50 transition-colors">
                  <span className="font-medium text-secondary-900">{item.question}</span>
                  <svg className={`h-5 w-5 text-secondary-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-secondary-600 leading-relaxed animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      {!showForm && (
        <section className="bg-secondary-900 py-10">
          <div className="max-w-md mx-auto px-4 text-center">
            <p className="text-white font-bold text-xl mb-4">{product.name}</p>
            <p className="text-3xl font-bold text-white mb-6">{formatPrice(currentPrice)}</p>
            <Button size="lg" fullWidth onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="py-4 text-base">
              Comprar ahora — Pago al recibir
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      {product.showBranding && (
        <footer className="border-t border-secondary-100 py-6 bg-secondary-50">
          <p className="text-center text-xs text-secondary-400">
            Powered by <span className="font-medium">{APP_NAME}</span>
          </p>
        </footer>
      )}
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function NotFoundView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
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

function SuccessView({ orderNumber, product }: { orderNumber: number; product: ProductLandingData }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 to-white px-4">
      <div className="text-center max-w-sm">
        <div className="h-20 w-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">¡Pedido realizado!</h1>
        <p className="text-secondary-600 mb-1">Tu pedido <span className="font-semibold">#{orderNumber}</span> fue registrado.</p>
        <p className="text-sm text-secondary-500 mb-8">El vendedor se pondrá en contacto contigo para confirmar.</p>
        {product.businessWhatsapp && (
          <a href={`https://wa.me/593${product.businessWhatsapp.slice(1)}?text=Hola, realicé el pedido %23${orderNumber} de ${product.name}`}
            target="_blank" rel="noopener noreferrer" className="block">
            <Button className="bg-green-600 hover:bg-green-700" fullWidth size="lg">
              Contactar por WhatsApp
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}

interface OrderFormProps {
  product: ProductLandingData
  errors: Record<string, { message?: string }>
  register: ReturnType<typeof useForm<OrderFormData>>['register']
  control: ReturnType<typeof useForm<OrderFormData>>['control']
  handleSubmit: ReturnType<typeof useForm<OrderFormData>>['handleSubmit']
  onSubmit: (data: OrderFormData) => Promise<void>
  isSubmitting: boolean
  orderError: string | null
  provinceOptions: Array<{ value: string; label: string }>
  currentPrice: number
}

function OrderForm({ product, errors, register, control, handleSubmit, onSubmit, isSubmitting, orderError, provinceOptions, currentPrice }: OrderFormProps) {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-blue-50 rounded-2xl p-5 sm:p-6 border-2 border-primary-200 shadow-lg shadow-primary-100/50">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 mb-5 border border-primary-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary-900">Completa tu pedido</h3>
            <p className="text-sm text-secondary-500">{product.name} · Pago contra entrega</p>
          </div>
        </div>
      </div>

      {orderError && <Alert variant="error" className="mb-4">{orderError}</Alert>}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Datos personales */}
        <div className="bg-white rounded-xl p-4 border border-secondary-200 space-y-3">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">👤 Datos personales</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre" placeholder="Juan" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Apellido" placeholder="Pérez" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Teléfono" type="tel" placeholder="0991234567" error={errors.phone?.message} {...register('phone')} />
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-xl p-4 border border-secondary-200 space-y-3">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">📍 Dirección de entrega</p>
          <Controller name="province" control={control} render={({ field }) => (
            <Select label="Provincia" options={provinceOptions} placeholder="Selecciona tu provincia" error={errors.province?.message} value={field.value || ''} onChange={field.onChange} />
          )} />
          <Input label="Ciudad" placeholder="Tu ciudad" error={errors.city?.message} {...register('city')} />
          <Textarea label="Dirección completa" placeholder="Calle principal, número, sector..." error={errors.address?.message} {...register('address')} />
          <Input label="Referencia (opcional)" placeholder="Cerca de..." error={errors.reference?.message} {...register('reference')} />
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-primary-100">Total a pagar</p>
              <p className="text-xs text-primary-200">Pagas al recibir en tu puerta</p>
            </div>
            <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="py-4 text-base font-bold shadow-xl shadow-primary-500/30 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          ✅ CONFIRMAR PEDIDO
        </Button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <span className="flex items-center gap-1 text-xs text-secondary-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Datos seguros
          </span>
          <span className="flex items-center gap-1 text-xs text-secondary-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Sin compromiso
          </span>
        </div>
      </form>
    </div>
  )
}
