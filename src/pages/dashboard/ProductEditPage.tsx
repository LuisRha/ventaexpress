import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { LoadingPage } from '@/components/shared/LoadingPage'
import { ErrorState } from '@/components/shared/ErrorState'
import { ImageUploader } from '@/components/forms/ImageUploader'
import { ProductAdvancedFields } from '@/components/forms/ProductAdvancedFields'
import { useAuth } from '@/contexts/AuthContext'
import { productsService } from '@/services/products.service'
import { storageService } from '@/services/storage.service'
import { updateProductSchema, type UpdateProductFormData } from '@/lib/validations/product'
import type { Product } from '@/types'
import type { ProductFeature, ProductOption, ProductColor, TrustBadge } from '@/types/product-landing'

export function ProductEditPage() {
  const { productId } = useParams()
  const { business } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [images, setImages] = useState<Array<{ id: string; storagePath: string; publicUrl: string; sortOrder: number }>>([])

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
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
  })

  const loadProduct = useCallback(async () => {
    if (!productId) return
    setLoading(true)

    const { product: p, error } = await productsService.getProductById(productId)

    if (error || !p) {
      setProduct(null)
    } else {
      setProduct(p)
      reset({
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        benefits: p.benefits || '',
        price: p.price,
        previousPrice: p.previousPrice,
        stock: p.stock,
        deliveryInfo: p.deliveryInfo || '',
        paymentInfo: p.paymentInfo || '',
      })
      // Cargar campos avanzados
      setColors(p.colors || [])
      setFeatures(p.features || [])
      setProductOptions(p.productOptions || [])
      setTrustBadges(p.trustBadges || [])
      setSubtitle(p.subtitle || '')
      setBadgeText(p.badgeText || '')
      setShippingText(p.shippingText || '')
    }

    setLoading(false)
  }, [productId, reset])

  const loadImages = useCallback(async () => {
    if (!productId) return
    const { images: imgs } = await storageService.getProductImages(productId)
    setImages(imgs)
  }, [productId])

  useEffect(() => {
    loadProduct()
    loadImages()
  }, [loadProduct, loadImages])

  const onSubmit = async (data: UpdateProductFormData) => {
    if (!product) return
    setServerError(null)
    setSuccess(false)

    const { error } = await productsService.updateProduct(product.id, {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      benefits: data.benefits || null,
      price: data.price,
      previousPrice: data.previousPrice,
      stock: data.stock,
      deliveryInfo: data.deliveryInfo || null,
      paymentInfo: data.paymentInfo || null,
      // Campos avanzados
      subtitle: subtitle || null,
      badgeText: badgeText || null,
      shippingText: shippingText || null,
      features,
      colors,
      productOptions,
      trustBadges,
    })

    if (error) {
      setServerError(error)
      return
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    loadProduct()
  }

  const handleDelete = async () => {
    if (!product) return
    const { error } = await productsService.deleteProduct(product.id)
    if (error) { setServerError(error); return }
    navigate('/dashboard/products', { replace: true })
  }

  if (loading) return <LoadingPage />
  if (!product) return <ErrorState title="Producto no encontrado" message="Este producto no existe o fue eliminado." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Editar producto</h1>
          <p className="text-secondary-500 mt-1">{product.name}</p>
        </div>
        <Link
          to={`/${business?.slug}/${product.slug}`}
          target="_blank"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Ver página pública →
        </Link>
      </div>

      {serverError && <Alert variant="error" className="mb-4">{serverError}</Alert>}
      {success && <Alert variant="success" className="mb-4">Producto actualizado correctamente.</Alert>}

      <div className="space-y-6 max-w-2xl">
        {/* IMÁGENES */}
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Imágenes del producto</h2>
          <p className="text-sm text-secondary-500 mb-4">La primera imagen será la principal. Máximo 5 imágenes.</p>
          {business && productId && (
            <ImageUploader
              businessId={business.id}
              productId={productId}
              images={images}
              maxImages={5}
              onImagesChange={loadImages}
            />
          )}
        </Card>

        {/* FORMULARIO */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Información básica</h2>
            <div className="space-y-4">
              <Input
                label="Nombre del producto"
                placeholder="Ej: Billetera KODEX"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="URL del producto"
                placeholder="billetera-kodex"
                error={errors.slug?.message}
                hint={business ? `${window.location.origin}/${business.slug}/${product.slug}` : undefined}
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
                placeholder="Lista los beneficios..."
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
                placeholder="Ej: Envío a todo Ecuador en 3-5 días..."
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

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" size="lg" isLoading={isSubmitting} disabled={!isDirty}>
              Guardar cambios
            </Button>
            <Link to="/dashboard/products">
              <Button type="button" variant="outline" size="lg">Volver</Button>
            </Link>
          </div>
        </form>

        {/* Zona de peligro */}
        <Card className="border-danger-200">
          <h2 className="text-lg font-semibold text-danger-700 mb-2">Zona de peligro</h2>
          <p className="text-sm text-secondary-600 mb-4">Eliminar este producto es permanente.</p>
          {!deleteConfirm ? (
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>Eliminar producto</Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="danger" size="sm" onClick={handleDelete}>Confirmar eliminación</Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
