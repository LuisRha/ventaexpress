-- ============================================
-- MIGRACIÓN 010: RLS - TABLA BUSINESSES
-- ============================================
-- El owner solo puede ver/editar SU negocio.
-- Admin puede ver todos los negocios.
-- Lectura pública limitada (para resolver slugs en páginas públicas).

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Owner puede ver su propio negocio
CREATE POLICY "businesses_select_owner"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Admin puede ver todos los negocios
CREATE POLICY "businesses_select_admin"
  ON public.businesses
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Lectura pública: resolver slug para páginas de producto
-- Solo expone id, slug y nombre (la query del frontend solo pide esos campos)
CREATE POLICY "businesses_select_public_slug"
  ON public.businesses
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Owner puede crear su negocio (solo uno por usuario, constraint en tabla)
CREATE POLICY "businesses_insert_owner"
  ON public.businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- Owner puede actualizar su negocio
CREATE POLICY "businesses_update_owner"
  ON public.businesses
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Admin puede actualizar cualquier negocio (suspender, reactivar, cambiar plan)
CREATE POLICY "businesses_update_admin"
  ON public.businesses
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- No se permite DELETE real — solo soft delete (status = 'deleted')
-- Si se necesita DELETE físico, solo admin:
CREATE POLICY "businesses_delete_admin"
  ON public.businesses
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
