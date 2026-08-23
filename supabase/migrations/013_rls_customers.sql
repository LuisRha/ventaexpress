-- ============================================
-- MIGRACIÓN 013: RLS - TABLA CUSTOMERS
-- ============================================
-- Los clientes están completamente aislados por business_id.
-- Solo el owner del negocio puede ver sus clientes.
-- Los clientes se crean desde Edge Functions (service_role) al procesar pedidos.
-- Admin puede ver todos.

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Owner puede ver clientes de su negocio
CREATE POLICY "customers_select_owner"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- Admin puede ver todos los clientes
CREATE POLICY "customers_select_admin"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: se hace desde Edge Functions con service_role
-- No permitir INSERT directo desde el cliente autenticado normal
-- Solo se permite via service_role (Edge Functions)
-- Pero si el owner necesita crear clientes manualmente en el futuro:
CREATE POLICY "customers_insert_owner"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.get_user_business_id());

-- Owner puede actualizar datos de sus clientes
CREATE POLICY "customers_update_owner"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id())
  WITH CHECK (business_id = public.get_user_business_id());

-- No se permite DELETE de clientes (datos históricos de pedidos)
-- Solo admin puede eliminar si es necesario
CREATE POLICY "customers_delete_admin"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
