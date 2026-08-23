import { useState, useRef } from 'react'
import { Alert } from '@/components/ui/Alert'
import { storageService } from '@/services/storage.service'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from '@/utils/constants'

interface ImageUploaderProps {
  businessId: string
  productId: string
  images: Array<{ id: string; storagePath: string; publicUrl: string; sortOrder: number }>
  maxImages: number
  onImagesChange: () => void
}

export function ImageUploader({ businessId, productId, images, maxImages, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canUpload = images.length < maxImages

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setUploading(true)

    const remainingSlots = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const sortOrder = images.length + i

      const { result, error: uploadError } = await storageService.uploadProductImage(
        businessId,
        productId,
        file
      )

      if (uploadError || !result) {
        setError(uploadError || 'Error subiendo imagen')
        break
      }

      // Guardar registro en DB
      const { error: saveError } = await storageService.saveImageRecord(
        productId,
        result.storagePath,
        result.publicUrl,
        sortOrder
      )

      if (saveError) {
        setError(saveError)
        break
      }
    }

    setUploading(false)
    onImagesChange()

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (imageId: string, storagePath: string) => {
    const { error: delError } = await storageService.deleteImageRecord(imageId, storagePath)
    if (delError) {
      setError(delError)
      return
    }
    onImagesChange()
  }

  return (
    <div>
      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {images.map((img, idx) => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary-100">
              <img
                src={img.publicUrl}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-primary-600 text-white text-2xs px-1.5 py-0.5 rounded font-medium">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.id, img.storagePath)}
                className="absolute top-1 right-1 bg-danger-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar imagen"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUpload && (
        <div
          className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click() }}
        >
          {uploading ? (
            <p className="text-sm text-primary-600 font-medium">Subiendo...</p>
          ) : (
            <>
              <svg className="h-8 w-8 text-secondary-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-secondary-600">Click para seleccionar imágenes</p>
              <p className="text-xs text-secondary-400 mt-1">
                JPG, PNG o WebP. Máximo {MAX_FILE_SIZE_MB}MB. {images.length}/{maxImages} imágenes.
              </p>
            </>
          )}
        </div>
      )}

      {!canUpload && (
        <p className="text-xs text-secondary-500 text-center">
          Máximo de {maxImages} imágenes alcanzado.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading || !canUpload}
      />
    </div>
  )
}
