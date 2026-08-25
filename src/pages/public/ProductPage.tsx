import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  const [quantity, setQuantity] = useState<number>(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
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
    // Sincronizar cantidad seleccionada con el formulario
    if (!hasOptions) {
      setValue('quantity', quantity)
    }
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
  const currentPrice = hasOptions && product.productOptions[selectedOption]
    ? product.productOptions[selectedOption].price
    : product.price

  const provinceOptions = PROVINCES_ECUADOR.map((p) => ({ value: p, label: p }))

  return (
    <div className="min-h-screen bg-white">
      {/* ===== BADGE/PROMO BAR ===== */}
      {product.badgeText && (
        <div className="bg-secondary-900 text-white text-center py-2 px-4">
          <p className="text-2xs sm:text-xs font-medium tracking-wider uppercase">{product.badgeText}</p>
        </div>
      )}

      {/* ===== BUSINESS HEADER ===== */}
      <header className="border-b border-secondary-200 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {product.businessLogo ? (
            <img src={product.businessLogo} alt={product.businessName} className="h-8 sm:h-10 object-contain" />
          ) : (
            <h2 className="text-base sm:text-lg font-bold tracking-[0.2em] text-secondary-900 uppercase">{product.businessName}</h2>
          )}
          {/* Business subtitle/tagline if available */}
          {product.subtitle && (
            <p className="text-2xs sm:text-xs text-secondary-400 mt-0.5 tracking-wide">{product.subtitle}</p>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-2xl mx-auto">
        <div className="flex flex-col">

          {/* ===== GALLERY ===== */}
          <section className="relative bg-gradient-to-b from-secondary-100 to-secondary-50">
            {hasImages ? (
              <>
                {/* Swipeable gallery */}
                <div
                  className="overflow-hidden touch-pan-y"
                  onTouchStart={(e) => {
                    const touch = e.touches[0]
                    e.currentTarget.dataset.startX = String(touch.clientX)
                  }}
                  onTouchEnd={(e) => {
                    const startX = Number(e.currentTarget.dataset.startX || 0)
                    const endX = e.changedTouches[0].clientX
                    const diff = startX - endX
                    if (Math.abs(diff) > 50) {
                      if (diff > 0 && selectedImage < product.images.length - 1) {
                        setSelectedImage(selectedImage + 1)
                      } else if (diff < 0 && selectedImage > 0) {
                        setSelectedImage(selectedImage - 1)
                      }
                    }
                  }}
                >
                  <div className="aspect-square flex items-center justify-center p-8 sm:p-12">
                    <img
                      src={product.images[selectedImage]?.publicUrl}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain drop-shadow-lg transition-opacity duration-300"
                    />
                  </div>
                </div>

                {/* Navigation arrows (desktop) */}
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                      className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md text-secondary-700 transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                      className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md text-secondary-700 transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          idx === selectedImage ? 'bg-secondary-900 w-5' : 'bg-secondary-400'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 px-4 pb-4 pt-2 overflow-x-auto justify-center">
                    {product.images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === selectedImage
                            ? 'border-primary-500 shadow-md'
                            : 'border-secondary-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.publicUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                  <svg className="h-8 w-8 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-secondary-400 text-sm">{product.businessName}</p>
              </div>
            )}
          </section>

          {/* ===== PRODUCT INFO ===== */}
          <section className="px-4 sm:px-6 py-6">

            {/* Category / meta line */}
            {product.subtitle && (
              <p className="text-2xs sm:text-xs text-secondary-400 uppercase tracking-widest mb-2">
                {product.subtitle}
              </p>
            )}

            {/* Product name */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-900 leading-snug">
              {product.name}
            </h1>

            {/* Reviews */}
            {product.reviewsSummary && product.reviewsSummary.count > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex text-yellow-500 text-xs sm:text-sm">
                  {'★'.repeat(Math.round(product.reviewsSummary.rating))}
                  {'☆'.repeat(5 - Math.round(product.reviewsSummary.rating))}
                </div>
                <span className="text-2xs sm:text-xs text-secondary-500">
                  {product.reviewsSummary.rating} · {product.reviewsSummary.count.toLocaleString()} reseñas
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="mt-3 text-xs sm:text-sm text-secondary-600 leading-relaxed">{product.description}</p>
            )}

            {/* ===== PRICE ===== */}
            <div className="mt-5 p-4 bg-gradient-to-r from-secondary-50 to-white rounded-xl border border-secondary-100">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-secondary-900">{formatPrice(currentPrice)}</span>
                {product.previousPrice && (
                  <>
                    <span className="text-sm sm:text-base text-secondary-400 line-through">{formatPrice(product.previousPrice)}</span>
                    <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">-{Math.round(((product.previousPrice - currentPrice) / product.previousPrice) * 100)}%</span>
                  </>
                )}
              </div>
              {product.previousPrice && (
                <p className="text-xs text-success-600 font-semibold mt-1">
                  Ahorras {formatPrice(product.previousPrice - currentPrice)}
                </p>
              )}
            </div>

            {/* ===== COLORS ===== */}
            {product.colors.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <p className="text-xs text-secondary-500">Color:</p>
                <div className="flex items-center gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(i)}
                      className={`relative h-6 w-6 sm:h-7 sm:w-7 rounded-full border transition-all ${
                        selectedColor === i
                          ? 'border-secondary-900 ring-2 ring-offset-1 ring-secondary-900'
                          : 'border-secondary-300 hover:border-secondary-500'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                  <span className="text-xs text-secondary-600 ml-1">{product.colors[selectedColor]?.name}</span>
                </div>
              </div>
            )}

            {/* ===== FEATURES TABS ===== */}
            {hasFeatures && (
              <div className="mt-5 flex flex-wrap gap-0 border border-secondary-200 rounded-lg overflow-hidden w-fit">
                {product.features.map((f, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center px-4 py-2.5 min-w-[60px] ${
                      i > 0 ? 'border-l border-secondary-200' : ''
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-secondary-900">{f.value}</span>
                    <span className="text-2xs text-secondary-400 mt-0.5">{f.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ===== PRODUCT OPTIONS / PACKS ===== */}
            {hasOptions ? (
              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">Elige tu opción</p>
                {product.productOptions.map((opt: ProductOption, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedOption(i)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selectedOption === i
                        ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    {/* Radio indicator */}
                    <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedOption === i ? 'border-primary-500 bg-primary-500' : 'border-secondary-300'
                    }`}>
                      {selectedOption === i && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Option info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-secondary-900">{opt.title}</span>
                        {opt.popular && (
                          <span className="text-2xs bg-primary-600 text-white px-1.5 py-0.5 rounded-full font-medium">Popular</span>
                        )}
                      </div>
                      <p className="text-2xs sm:text-xs text-secondary-500 truncate">{opt.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xs text-secondary-400 line-through">{formatPrice(opt.originalPrice)}</p>
                      <p className="text-sm font-bold text-secondary-900">{formatPrice(opt.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Selector de cantidad simple cuando no hay opciones */
              <div className="mt-5">
                <p className="text-xs text-secondary-500 mb-2">Cantidad:</p>
                <div className="inline-flex items-center border border-secondary-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-9 w-9 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 transition-colors border-r border-secondary-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="h-9 w-12 flex items-center justify-center text-sm font-semibold text-secondary-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="h-9 w-9 flex items-center justify-center text-secondary-600 hover:bg-secondary-50 transition-colors border-l border-secondary-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {quantity > 1 && (
                  <p className="text-xs text-secondary-500 mt-1.5">
                    Total: <span className="font-semibold text-secondary-900">{formatPrice(currentPrice * quantity)}</span>
                  </p>
                )}
              </div>
            )}

            {/* ===== CTA BUTTON ===== */}
            {!showForm && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary-500/25"
                >
                  COMPRAR — PAGO AL RECIBIR
                </button>
                {product.shippingText && (
                  <p className="text-center text-2xs sm:text-xs text-secondary-400 mt-2">{product.shippingText}</p>
                )}
              </div>
            )}

            {/* ===== TRUST BADGES ===== */}
            {product.trustBadges.length > 0 ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {product.trustBadges.map((badge, i) => (
                  <div key={i} className="text-center py-3 px-1 bg-gradient-to-b from-secondary-50 to-white border border-secondary-200 rounded-xl shadow-sm">
                    <p className="text-lg mb-0.5">{badge.icon}</p>
                    <p className="text-2xs sm:text-xs font-bold text-secondary-800 leading-tight">{badge.label}</p>
                    <p className="text-2xs text-secondary-400">{badge.sublabel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="text-center py-3 px-1 bg-gradient-to-b from-green-50 to-white border border-green-200 rounded-xl shadow-sm">
                  <p className="text-lg mb-0.5">💰</p>
                  <p className="text-2xs sm:text-xs font-bold text-secondary-800">Pago</p>
                  <p className="text-2xs text-green-600">al recibir</p>
                </div>
                <div className="text-center py-3 px-1 bg-gradient-to-b from-blue-50 to-white border border-blue-200 rounded-xl shadow-sm">
                  <p className="text-lg mb-0.5">🚚</p>
                  <p className="text-2xs sm:text-xs font-bold text-secondary-800">Envío</p>
                  <p className="text-2xs text-blue-600">a domicilio</p>
                </div>
                <div className="text-center py-3 px-1 bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-xl shadow-sm">
                  <p className="text-lg mb-0.5">⚡</p>
                  <p className="text-2xs sm:text-xs font-bold text-secondary-800">Entrega</p>
                  <p className="text-2xs text-purple-600">24-72h</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {product.benefits && (
              <div className="mt-5 text-xs sm:text-sm text-secondary-600 leading-relaxed whitespace-pre-line">
                {product.benefits}
              </div>
            )}

            {/* Delivery & Payment */}
            {(product.deliveryInfo || product.paymentInfo) && (
              <div className="mt-4 space-y-2 text-xs sm:text-sm text-secondary-500">
                {product.deliveryInfo && (
                  <p className="flex items-start gap-2">
                    <span className="text-secondary-400">🚚</span>
                    {product.deliveryInfo}
                  </p>
                )}
                {product.paymentInfo && (
                  <p className="flex items-start gap-2">
                    <span className="text-secondary-400">💳</span>
                    {product.paymentInfo}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ===== ORDER FORM ===== */}
        {showForm && (
          <div ref={formRef} className="px-4 sm:px-6 pb-8">
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
      </main>

      {/* ===== CONTENT SECTIONS ===== */}
      {hasSections && (
        <section className="border-t border-secondary-200">
          <div className="max-w-2xl mx-auto">
            {product.sections.map((sec, i) => (
              <div key={i} className="border-b border-secondary-100 last:border-b-0">
                {sec.imageUrl && (
                  <div className="bg-secondary-900">
                    <img
                      src={sec.imageUrl}
                      alt={sec.title}
                      className="w-full h-56 sm:h-72 object-cover"
                    />
                  </div>
                )}
                <div className={`px-4 sm:px-6 py-8 ${
                  sec.imageUrl ? 'bg-secondary-900 text-white' : 'bg-white'
                }`}>
                  {sec.subtitle && (
                    <p className={`text-2xs sm:text-xs font-medium uppercase tracking-wider mb-2 ${
                      sec.imageUrl ? 'text-secondary-300' : 'text-primary-600'
                    }`}>{sec.subtitle}</p>
                  )}
                  <h2 className={`text-lg sm:text-xl font-bold mb-3 leading-snug ${
                    sec.imageUrl ? 'text-white' : 'text-secondary-900'
                  }`}>{sec.title}</h2>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                    sec.imageUrl ? 'text-secondary-300' : 'text-secondary-600'
                  }`}>{sec.description}</p>
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="space-y-2">
                      {sec.bullets.map((b, bi) => (
                        <li key={bi} className={`flex items-start gap-2 text-xs sm:text-sm ${
                          sec.imageUrl ? 'text-secondary-200' : 'text-secondary-700'
                        }`}>
                          <svg className="h-4 w-4 text-success-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* ===== REVIEWS ===== */}
      {hasReviews && (
        <section className="border-t border-secondary-200 py-10 bg-secondary-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-secondary-900">Reseñas de clientes</h2>
              {product.reviewsSummary && product.reviewsSummary.count > 0 && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-xl font-bold text-secondary-900">{product.reviewsSummary.rating}</span>
                  <div className="text-yellow-500 text-sm">{'★'.repeat(Math.round(product.reviewsSummary.rating))}</div>
                  <span className="text-xs text-secondary-500">({product.reviewsSummary.count.toLocaleString()})</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {product.reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-secondary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-secondary-200 flex items-center justify-center">
                      <span className="text-secondary-600 font-semibold text-xs">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-secondary-900">{review.name}</p>
                      <p className="text-2xs text-secondary-400">{review.city}</p>
                    </div>
                  </div>
                  <div className="text-yellow-500 text-xs mb-1.5">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-xs text-secondary-600 leading-relaxed">{review.text}</p>
                  {review.detail && <p className="text-2xs text-secondary-400 mt-1.5 italic">{review.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      {hasFaq && (
        <section className="border-t border-secondary-200 py-10">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondary-900 text-center mb-6">Preguntas frecuentes</h2>
            <div className="space-y-1">
              {product.faq.map((item: ProductFAQ, i: number) => (
                <div key={i} className="border-b border-secondary-200">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-3.5 text-left"
                  >
                    <span className="text-xs sm:text-sm font-medium text-secondary-900 pr-4">{item.question}</span>
                    <svg
                      className={`h-4 w-4 text-secondary-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="pb-3.5 text-xs sm:text-sm text-secondary-600 leading-relaxed animate-fade-in">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FINAL CTA ===== */}
      {!showForm && (
        <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-10 border-t">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <p className="text-white font-bold text-lg mb-1">{product.name}</p>
            <p className="text-2xl font-bold text-white mb-5">{formatPrice(currentPrice)}</p>
            <button
              type="button"
              onClick={scrollToForm}
              className="w-full max-w-sm mx-auto block py-3.5 bg-white text-primary-700 hover:bg-primary-50 text-sm font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg"
            >
              Comprar ahora
            </button>
          </div>
        </section>
      )}

      {/* ===== STICKY BOTTOM CTA ===== */}
      {!showForm && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-secondary-200 px-4 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-secondary-900">{formatPrice(currentPrice)}</p>
              {product.previousPrice && (
                <p className="text-2xs text-secondary-400 line-through">{formatPrice(product.previousPrice)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={scrollToForm}
              className="flex-shrink-0 py-3 px-8 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Comprar
            </button>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      {product.showBranding && (
        <footer className="border-t border-secondary-200 py-5">
          <p className="text-center text-2xs sm:text-xs text-secondary-400">
            Powered by <span className="font-medium">{APP_NAME}</span>
          </p>
        </footer>
      )}

      {/* Spacer for sticky CTA */}
      {!showForm && <div className="h-16 lg:hidden" />}
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
        <div className="h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-secondary-900 mb-2">Producto no encontrado</h1>
        <p className="text-xs sm:text-sm text-secondary-500">Este producto no existe o no está disponible.</p>
      </div>
    </div>
  )
}

function SuccessView({ orderNumber, product }: { orderNumber: number; product: ProductLandingData }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-sm w-full">
        <div className="h-16 w-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-5">
          <svg className="h-8 w-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-secondary-900 mb-2">¡Pedido realizado!</h1>
        <p className="text-sm text-secondary-600 mb-1">
          Tu pedido <span className="font-semibold">#{orderNumber}</span> fue registrado.
        </p>
        <p className="text-xs text-secondary-500 mb-6">El vendedor se pondrá en contacto contigo.</p>
        {product.businessWhatsapp && (
          <a
            href={`https://wa.me/593${product.businessWhatsapp.slice(1)}?text=Hola, realicé el pedido %23${orderNumber} de ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <button
              type="button"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Contactar por WhatsApp
            </button>
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
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-secondary-200 shadow-sm mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-secondary-100">
        <div className="h-9 w-9 rounded-full bg-secondary-900 flex items-center justify-center flex-shrink-0">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-secondary-900">Completa tu pedido</h3>
          <p className="text-2xs sm:text-xs text-secondary-500">{product.name} · Pago contra entrega</p>
        </div>
      </div>

      {orderError && <Alert variant="error" className="mb-3">{orderError}</Alert>}

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Personal data */}
        <div className="space-y-2.5">
          <p className="text-2xs font-semibold text-secondary-400 uppercase tracking-wider">Datos personales</p>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
            <Input label="Nombre" placeholder="Juan" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Apellido" placeholder="Pérez" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Teléfono" type="tel" placeholder="0991234567" error={errors.phone?.message} {...register('phone')} />
        </div>

        {/* Address */}
        <div className="space-y-2.5 pt-3 border-t border-secondary-100">
          <p className="text-2xs font-semibold text-secondary-400 uppercase tracking-wider">Dirección de entrega</p>
          <Controller name="province" control={control} render={({ field }) => (
            <Select label="Provincia" options={provinceOptions} placeholder="Selecciona" error={errors.province?.message} value={field.value || ''} onChange={field.onChange} />
          )} />
          <Input label="Ciudad" placeholder="Tu ciudad" error={errors.city?.message} {...register('city')} />
          <Textarea label="Dirección" placeholder="Calle, número, sector..." error={errors.address?.message} {...register('address')} rows={2} />
          <Input label="Referencia (opcional)" placeholder="Cerca de..." error={errors.reference?.message} {...register('reference')} />
        </div>

        {/* Total */}
        <div className="bg-secondary-900 rounded-lg p-3.5 text-white mt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-secondary-300">Total a pagar</p>
              <p className="text-2xs text-secondary-400">Pagas al recibir</p>
            </div>
            <span className="text-xl sm:text-2xl font-bold">{formatPrice(currentPrice)}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-secondary-900 hover:bg-secondary-800 disabled:bg-secondary-400 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          {isSubmitting ? 'Procesando...' : 'CONFIRMAR PEDIDO'}
        </button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <span className="flex items-center gap-1 text-2xs text-secondary-400">
            <svg className="h-3 w-3 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Datos seguros
          </span>
          <span className="flex items-center gap-1 text-2xs text-secondary-400">
            <svg className="h-3 w-3 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Sin compromiso
          </span>
        </div>
      </form>
    </div>
  )
}
