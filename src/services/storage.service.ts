import { supabase } from '@/lib/supabase'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '@/utils/constants'

// ============================================
// SERVICIO DE STORAGE
// ============================================

const BUCKET = 'product-images'

export interface UploadResult {
  storagePath: string
  publicUrl: string
}

export const storageService = {
  /**
   * Subir imagen de producto a Supabase Storage.
   * Path: products/{businessId}/{productId}/{filename}
   */
  async uploadProductImage(
    businessId: string,
    productId: string,
    file: File
  ): Promise<{ result: UploadResult | null; error: string | null }> {
    // Validar tipo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { result: null, error: 'Tipo de archivo no permitido. Usa JPG, PNG o WebP.' }
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { result: null, error: 'El archivo es demasiado grande. Máximo 8MB.' }
    }

    // Generar nombre único
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const fileName = `${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const storagePath = `products/${businessId}/${productId}/${fileName}`

    // Upload
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return { result: null, error: `Error subiendo imagen: ${error.message}` }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)

    return {
      result: {
        storagePath,
        publicUrl: urlData.publicUrl,
      },
      error: null,
    }
  },

  /**
   * Eliminar imagen del storage.
   */
  async deleteImage(storagePath: string): Promise<{ error: string | null }> {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath])

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Guardar registro de imagen en la tabla product_images.
   */
  async saveImageRecord(
    productId: string,
    storagePath: string,
    publicUrl: string,
    sortOrder: number
  ): Promise<{ id: string | null; error: string | null }> {
    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: storagePath,
        public_url: publicUrl,
        sort_order: sortOrder,
      })
      .select('id')
      .single()

    if (error) {
      return { id: null, error: error.message }
    }

    return { id: data.id, error: null }
  },

  /**
   * Eliminar registro de imagen y archivo del storage.
   */
  async deleteImageRecord(imageId: string, storagePath: string): Promise<{ error: string | null }> {
    // Eliminar del storage
    await this.deleteImage(storagePath)

    // Eliminar registro de la DB
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Obtener imágenes de un producto.
   */
  async getProductImages(productId: string): Promise<{ images: Array<{ id: string; storagePath: string; publicUrl: string; sortOrder: number }>; error: string | null }> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })

    if (error) {
      return { images: [], error: error.message }
    }

    return {
      images: (data || []).map((img) => ({
        id: img.id,
        storagePath: img.storage_path,
        publicUrl: img.public_url,
        sortOrder: img.sort_order,
      })),
      error: null,
    }
  },

  /**
   * Actualizar orden de imágenes.
   */
  async updateImageOrder(images: Array<{ id: string; sortOrder: number }>): Promise<{ error: string | null }> {
    const updates = images.map((img) =>
      supabase
        .from('product_images')
        .update({ sort_order: img.sortOrder })
        .eq('id', img.id)
    )

    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)

    if (failed?.error) {
      return { error: failed.error.message }
    }

    return { error: null }
  },
}
