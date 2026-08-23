-- ============================================
-- MIGRACIÓN 011: RLS - TABLA PRODUCTS
-- ============================================
-- Owner: CRUD completo sobre productos de SU negocio.
-- Público: puede leer productos activos (para páginas públicas).
-- Admin: puede ver todos.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Owner puede ver sus productos (todos los estados)
CREATE POLICY "products_select_owner"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- Público (anon): solo productos activos de negocios activos
CREATE POLICY "products_select_public"
  ON public.products
  FOR SELECT
  TO anon
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = products.business_id
      AND businesses.status = 'active'
    )
  );

-- Authenticated público: también puede ver productos activos
-- (un usuario logueado viendo una página pública de otro negocio)
CREATE POLICY "products_select_public_authenticated"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = products.business_id
      AND businesses.status = 'active'
    )
  );

-- Admin puede ver todos los productos
CREATE POLICY "products_select_admin"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Owner puede crear productos en su negocio
CREATE POLICY "products_insert_owner"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.get_user_business_id());

-- Owner puede actualizar productos de su negocio
CREATE POLICY "products_update_owner"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id())
  WITH CHECK (business_id = public.get_user_business_id());

-- Owner puede eliminar productos de su negocio (soft delete preferido)
CREATE POLICY "products_delete_owner"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- Admin puede eliminar cualquier producto
CREATE POLICY "products_delete_admin"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
