-- ============================================
-- MIGRACIÓN 007: AUDIT_LOGS Y USER_ROLES
-- ============================================
-- Auditoría para registrar acciones importantes.
-- Roles para distinguir vendedores de administradores.

-- ============================================
-- USER_ROLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('seller', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un usuario solo puede tener un rol
  CONSTRAINT user_roles_user_unique UNIQUE (user_id)
);

-- Índices
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Comentarios
COMMENT ON TABLE public.user_roles IS 'Roles de usuario: seller (vendedor normal) o admin (administrador de plataforma)';

-- ============================================
-- AUDIT_LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  business_id UUID,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_business ON public.audit_logs(business_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Particionar por fecha en el futuro si crece mucho
-- Por ahora un índice en created_at es suficiente

-- Comentarios
COMMENT ON TABLE public.audit_logs IS 'Registro de auditoría. No registrar secretos ni datos sensibles.';
COMMENT ON COLUMN public.audit_logs.action IS 'Acción: login, create_product, update_order_status, payment_received, etc.';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Datos adicionales del evento (cambios, valores anteriores, etc.)';
COMMENT ON COLUMN public.audit_logs.ip_address IS 'IP del cliente que realizó la acción';
