import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ProductFeature, ProductOption, ProductColor, TrustBadge } from '@/types/product-landing'

interface ProductAdvancedFieldsProps {
  colors: ProductColor[]
  setColors: (colors: ProductColor[]) => void
  features: ProductFeature[]
  setFeatures: (features: ProductFeature[]) => void
  productOptions: ProductOption[]
  setProductOptions: (options: ProductOption[]) => void
  trustBadges: TrustBadge[]
  setTrustBadges: (badges: TrustBadge[]) => void
  subtitle: string
  setSubtitle: (v: string) => void
  badgeText: string
  setBadgeText: (v: string) => void
  shippingText: string
  setShippingText: (v: string) => void
}

export function ProductAdvancedFields({
  colors, setColors,
  features, setFeatures,
  productOptions, setProductOptions,
  trustBadges, setTrustBadges,
  subtitle, setSubtitle,
  badgeText, setBadgeText,
  shippingText, setShippingText,
}: ProductAdvancedFieldsProps) {
  return (
    <>
      {/* Textos landing */}
      <Card>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Personalización de landing</h2>
        <div className="space-y-4">
          <Input
            label="Subtítulo / Categoría"
            placeholder="Ej: BILLETERA POR CUARTOS - RFID"
            hint="Se muestra arriba del nombre del producto"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <Input
            label="Texto de banner promocional"
            placeholder="Ej: ENVÍO GRATIS · PAGA AL RECIBIR EN TU CASA"
            hint="Barra oscura arriba de la página"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
          />
          <Input
            label="Texto de envío bajo el botón"
            placeholder="Ej: Envíos gratis a todo el Ecuador · Eliges el color al confirmar"
            value={shippingText}
            onChange={(e) => setShippingText(e.target.value)}
          />
        </div>
      </Card>

      {/* Colores */}
      <Card>
        <h2 className="text-lg font-semibold text-secondary-900 mb-1">Colores</h2>
        <p className="text-sm text-secondary-500 mb-4">Agrega las opciones de color disponibles</p>
        <ColorsEditor colors={colors} onChange={setColors} />
      </Card>

      {/* Features */}
      <Card>
        <h2 className="text-lg font-semibold text-secondary-900 mb-1">Características</h2>
        <p className="text-sm text-secondary-500 mb-4">Se muestran como tabs debajo del precio (Ej: "12 Tarjetas", "RFID Bloqueo")</p>
        <FeaturesEditor features={features} onChange={setFeatures} />
      </Card>

      {/* Product Options */}
      <Card>
        <h2 className="text-lg font-semibold text-secondary-900 mb-1">Opciones / Packs</h2>
        <p className="text-sm text-secondary-500 mb-4">Permite al cliente elegir entre diferentes cantidades o packs</p>
        <OptionsEditor options={productOptions} onChange={setProductOptions} />
      </Card>

      {/* Trust Badges */}
      <Card>
        <h2 className="text-lg font-semibold text-secondary-900 mb-1">Insignias de confianza</h2>
        <p className="text-sm text-secondary-500 mb-4">Se muestran debajo del botón de compra (máx 3)</p>
        <TrustBadgesEditor badges={trustBadges} onChange={setTrustBadges} />
      </Card>
    </>
  )
}

// ============================================
// COLORS EDITOR
// ============================================
function ColorsEditor({ colors, onChange }: { colors: ProductColor[]; onChange: (c: ProductColor[]) => void }) {
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('#000000')

  const addColor = () => {
    if (!newName.trim()) return
    onChange([...colors, { name: newName.trim(), value: newValue }])
    setNewName('')
    setNewValue('#000000')
  }

  const removeColor = (idx: number) => {
    onChange(colors.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-1.5">
              <span className="h-5 w-5 rounded-full border border-secondary-300" style={{ backgroundColor: c.value }} />
              <span className="text-sm text-secondary-700">{c.name}</span>
              <button type="button" onClick={() => removeColor(i)} className="text-secondary-400 hover:text-danger-600 ml-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="Nombre" placeholder="Ej: Negro" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div className="w-20">
          <label className="block text-sm font-medium text-secondary-700 mb-1">Color</label>
          <input
            type="color"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="h-10 w-full rounded-lg border border-secondary-300 cursor-pointer"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addColor} className="mb-0.5">
          Agregar
        </Button>
      </div>
    </div>
  )
}

// ============================================
// FEATURES EDITOR
// ============================================
function FeaturesEditor({ features, onChange }: { features: ProductFeature[]; onChange: (f: ProductFeature[]) => void }) {
  const [newValue, setNewValue] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const addFeature = () => {
    if (!newValue.trim() || !newLabel.trim()) return
    onChange([...features, { icon: '', value: newValue.trim(), label: newLabel.trim() }])
    setNewValue('')
    setNewLabel('')
  }

  const removeFeature = (idx: number) => {
    onChange(features.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {features.length > 0 && (
        <div className="flex flex-wrap gap-0 border border-secondary-200 rounded-lg overflow-hidden w-fit">
          {features.map((f, i) => (
            <div key={i} className={`relative flex flex-col items-center justify-center px-4 py-2.5 min-w-[70px] group ${i > 0 ? 'border-l border-secondary-200' : ''}`}>
              <span className="text-sm font-semibold text-secondary-900">{f.value}</span>
              <span className="text-2xs text-secondary-400 uppercase">{f.label}</span>
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="Valor" placeholder="Ej: 12, RFID, 1.4cm" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
        </div>
        <div className="flex-1">
          <Input label="Etiqueta" placeholder="Ej: Tarjetas, Bloqueo, Grosor" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addFeature} className="mb-0.5">
          Agregar
        </Button>
      </div>
    </div>
  )
}

// ============================================
// OPTIONS EDITOR
// ============================================
function OptionsEditor({ options, onChange }: { options: ProductOption[]; onChange: (o: ProductOption[]) => void }) {
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newOrigPrice, setNewOrigPrice] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newPopular, setNewPopular] = useState(false)

  const addOption = () => {
    if (!newTitle.trim() || !newPrice) return
    onChange([...options, {
      title: newTitle.trim(),
      description: newDesc.trim(),
      originalPrice: parseFloat(newOrigPrice) || 0,
      price: parseFloat(newPrice),
      quantity: 1,
      popular: newPopular,
    }])
    setNewTitle('')
    setNewDesc('')
    setNewOrigPrice('')
    setNewPrice('')
    setNewPopular(false)
  }

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx))
  }

  const togglePopular = (idx: number) => {
    onChange(options.map((o, i) => i === idx ? { ...o, popular: !o.popular } : o))
  }

  return (
    <div className="space-y-3">
      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-secondary-200 rounded-lg bg-secondary-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-secondary-900">{opt.title}</span>
                  {opt.popular && <span className="text-2xs bg-secondary-900 text-white px-1.5 py-0.5 rounded">Popular</span>}
                </div>
                <p className="text-xs text-secondary-500 truncate">{opt.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {opt.originalPrice > 0 && <p className="text-2xs text-secondary-400 line-through">${opt.originalPrice.toFixed(2)}</p>}
                <p className="text-sm font-bold text-secondary-900">${opt.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => togglePopular(i)} className="text-secondary-400 hover:text-primary-600" title="Marcar como popular">
                  <svg className={`h-4 w-4 ${opt.popular ? 'text-primary-600' : ''}`} fill={opt.popular ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button type="button" onClick={() => removeOption(i)} className="text-secondary-400 hover:text-danger-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-secondary-300 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-secondary-500 mb-2">Nueva opción</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input label="Título" placeholder="Ej: 1 Billetera" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input label="Descripción" placeholder="Ej: Un color a elección" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
          <Input label="Precio original" type="number" step="0.01" placeholder="59.99" value={newOrigPrice} onChange={(e) => setNewOrigPrice(e.target.value)} />
          <Input label="Precio oferta" type="number" step="0.01" placeholder="29.99" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          <div className="flex items-center gap-2 pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newPopular} onChange={(e) => setNewPopular(e.target.checked)} className="rounded border-secondary-300" />
              <span className="text-sm text-secondary-700">Popular</span>
            </label>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          Agregar opción
        </Button>
      </div>
    </div>
  )
}

// ============================================
// TRUST BADGES EDITOR
// ============================================
function TrustBadgesEditor({ badges, onChange }: { badges: TrustBadge[]; onChange: (b: TrustBadge[]) => void }) {
  const [newIcon, setNewIcon] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newSublabel, setNewSublabel] = useState('')

  const addBadge = () => {
    if (!newLabel.trim()) return
    if (badges.length >= 3) return
    onChange([...badges, { icon: newIcon || '✓', label: newLabel.trim(), sublabel: newSublabel.trim() }])
    setNewIcon('')
    setNewLabel('')
    setNewSublabel('')
  }

  const removeBadge = (idx: number) => {
    onChange(badges.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      {badges.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b, i) => (
            <div key={i} className="relative text-center py-2.5 px-1 border border-secondary-200 rounded-lg group">
              <p className="text-base mb-0.5">{b.icon}</p>
              <p className="text-2xs font-semibold text-secondary-800">{b.label}</p>
              <p className="text-2xs text-secondary-400">{b.sublabel}</p>
              <button
                type="button"
                onClick={() => removeBadge(i)}
                className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {badges.length < 3 && (
        <div className="flex items-end gap-2">
          <div className="w-16">
            <Input label="Emoji" placeholder="💰" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Título" placeholder="Pago" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Subtítulo" placeholder="al recibir" value={newSublabel} onChange={(e) => setNewSublabel(e.target.value)} />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addBadge} className="mb-0.5">
            Agregar
          </Button>
        </div>
      )}
    </div>
  )
}
