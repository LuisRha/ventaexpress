// ============================================
// EDGE FUNCTION: PROCESS IMAGE
// ============================================
// Procesa imágenes subidas:
// 1. Valida MIME type y magic bytes
// 2. Redimensiona (max 1200px)
// 3. Comprime
// 4. Convierte a WebP
//
// NOTA: Sharp no está disponible en Deno Deploy.
// En producción se usaría un servicio externo (Cloudflare Images, imgproxy)
// o se procesaría en un worker con Node.js runtime.
// Esta función es un placeholder de la arquitectura.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Magic bytes para validar tipo de archivo real
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return jsonResponse({ error: 'No se proporcionó archivo.' }, 400)
    }

    // Validar tamaño (8MB)
    if (file.size > 8 * 1024 * 1024) {
      return jsonResponse({ error: 'Archivo demasiado grande. Máximo 8MB.' }, 400)
    }

    // Validar MIME type declarado
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse({ error: 'Tipo de archivo no permitido.' }, 400)
    }

    // Validar magic bytes (contenido real del archivo)
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    if (!validateMagicBytes(bytes, file.type)) {
      return jsonResponse({ error: 'El contenido del archivo no corresponde al tipo declarado.' }, 400)
    }

    // En producción aquí se haría:
    // 1. Redimensionar a max 1200x1200
    // 2. Comprimir (quality 80-85)
    // 3. Convertir a WebP
    // 4. Retornar el buffer procesado

    // Por ahora retornamos validación exitosa
    return jsonResponse({
      valid: true,
      originalSize: file.size,
      type: file.type,
      message: 'Imagen validada. Procesamiento completo requiere runtime Node.js con Sharp.',
    })

  } catch (err) {
    console.error('Error processing image:', err)
    return jsonResponse({ error: 'Error procesando imagen.' }, 500)
  }
})

function validateMagicBytes(bytes: Uint8Array, declaredType: string): boolean {
  const expected = MAGIC_BYTES[declaredType]
  if (!expected) return false

  for (let i = 0; i < expected.length; i++) {
    if (bytes[i] !== expected[i]) return false
  }
  return true
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
