-- ============================================
-- MIGRACIÓN 003: TABLAS PRODUCTS Y PRODUCT_IMAGES
-- ============================================
-- Productos pertenecen a un negocio.
-- Cada producto tiene una URL pública: /{business_slug}/{product_slug}
-- Las imágenes se almacenan en Supabase Storage, aquí solo metadata.

CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  benefits        TEXT,
  price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  previous_price  DECIMAL(10,2) CHECK (previous_price IS NULL OR previous_price >= 0),
  stock           INTEGER NOT NULL DEFAULT -1,  -- -1 = ilimitado
  delivery_info   TEXT,
  payment_info    TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Slug único dentro del mismo negocio
  CONSTRAINT products_business_slug_unique UNIQUE (business_id, slug)
);

-- Índices
CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_products_status ON public.products(status) WHERE status = 'active';
CREATE INDEX idx_products_business_status ON public.products(business_id, status);

-- Validación de slug
ALTER TABLE public.products
  ADD CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$' AND length(slug) >= 2 AND length(slug) <= 100);

-- Comentarios
COMMENT ON TABLE public.products IS 'Productos de cada negocio. Cada uno genera una página pública.';
COMMENT ON COLUMN public.products.stock IS '-1 = stock ilimitado, 0 = agotado, >0 = cantidad disponible';
COMMENT ON COLUMN public.products.previous_price IS 'Precio anterior para mostrar descuento (opcional)';

-- ============================================
-- PRODUCT IMAGES
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  public_url      TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_sort ON public.product_images(product_id, sort_order);

-- Comentarios
COMMENT ON TABLE public.product_images IS 'Imágenes de productos almacenadas en Supabase Storage';
COMMENT ON COLUMN public.product_images.storage_path IS 'Ruta en Supabase Storage: products/{business_id}/{product_id}/filename.webp';
COMMENT ON COLUMN public.product_images.sort_order IS 'Orden de visualización. 0 = imagen principal.';
