import { useState, useEffect, useRef } from 'react'
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
  const [selectedColor, setSelectedColor] = useState<number>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

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

  const scrollToForm = () => {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
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
      {/* Badge/Promo bar */}
      {product.badgeText && (
        <div className="bg-secondary-900 text-white text-center py-2.5 px-4">
          <p className="text-xs sm:text-sm font-medium tracking-wide uppercase">{product.badgeText}</p>
        </div>
      )}

      {/* Business header */}
      <header className="border-b border-secondary-100 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          {product.businessLogo ? (
            <img src={product.businessLogo} alt={product.businessName} className="h-8 sm:h-10 object-contain" />
          ) : (
            <h2 className="text-lg sm:text-xl font-bold tracking-widest text-secondary-900 uppercase">{product.businessName}</h2>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto">
        {/* Hero: Gallery + Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
          {/* Gallery column */}
          <section className="relative">
            {/* Main image */}
            {hasImages ? (
              <div className="relative">
                <div className="aspect-square bg-secondary-50 overflow-hidden">
                  <img
                    src={product.images[selectedImage]?.publicUrl}
                    alt={product.name}
                    className="w-full h-full object-contain sm:object-cover"
                  />
                </div>
                {/* Image counter mobile */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full lg:hidden">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-secondary-50 to-secondary-100 flex flex-col items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                  <svg className="h-10 w-10 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-secondary-400 text-sm">{product.businessName}</p>
              </div>
            )}

            {/* Thumbnails */}
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImage
                        ? 'border-secondary-900 opacity-100'
                        : 'border-secondary-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.publicUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product info column */}
          <section className="px-4 sm:px-6 lg:px-0 py-6 lg:py-8">
            {/* Subtitle / category */}
            {product.subtitle && (
              <p className="text-xs sm:text-sm text-secondary-400 uppercase tracking-wide mb-1">{product.subtitle}</p>
            )}

            {/* Product name */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary-900 leading-tight">
              {product.name}
            </h1>

            {/* Reviews summary */}
            {product.reviewsSummary && product.reviewsSummary.count > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex text-yellow-400 text-sm">
                  {'★'.repeat(Math.round(product.reviewsSummary.rating))}
                  {'☆'.repeat(5 - Math.round(product.reviewsSummary.rating))}
                </div>
                <span className="text-xs sm:text-sm text-secondary-500">
                  {product.reviewsSummary.rating} · {product.reviewsSummary.count.toLocaleString()} reseñas
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="mt-3 text-sm sm:text-base text-secondary-600 leading-relaxed">{product.description}</p>
            )}

            {/* Price block */}
            <div className="mt-5 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-secondary-900">{formatPrice(currentPrice)}</span>
              {product.previousPrice && (
                <>
                  <span className="text-base sm:text-lg text-secondary-400 line-through">{formatPrice(product.previousPrice)}</span>
                  <span className="text-xs sm:text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">-{discount}%</span>
                </>
              )}
            </div>
            {product.previousPrice && (
              <p className="text-xs sm:text-sm text-success-600 font-medium mt-1">
                Ahorras {formatPrice(product.previousPrice - currentPrice)}
              </p>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mt-5">
                <p className="text-xs sm:text-sm font-medium text-secondary-700 mb-2">
                  Color: <span className="text-secondary-500">{product.colors[selectedColor]?.name}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(i)}
                      className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 transition-all ${
                        selectedColor === i
                          ? 'border-secondary-900 ring-2 ring-secondary-300 scale-110'
                          : 'border-secondary-200 hover:border-secondary-400'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Features pills/tabs */}
            {hasFeatures && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.features.map((f, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-xs sm:text-sm"
                  >
                    <span className="text-base">{f.icon}</span>
                    <span className="font-medium text-secondary-700">{f.value}</span>
                    <span className="text-secondary-400 hidden xs:inline">· {f.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Product options / packs */}
            {hasOptions && (
              <div className="mt-6">
                <p className="text-xs sm:text-sm font-medium text-secondary-500 uppercase tracking-wide mb-3">Elige tu opción</p>
                <div className="space-y-2">
                  {product.productOptions.map((opt: ProductOption, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedOption(i)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        selectedOption === i
                          ? 'border-secondary-900 bg-secondary-50'
                          : 'border-secondary-200 hover:border-secondary-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-semibold text-secondary-900">{opt.title}</span>
                            {opt.popular && (
                              <span className="text-2xs sm:text-xs bg-secondary-900 text-white px-2 py-0.5 rounded-full font-medium">Popular</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-secondary-500 mt-0.5 truncate">{opt.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-secondary-400 line-through">{formatPrice(opt.originalPrice)}</p>
                          <p className="text-base sm:text-lg font-bold text-secondary-900">{formatPrice(opt.price)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            {!showForm && (
              <div className="mt-6">
                <Button
                  size="lg"
                  fullWidth
                  onClick={scrollToForm}
                  className="py-4 text-sm sm:text-base font-bold uppercase tracking-wide rounded-xl bg-secondary-900 hover:bg-secondary-800 text-white shadow-lg"
                >
                  COMPRAR — PAGO AL RECIBIR
                </Button>
                {product.shippingText && (
                  <p className="text-center text-xs sm:text-sm text-secondary-500 mt-2">{product.shippingText}</p>
                )}
              </div>
            )}

            {/* Trust badges */}
            {product.trustBadges.length > 0 ? (
              <div className="mt-6 grid grid-cols-3 gap-2">
                {product.trustBadges.map((badge, i) => (
                  <div key={i} className="text-center py-3 px-2 bg-secondary-50 rounded-xl border border-secondary-100">
                    <p className="text-lg mb-0.5">{badge.icon}</p>
                    <p className="text-xs font-bold text-secondary-800 leading-tight">{badge.label}</p>
                    <p className="text-2xs sm:text-xs text-secondary-500">{badge.sublabel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="text-center py-3 px-2 bg-secondary-50 rounded-xl border border-secondary-100">
                  <p className="text-lg mb-0.5">💰</p>
                  <p className="text-xs font-bold text-secondary-800">Pago</p>
                  <p className="text-2xs sm:text-xs text-secondary-500">al recibir</p>
                </div>
                <div className="text-center py-3 px-2 bg-secondary-50 rounded-xl border border-secondary-100">
                  <p className="text-lg mb-0.5">🚚</p>
                  <p className="text-xs font-bold text-secondary-800">Envío</p>
                  <p className="text-2xs sm:text-xs text-secondary-500">a domicilio</p>
                </div>
                <div className="text-center py-3 px-2 bg-secondary-50 rounded-xl border border-secondary-100">
                  <p className="text-lg mb-0.5">⚡</p>
                  <p className="text-xs font-bold text-secondary-800">Entrega</p>
                  <p className="text-2xs sm:text-xs text-secondary-500">24-72h</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {product.benefits && (
              <div className="mt-6 bg-secondary-50 rounded-xl p-4 border border-secondary-100">
                <p className="text-xs font-semibold text-secondary-700 uppercase tracking-wide mb-2">Beneficios</p>
                <p className="text-sm text-secondary-600 leading-relaxed whitespace-pre-line">{product.benefits}</p>
              </div>
            )}

            {/* Delivery & Payment info */}
            {(product.deliveryInfo || product.paymentInfo) && (
              <div className="mt-4 space-y-3">
                {product.deliveryInfo && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="h-5 w-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.375c0-.621-.504-1.125-1.125-1.125h-2.25M16.5 18.75h-6M4.875 14.25h8.25M16.5 14.25L14.25 9.75H5.625" />
                    </svg>
                    <p className="text-secondary-600">{product.deliveryInfo}</p>
                  </div>
                )}
                {product.paymentInfo && (
                  <div className="flex items-start gap-3 text-sm">
                    <svg className="h-5 w-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                    <p className="text-secondary-600">{product.paymentInfo}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Order form */}
        {showForm && (
          <div ref={formRef} className="px-4 sm:px-6 lg:px-0 pb-8 max-w-xl mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-12">
            <div className="lg:col-start-2">
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
          </div>
        )}
      </main>

      {/* Content sections */}
      {hasSections && (
        <section className="bg-secondary-50 border-t border-secondary-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <div className="space-y-12 sm:space-y-16">
              {product.sections.map((sec, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center ${
                    sec.reversed ? '' : ''
                  }`}
                >
                  {sec.imageUrl && (
                    <div className={sec.reversed ? 'lg:order-2' : ''}>
                      <img
                        src={sec.imageUrl}
                        alt={sec.title}
                        className="rounded-2xl w-full object-cover shadow-md max-h-80 sm:max-h-96 lg:max-h-none"
                      />
                    </div>
                  )}
                  <div className={`${sec.reversed ? 'lg:order-1' : ''} ${!sec.imageUrl ? 'lg:col-span-2 max-w-2xl mx-auto text-center' : ''}`}>
                    {sec.subtitle && (
                      <p className="text-xs sm:text-sm font-medium text-primary-600 mb-1 uppercase tracking-wide">{sec.subtitle}</p>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-3">{sec.title}</h2>
                    <p className="text-sm sm:text-base text-secondary-600 leading-relaxed mb-4">{sec.description}</p>
                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {sec.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-2 text-sm sm:text-base text-secondary-700">
                            <svg className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </div>
        </section>
      )}

      {/* Reviews */}
      {hasReviews && (
        <section className="border-t border-secondary-100 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">Lo que dicen nuestros clientes</h2>
              {product.reviewsSummary && product.reviewsSummary.count > 0 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-secondary-900">{product.reviewsSummary.rating}</span>
                  <div className="text-yellow-400 text-lg sm:text-xl">{'★'.repeat(Math.round(product.reviewsSummary.rating))}</div>
                  <span className="text-sm text-secondary-500">· {product.reviewsSummary.count.toLocaleString()} reseñas</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-xl p-4 sm:p-5 border border-secondary-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                      <span className="text-secondary-700 font-bold text-sm">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900">{review.name}</p>
                      <p className="text-xs text-secondary-500">{review.city}</p>
                    </div>
                  </div>
                  <div className="text-yellow-400 text-sm mb-2">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-sm text-secondary-700 leading-relaxed">{review.text}</p>
                  {review.detail && <p className="text-xs text-secondary-400 mt-2 italic">{review.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {hasFaq && (
        <section className="border-t border-secondary-100 py-10 sm:py-16 bg-secondary-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 text-center mb-6 sm:mb-8">Preguntas frecuentes</h2>
            <div className="space-y-2">
              {product.faq.map((item: ProductFAQ, i: number) => (
                <div key={i} className="bg-white border border-secondary-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary-50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-medium text-secondary-900 pr-4">{item.question}</span>
                    <svg
                      className={`h-5 w-5 text-secondary-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
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
          </div>
        </section>
      )}

      {/* Sticky bottom CTA (mobile only when form not shown) */}
      {!showForm && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-3 sm:p-4 lg:hidden z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-secondary-500 truncate">{product.name}</p>
              <p className="text-lg font-bold text-secondary-900">{formatPrice(currentPrice)}</p>
            </div>
            <Button
              onClick={scrollToForm}
              className="flex-shrink-0 py-3 px-6 text-sm font-bold uppercase bg-secondary-900 hover:bg-secondary-800 text-white rounded-xl"
            >
              Comprar
            </Button>
          </div>
        </div>
      )}

      {/* Desktop final CTA */}
      {!showForm && (
        <section className="hidden lg:block bg-secondary-900 py-10">
          <div className="max-w-md mx-auto px-4 text-center">
            <p className="text-white font-bold text-xl mb-2">{product.name}</p>
            <p className="text-3xl font-bold text-white mb-6">{formatPrice(currentPrice)}</p>
            <Button
              size="lg"
              fullWidth
              onClick={scrollToForm}
              className="py-4 text-base bg-white text-secondary-900 hover:bg-secondary-100 font-bold rounded-xl"
            >
              Comprar ahora — Pago al recibir
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      {product.showBranding && (
        <footer className="border-t border-secondary-100 py-6 bg-white">
          <p className="text-center text-xs text-secondary-400">
            Powered by <span className="font-medium">{APP_NAME}</span>
          </p>
        </footer>
      )}

      {/* Spacer for sticky CTA on mobile */}
      {!showForm && <div className="h-20 lg:hidden" />}
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
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2">Producto no encontrado</h1>
        <p className="text-sm sm:text-base text-secondary-500">Este producto no existe o no está disponible.</p>
      </div>
    </div>
  )
}

function SuccessView({ orderNumber, product }: { orderNumber: number; product: ProductLandingData }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 to-white px-4">
      <div className="text-center max-w-sm w-full">
        <div className="h-20 w-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2">¡Pedido realizado!</h1>
        <p className="text-sm sm:text-base text-secondary-600 mb-1">
          Tu pedido <span className="font-semibold">#{orderNumber}</span> fue registrado.
        </p>
        <p className="text-xs sm:text-sm text-secondary-500 mb-8">El vendedor se pondrá en contacto contigo para confirmar.</p>
        {product.businessWhatsapp && (
          <a
            href={`https://wa.me/593${product.businessWhatsapp.slice(1)}?text=Hola, realicé el pedido %23${orderNumber} de ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
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
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-secondary-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-secondary-100">
        <div className="h-10 w-10 rounded-full bg-secondary-900 flex items-center justify-center flex-shrink-0">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-secondary-900">Completa tu pedido</h3>
          <p className="text-xs sm:text-sm text-secondary-500">{product.name} · Pago contra entrega</p>
        </div>
      </div>

      {orderError && <Alert variant="error" className="mb-4">{orderError}</Alert>}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Personal data */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">Datos personales</p>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <Input label="Nombre" placeholder="Juan" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Apellido" placeholder="Pérez" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Teléfono" type="tel" placeholder="0991234567" error={errors.phone?.message} {...register('phone')} />
        </div>

        {/* Address */}
        <div className="space-y-3 pt-3 border-t border-secondary-100">
          <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">Dirección de entrega</p>
          <Controller name="province" control={control} render={({ field }) => (
            <Select label="Provincia" options={provinceOptions} placeholder="Selecciona tu provincia" error={errors.province?.message} value={field.value || ''} onChange={field.onChange} />
          )} />
          <Input label="Ciudad" placeholder="Tu ciudad" error={errors.city?.message} {...register('city')} />
          <Textarea label="Dirección completa" placeholder="Calle principal, número, sector..." error={errors.address?.message} {...register('address')} rows={2} />
          <Input label="Referencia (opcional)" placeholder="Cerca de..." error={errors.reference?.message} {...register('reference')} />
        </div>

        {/* Total */}
        <div className="bg-secondary-900 rounded-xl p-4 text-white mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-secondary-300">Total a pagar</p>
              <p className="text-xs text-secondary-400">Pagas al recibir</p>
            </div>
            <span className="text-2xl sm:text-3xl font-bold">{formatPrice(currentPrice)}</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className="py-4 text-sm sm:text-base font-bold uppercase tracking-wide bg-secondary-900 hover:bg-secondary-800 text-white rounded-xl shadow-lg"
        >
          CONFIRMAR PEDIDO
        </Button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <span className="flex items-center gap-1 text-xs text-secondary-400">
            <svg className="h-3.5 w-3.5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Datos seguros
          </span>
          <span className="flex items-center gap-1 text-xs text-secondary-400">
            <svg className="h-3.5 w-3.5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Sin compromiso
          </span>
        </div>
      </form>
    </div>
  )
}
