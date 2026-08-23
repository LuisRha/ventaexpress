-- ============================================
-- MIGRACIÓN 015: RLS - SUBSCRIPTIONS, PAYMENTS, PAYMENT_EVENTS
-- ============================================
-- Suscripciones y pagos son datos sensibles.
-- Owner puede VER su suscripción y pagos.
-- Modificaciones SOLO via Edge Functions (service_role) o admin.
-- payment_events: solo accesible por admin y service_role.

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Owner puede ver su suscripción
CREATE POLICY "subscriptions_select_owner"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- Admin puede ver todas las suscripciones
CREATE POLICY "subscriptions_select_admin"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT/UPDATE: SOLO via Edge Functions (service_role)
-- El owner no puede modificar su suscripción directamente.
-- Los cambios vienen del sistema de pagos (webhook → Edge Function → DB).

-- Admin puede actualizar suscripciones (soporte)
CREATE POLICY "subscriptions_update_admin"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admin puede insertar suscripciones (asignación manual)
CREATE POLICY "subscriptions_insert_admin"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ============================================
-- PAYMENTS
-- ============================================

-- Owner puede ver sus pagos
CREATE POLICY "payments_select_owner"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- Admin puede ver todos los pagos
CREATE POLICY "payments_select_admin"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT/UPDATE: SOLO via Edge Functions (service_role)
-- Los pagos son creados y actualizados por el sistema de webhooks.

-- Admin puede actualizar pagos (soporte, correcciones)
CREATE POLICY "payments_update_admin"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ============================================
-- PAYMENT_EVENTS
-- ============================================
-- Tabla de idempotencia de webhooks.
-- Solo accesible por admin y service_role (Edge Functions).
-- Ningún usuario normal necesita ver esto.

-- Admin puede ver eventos
CREATE POLICY "payment_events_select_admin"
  ON public.payment_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT/UPDATE: SOLO via Edge Functions (service_role)
-- No crear políticas INSERT para roles normales.
