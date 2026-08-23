-- ============================================
-- MIGRACIÓN 004: TABLA CUSTOMERS
-- ============================================
-- Clientes (compradores) que realizan pedidos.
-- NO tienen cuenta en la plataforma.
-- Están aislados por business_id (multi-tenant).
-- Se crean automáticamente al realizar un pedido.

CREATE TABLE IF NOT EXISTS public.customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  first_name        TEXT NOT NULL,
  second_name       TEXT,
  last_name         TEXT NOT NULL,
  second_last_name  TEXT,
  phone             TEXT NOT NULL,
  province          TEXT NOT NULL,
  city              TEXT NOT NULL,
  address           TEXT NOT NULL,
  reference         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un cliente se identifica por teléfono dentro de un negocio
  CONSTRAINT customers_business_phone_unique UNIQUE (business_id, phone)
);

-- Índices
CREATE INDEX idx_customers_business ON public.customers(business_id);
CREATE INDEX idx_customers_phone ON public.customers(business_id, phone);
CREATE INDEX idx_customers_name ON public.customers(business_id, last_name, first_name);

-- Validación de teléfono ecuatoriano (10 dígitos, empieza con 0)
ALTER TABLE public.customers
  ADD CONSTRAINT customers_phone_format CHECK (phone ~ '^0[2-9][0-9]{8}$');

-- Comentarios
COMMENT ON TABLE public.customers IS 'Compradores que realizan pedidos. Sin cuenta. Aislados por negocio.';
COMMENT ON COLUMN public.customers.phone IS 'Teléfono ecuatoriano: 10 dígitos, formato 0XXXXXXXXX';
COMMENT ON COLUMN public.customers.reference IS 'Referencia de dirección para la entrega';
