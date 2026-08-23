import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { productsService, type ProductLimits } from '@/services/products.service'
import type { Product } from '@/types'
import { formatPrice } from '@/utils/format'

export function ProductsPage() {
  const { business } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [limits, setLimits] = useState<ProductLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    if (!business) return
    setLoading(true)

    const [productsResult, limitsResult] = await Promise.all([
      productsService.getProducts(business.id),
      productsService.getProductLimits(business.id),
    ])

    if (productsResult.error) {
      setError(productsResult.error)
    } else {
      setProducts(productsResult.products)
    }

    setLimits(limitsResult.limits)
    setLoading(false)
  }, [business])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleCopyLink = (product: Product) => {
    const url = `${window.location.origin}/${business?.slug}/${product.slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(product.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggleStatus = async (product: Product) => {
    const { error: err } = await productsService.toggleProductStatus(product.id, product.status)
    if (!err) {
      loadProducts()
    }
  }

  if (loading) {
    return <LoadingSpinner className="py-12" />
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Productos</h1>
          <p className="text-secondary-500 mt-1">
            {limits ? `${limits.currentProducts} de ${limits.maxProducts} productos creados` : ''}
          </p>
        </div>
        <Link to="/dashboard/products/new">
          <Button disabled={limits ? !limits.canCreate : false}>
            Nuevo producto
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">{error}</Alert>
      )}

      {limits && !limits.canCreate && (
        <Alert variant="warning" className="mb-4">
          Has alcanzado el límite de tu plan.{' '}
          <Link to="/dashboard/plan" className="font-medium underline">Actualiza a PRO</Link> para crear más productos.
        </Alert>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="Crea tu primer producto para empezar a vender."
          action={
            <Link to="/dashboard/products/new">
              <Button>Crear producto</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} padding="none" className="overflow-hidden">
              {/* Image */}
              <div className="aspect-video bg-secondary-100 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].publicUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <svg className="h-10 w-10 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-secondary-900 truncate">{product.name}</h3>
                  <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                    {product.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-lg font-semibold text-primary-600 mb-3">
                  {formatPrice(product.price)}
                  {product.previousPrice && (
                    <span className="text-sm text-secondary-400 line-through ml-2">
                      {formatPrice(product.previousPrice)}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Link to={`/dashboard/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(product)}
                    title={product.status === 'active' ? 'Desactivar' : 'Activar'}
                  >
                    {product.status === 'active' ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(product)}
                    title="Copiar enlace"
                  >
                    {copiedId === product.id ? (
                      <svg className="h-4 w-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
