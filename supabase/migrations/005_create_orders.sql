-- ============================================
-- MIGRACIÓN 005: TABLAS ORDERS Y ORDER_ITEMS
-- ============================================
-- Los pedidos se crean desde la página pública (sin autenticación).
-- IMPORTANTE: El precio SIEMPRE se calcula en backend desde la DB.
-- NUNCA confiar en el precio enviado desde el frontend.

-- Secuencia para números de pedido por negocio
-- Se usa una secuencia global, cada negocio verá números consecutivos propios.
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1000;

CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES public.customers(id),
  order_number    INTEGER NOT NULL DEFAULT nextval('public.order_number_seq'),
  status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'CONFIRMATION_PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REJECTED'
  )),
  payment_method  TEXT NOT NULL DEFAULT 'COD' CHECK (payment_method IN ('COD', 'TRANSFER', 'ONLINE')),
  subtotal        DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost   DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total           DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  customer_notes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_orders_business ON public.orders(business_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(business_id, status);
CREATE INDEX idx_orders_created ON public.orders(business_id, created_at DESC);
CREATE INDEX idx_orders_number ON public.orders(business_id, order_number);

-- Comentarios
COMMENT ON TABLE public.orders IS 'Pedidos realizados por compradores. Precio calculado en backend.';
COMMENT ON COLUMN public.orders.status IS 'Estado del pedido: PENDING → CONFIRMED → SHIPPED → DELIVERED o CANCELLED/REJECTED';
COMMENT ON COLUMN public.orders.payment_method IS 'COD = contra entrega, TRANSFER = transferencia, ONLINE = pago en línea';
COMMENT ON COLUMN public.orders.total IS 'Calculado en backend: subtotal + shipping_cost. NUNCA confiar en frontend.';

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total           DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- Comentarios
COMMENT ON TABLE public.order_items IS 'Items de cada pedido. unit_price se copia del producto al momento del pedido.';
COMMENT ON COLUMN public.order_items.unit_price IS 'Precio del producto al momento del pedido (snapshot). Se obtiene de DB, no de frontend.';
COMMENT ON COLUMN public.order_items.total IS 'unit_price * quantity. Calculado en backend.';
