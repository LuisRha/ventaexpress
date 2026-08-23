-- ============================================
-- MIGRACIÓN 001: TABLA PLANS
-- ============================================
-- Planes de suscripción de la plataforma.
-- Los límites del sistema siempre se obtienen de esta tabla.
-- NUNCA codificar límites directamente en el código.

CREATE TABLE IF NOT EXISTS public.plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USD',
  billing_period  TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  max_products    INTEGER NOT NULL DEFAULT 2,
  max_images_per_product INTEGER NOT NULL DEFAULT 5,
  storage_limit_mb INTEGER NOT NULL DEFAULT 100,
  features        JSONB NOT NULL DEFAULT '{}',
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentarios de tabla
COMMENT ON TABLE public.plans IS 'Planes de suscripción disponibles en la plataforma';
COMMENT ON COLUMN public.plans.slug IS 'Identificador URL-friendly del plan (free, pro, premium)';
COMMENT ON COLUMN public.plans.features IS 'JSON con features booleanas del plan';
COMMENT ON COLUMN public.plans.storage_limit_mb IS 'Límite de almacenamiento en MB para el negocio';

-- Insertar planes iniciales
INSERT INTO public.plans (name, slug, price, currency, billing_period, max_products, max_images_per_product, storage_limit_mb, features, active)
VALUES
  (
    'Gratuito',
    'free',
    0.00,
    'USD',
    'monthly',
    2,
    5,
    50,
    '{"branding": true, "whatsapp_button": true, "basic_dashboard": true, "remove_branding": false, "priority_support": false}'::jsonb,
    true
  ),
  (
    'PRO',
    'pro',
    5.00,
    'USD',
    'monthly',
    10,
    5,
    500,
    '{"branding": false, "whatsapp_button": true, "basic_dashboard": true, "advanced_dashboard": true, "remove_branding": true, "customers_management": true, "priority_support": false}'::jsonb,
    true
  );
