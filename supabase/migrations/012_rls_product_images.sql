-- ============================================
-- MIGRACIÓN 012: RLS - TABLA PRODUCT_IMAGES
-- ============================================
-- Owner: CRUD sobre imágenes de SUS productos.
-- Público: puede ver imágenes de productos activos (páginas públicas).
-- Admin: puede ver todas.

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Owner puede ver imágenes de sus productos
CREATE POLICY "product_images_select_owner"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.business_id = public.get_user_business_id()
    )
  );

-- Público (anon): imágenes de productos activos en negocios activos
CREATE POLICY "product_images_select_public"
  ON public.product_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.businesses ON businesses.id = products.business_id
      WHERE products.id = product_images.product_id
      AND products.status = 'active'
      AND businesses.status = 'active'
    )
  );

-- Authenticated público: misma política para usuarios logueados viendo páginas públicas
CREATE POLICY "product_images_select_public_auth"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      JOIN public.businesses ON businesses.id = products.business_id
      WHERE products.id = product_images.product_id
      AND products.status = 'active'
      AND businesses.status = 'active'
    )
  );

-- Admin puede ver todas las imágenes
CREATE POLICY "product_images_select_admin"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Owner puede insertar imágenes en sus productos
CREATE POLICY "product_images_insert_owner"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.business_id = public.get_user_business_id()
    )
  );

-- Owner puede actualizar imágenes de sus productos (reordenar)
CREATE POLICY "product_images_update_owner"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.business_id = public.get_user_business_id()
    )
  );

-- Owner puede eliminar imágenes de sus productos
CREATE POLICY "product_images_delete_owner"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
      AND products.business_id = public.get_user_business_id()
    )
  );
