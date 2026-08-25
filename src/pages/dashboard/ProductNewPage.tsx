import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { LoadingPage } from '@/components/shared/LoadingPage'
import { ProductAdvancedFields } from '@/components/forms/ProductAdvancedFields'
import { useAuth } from '@/contexts/AuthContext'
import { productsService, type ProductLimits } from '@/services/products.service'
import { storageService } from '@/services/storage.service'
import { createProductSchema, type CreateProductFormData } from '@/lib/validations/product'
import { compressProductImage } from '@/utils/compress-image'
import { slugify } from '@/utils/format'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from '@/utils/constants'
import type { ProductFeature, ProductOption, ProductColor, TrustBadge } from '@/types/product-landing'

export function ProductNewPage() {
  const { business } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [limits, setLimits] = useState<ProductLimits | null>(null)
  const [loadingLimits, setLoadingLimits] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Campos avanzados
  const [colors, setColors] = useState<ProductColor[]>([])
  const [features, setFeatures] = useState<ProductFeature[]>([])
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([])
  const [subtitle, setSubtitle] = useState('')
  const [badgeText, setBadgeText] = useState('')
  const [shippingText, setShippingText] = useState('')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      benefits: '',
      price: undefined,
      previousPrice: null,
      stock: -1,
      deliveryInfo: '',
      paymentInfo: '',
    },
  })

  // Cargar límites
  useEffect(() => {
    if (!business) return
    const loadLimits = async () => {
      const { limits: l } = await productsService.getProductLimits(business.id)
      setLimits(l)
      setLoadingLimits(false)
    }
    loadLimits()
  }, [business])

  // Auto-generar slug desde nombre
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value
      const slug = slugify(name)
      if (slug.length >= 2) {
        setValue('slug', slug, { shouldValidate: true })
      }
    },
    [setValue]
  )

  const onSubmit = async (data: CreateProductFormData) => {
    if (!business) return
    setServerError(null)

    const { product, error } = await productsService.createProduct(business.id, {
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      benefits: data.benefits || undefined,
      price: data.price,
      previousPrice: data.previousPrice,
      stock: data.stock,
      deliveryInfo: data.deliveryInfo || undefined,
      paymentInfo: data.paymentInfo || undefined,
      // Campos avanzados
      subtitle: subtitle || undefined,
      badgeText: badgeText || undefined,
      shippingText: shippingText || undefined,
      features,
      colors,
      productOptions,
      trustBadges,
    })

    if (error) {
      setServerError(error)
      return
    }

    // Subir imágenes comprimidas
    if (product && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const compressed = await compressProductImage(selectedFiles[i])
        const { result } = await storageService.uploadProductImage(business.id, product.id, compressed)
        if (result) {
          await storageService.saveImageRecord(product.id, result.storagePath, result.publicUrl, i)
        }
      }
    }

    navigate('/dashboard/products', { replace: true })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const maxImages = limits?.maxImagesPerProduct || 5
    const remaining = maxImages - selectedFiles.length
    const newFiles = Array.from(files).slice(0, remaining)

    // Validar
    for (const file of newFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setServerError('Solo se permiten imágenes JPG, PNG o WebP')
        return
      }
    }

    setSelectedFiles(prev => [...prev, ...newFiles])

    // Crear previews
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  if (loadingLimits) {
    return <LoadingPage />
  }

  // Si no puede crear más productos
  if (limits && !limits.canCreate) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <Alert variant="warning" title="Límite alcanzado">
          Has alcanzado el máximo de {limits.maxProducts} productos de tu plan.
          Actualiza a PRO para crear hasta 10 productos.
        </Alert>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/plan">
            <Button>Ver planes</Button>
          </Link>
          <Link to="/dashboard/products">
            <Button variant="outline">Volver a productos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Nuevo producto</h1>
        <p className="text-secondary-500 mt-1">
          {limits ? `${limits.currentProducts} de ${limits.maxProducts} productos creados` : 'Completa la información'}
        </p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form className="space-y-6 max-w-2xl" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Información básica</h2>
          <div className="space-y-4">
            <Input
              label="Nombre del producto"
              placeholder="Ej: Billetera KODEX"
              error={errors.name?.message}
              {...register('name', { onChange: handleNameChange })}
            />
            <Input
              label="URL del producto"
              placeholder="billetera-kodex"
              error={errors.slug?.message}
              hint={business ? `${window.location.origin}/${business.slug}/${''} ` : undefined}
              {...register('slug')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Precio (USD)"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="19.99"
                    error={errors.price?.message}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === '' ? undefined : parseFloat(val))
                    }}
                  />
                )}
              />
              <Controller
                name="previousPrice"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Precio anterior (opcional)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="29.99"
                    hint="Para mostrar descuento"
                    error={errors.previousPrice?.message}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === '' ? null : parseFloat(val))
                    }}
                  />
                )}
              />
            </div>
            <Textarea
              label="Descripción"
              placeholder="Describe tu producto..."
              error={errors.description?.message}
              {...register('description')}
            />
            <Textarea
              label="Beneficios"
              placeholder="Lista los beneficios de tu producto..."
              error={errors.benefits?.message}
              {...register('benefits')}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Entrega y pago</h2>
          <div className="space-y-4">
            <Textarea
              label="Información de entrega"
              placeholder="Ej: Envío a todo Ecuador en 3-5 días hábiles..."
              error={errors.deliveryInfo?.message}
              {...register('deliveryInfo')}
            />
            <Textarea
              label="Información de pago"
              placeholder="Ej: Pago contra entrega disponible..."
              error={errors.paymentInfo?.message}
              {...register('paymentInfo')}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Imágenes</h2>
          <p className="text-sm text-secondary-500 mb-3">Máximo {limits?.maxImagesPerProduct || 5} imágenes. Se comprimen automáticamente.</p>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-secondary-100">
                  <img src={preview} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-primary-600 text-white text-2xs px-1.5 py-0.5 rounded font-medium">Principal</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded hover:bg-red-700"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {selectedFiles.length < (limits?.maxImagesPerProduct || 5) && (
            <div
              className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="h-8 w-8 text-secondary-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-secondary-600">Click para seleccionar imágenes</p>
              <p className="text-xs text-secondary-400 mt-1">JPG, PNG o WebP. Máx {MAX_FILE_SIZE_MB}MB. {selectedFiles.length}/{limits?.maxImagesPerProduct || 5}</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </Card>

        {/* Campos avanzados de landing */}
        <ProductAdvancedFields
          colors={colors}
          setColors={setColors}
          features={features}
          setFeatures={setFeatures}
          productOptions={productOptions}
          setProductOptions={setProductOptions}
          trustBadges={trustBadges}
          setTrustBadges={setTrustBadges}
          subtitle={subtitle}
          setSubtitle={setSubtitle}
          badgeText={badgeText}
          setBadgeText={setBadgeText}
          shippingText={shippingText}
          setShippingText={setShippingText}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Crear producto
          </Button>
          <Link to="/dashboard/products">
            <Button type="button" variant="outline" size="lg">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
