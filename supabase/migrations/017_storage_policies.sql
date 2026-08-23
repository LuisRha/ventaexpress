-- ============================================
-- MIGRACIÓN 017: SUPABASE STORAGE POLICIES
-- ============================================
-- Bucket: product-images
-- Estructura: products/{business_id}/{product_id}/filename.webp
--
-- Políticas:
-- - Público: puede LEER imágenes de cualquier producto (son URLs públicas).
-- - Owner: puede SUBIR, ACTUALIZAR y ELIMINAR imágenes de SU negocio.
-- - Nadie más puede modificar archivos ajenos.

-- ============================================
-- CREAR BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,  -- Bucket público (las URLs son accesibles sin auth)
  8388608,  -- 8MB máximo por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLÍTICAS DE STORAGE
-- ============================================

-- Público puede leer cualquier imagen (las páginas de producto son públicas)
CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Owner puede subir imágenes SOLO en la carpeta de su negocio
-- Path esperado: products/{business_id}/{product_id}/filename.webp
CREATE POLICY "product_images_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'products'
    AND (storage.foldername(name))[2] = public.get_user_business_id()::text
  );

-- Owner puede actualizar imágenes de su negocio
CREATE POLICY "product_images_owner_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'products'
    AND (storage.foldername(name))[2] = public.get_user_business_id()::text
  );

-- Owner puede eliminar imágenes de su negocio
CREATE POLICY "product_images_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'products'
    AND (storage.foldername(name))[2] = public.get_user_business_id()::text
  );
