-- ============================================
-- MIGRACIÓN 002: TABLA BUSINESSES
-- ============================================
-- Cada usuario registrado puede tener UN negocio.
-- El negocio es la entidad central del modelo multi-tenant.
-- Todas las demás tablas se vinculan mediante business_id.

CREATE TABLE IF NOT EXISTS public.businesses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  logo_url        TEXT,
  whatsapp_number TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  plan_id         UUID REFERENCES public.plans(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un usuario solo puede tener un negocio
  CONSTRAINT businesses_owner_unique UNIQUE (owner_user_id)
);

-- Índices
CREATE INDEX idx_businesses_owner ON public.businesses(owner_user_id);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_businesses_status ON public.businesses(status) WHERE status = 'active';

-- Comentarios
COMMENT ON TABLE public.businesses IS 'Negocios registrados en la plataforma. Un usuario = un negocio.';
COMMENT ON COLUMN public.businesses.slug IS 'URL-friendly identifier (ej: "luis", "importadora-luis"). Debe ser único globalmente.';
COMMENT ON COLUMN public.businesses.status IS 'active: operativo, suspended: suspendido por admin, deleted: eliminado lógicamente';
COMMENT ON COLUMN public.businesses.whatsapp_number IS 'Número de WhatsApp para contacto (formato Ecuador: 0XXXXXXXXX)';

-- Validación de slug (solo letras minúsculas, números y guiones)
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$' AND length(slug) >= 3 AND length(slug) <= 50);
