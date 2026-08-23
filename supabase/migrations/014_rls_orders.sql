-- ============================================
-- MIGRACIÓN 014: RLS - TABLAS ORDERS Y ORDER_ITEMS
-- ============================================
-- IMPORTANTE sobre pedidos:
-- Los pedidos se CREAN desde Edge Functions (service_role) que validan todo.
-- El frontend público NO inserta directamente en orders.
-- El owner puede VER y ACTUALIZAR estado de sus pedidos.
-- Admin puede ver todos.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDERS
-- ============================================

-- Owner puede ver pedidos de su negocio
CREATE POLICY "orders_select_owner"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- Admin puede ver todos los pedidos
CREATE POLICY "orders_select_admin"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: SOLO via Edge Functions (service_role)
-- No se permite INSERT directo desde frontend.
-- La Edge Function usa service_role_key que bypasea RLS.
-- No crear política INSERT para anon ni authenticated.

-- Owner puede actualizar estado de pedidos de su negocio
CREATE POLICY "orders_update_owner"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (business_id = public.get_user_business_id())
  WITH CHECK (business_id = public.get_user_business_id());

-- Admin puede actualizar cualquier pedido
CREATE POLICY "orders_update_admin"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- No se permite DELETE de pedidos (historial)
CREATE POLICY "orders_delete_admin"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================
-- ORDER_ITEMS
-- ============================================

-- Owner puede ver items de pedidos de su negocio
CREATE POLICY "order_items_select_owner"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.business_id = public.get_user_business_id()
    )
  );

-- Admin puede ver todos los order_items
CREATE POLICY "order_items_select_admin"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: SOLO via Edge Functions (service_role)
-- No crear política INSERT aquí.

-- No se permite UPDATE ni DELETE de order_items (inmutables después de creación)
