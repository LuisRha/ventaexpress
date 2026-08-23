-- ============================================
-- MIGRACIÓN 009: RLS - TABLA PLANS
-- ============================================
-- Planes son públicos para lectura (cualquiera puede ver los planes).
-- Solo admin puede crear/editar/eliminar planes.

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Lectura pública: cualquier persona (incluso anon) puede ver planes activos
CREATE POLICY "plans_select_public"
  ON public.plans
  FOR SELECT
  USING (active = true);

-- Admin puede ver TODOS los planes (incluyendo inactivos)
CREATE POLICY "plans_select_admin"
  ON public.plans
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Solo admin puede insertar planes
CREATE POLICY "plans_insert_admin"
  ON public.plans
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Solo admin puede actualizar planes
CREATE POLICY "plans_update_admin"
  ON public.plans
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Solo admin puede eliminar planes
CREATE POLICY "plans_delete_admin"
  ON public.plans
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
