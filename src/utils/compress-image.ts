import imageCompression from 'browser-image-compression'

/**
 * Comprimir imagen automáticamente antes de subir.
 * - Logo: max 100KB, 200x200px
 * - Producto: max 200KB, 1200x1200px
 */
export async function compressProductImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.2,           // Max 200KB
    maxWidthOrHeight: 1200,   // Max 1200px
    useWebWorker: true,
    fileType: 'image/webp' as const,
  }

  try {
    const compressed = await imageCompression(file, options)
    return compressed
  } catch {
    // Si falla la compresión, devolver original
    return file
  }
}

export async function compressLogo(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.1,           // Max 100KB
    maxWidthOrHeight: 200,    // Max 200px
    useWebWorker: true,
    fileType: 'image/webp' as const,
  }

  try {
    const compressed = await imageCompression(file, options)
    return compressed
  } catch {
    return file
  }
}
