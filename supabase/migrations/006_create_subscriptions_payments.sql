-- ============================================
-- MIGRACIÓN 006: SUBSCRIPTIONS, PAYMENTS, PAYMENT_EVENTS
-- ============================================
-- Sistema de suscripciones y pagos recurrentes.
-- Diseñado para ser agnóstico al proveedor de pagos.
-- payment_events garantiza idempotencia de webhooks.

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id               UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id                   UUID NOT NULL REFERENCES public.plans(id),
  provider                  TEXT,  -- 'payphone', 'kushki', 'paypal', etc.
  provider_customer_id      TEXT,
  provider_subscription_id  TEXT,
  status                    TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'trialing',
    'past_due',
    'cancelled',
    'suspended',
    'expired'
  )),
  start_date                TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_subscriptions_business ON public.subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status) WHERE status = 'active';
CREATE INDEX idx_subscriptions_provider ON public.subscriptions(provider, provider_subscription_id);

-- Comentarios
COMMENT ON TABLE public.subscriptions IS 'Suscripciones de negocios a planes de pago';
COMMENT ON COLUMN public.subscriptions.provider IS 'Proveedor de pagos utilizado (abstracción permite cambiar)';
COMMENT ON COLUMN public.subscriptions.status IS 'active: pagando, past_due: pago fallido, suspended: acceso limitado, cancelled: terminada';

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  subscription_id     UUID REFERENCES public.subscriptions(id),
  provider            TEXT NOT NULL,
  provider_payment_id TEXT,
  amount              DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency            TEXT NOT NULL DEFAULT 'USD',
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded'
  )),
  payment_type        TEXT NOT NULL DEFAULT 'subscription' CHECK (payment_type IN (
    'subscription',
    'one_time',
    'refund'
  )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_payments_business ON public.payments(business_id);
CREATE INDEX idx_payments_subscription ON public.payments(subscription_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_provider ON public.payments(provider, provider_payment_id);

-- Comentarios
COMMENT ON TABLE public.payments IS 'Registro de pagos procesados por proveedores externos';

-- ============================================
-- PAYMENT_EVENTS (Webhook Idempotency)
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider          TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  payload_hash      TEXT,
  processed         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Garantizar idempotencia: un evento solo se procesa una vez
  CONSTRAINT payment_events_unique UNIQUE (provider, provider_event_id)
);

-- Índices
CREATE INDEX idx_payment_events_processed ON public.payment_events(processed) WHERE processed = false;

-- Comentarios
COMMENT ON TABLE public.payment_events IS 'Eventos de webhook recibidos. La constraint UNIQUE evita procesar duplicados.';
COMMENT ON COLUMN public.payment_events.provider_event_id IS 'ID del evento asignado por el proveedor de pagos';
COMMENT ON COLUMN public.payment_events.payload_hash IS 'Hash del payload para verificación de integridad';
