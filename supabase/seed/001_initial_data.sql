-- ============================================
-- SEED: DATOS INICIALES
-- ============================================
-- Este archivo se ejecuta después de las migraciones.
-- Contiene datos necesarios para que la aplicación funcione.
--
-- NOTA: Los planes ya se insertan en la migración 001.
-- Aquí se incluyen datos adicionales de configuración.

-- ============================================
-- VERIFICAR QUE EXISTEN LOS PLANES
-- ============================================
-- Si la migración 001 ya insertó los planes, esto no hace nada.

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
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- NOTA SOBRE ADMIN
-- ============================================
-- El usuario admin se crea manualmente en Supabase Auth.
-- Después se asigna rol admin:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('UUID-DEL-ADMIN', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
--
-- No se puede automatizar porque requiere el UUID del usuario
-- que se genera al registrarse en Supabase Auth.

-- ============================================
-- PLAN PREMIUM (futuro - inactivo)
-- ============================================

INSERT INTO public.plans (name, slug, price, currency, billing_period, max_products, max_images_per_product, storage_limit_mb, features, active)
VALUES
  (
    'Premium',
    'premium',
    15.00,
    'USD',
    'monthly',
    50,
    10,
    2000,
    '{"branding": false, "whatsapp_button": true, "basic_dashboard": true, "advanced_dashboard": true, "remove_branding": true, "customers_management": true, "priority_support": true, "custom_domain": true, "analytics": true}'::jsonb,
    false  -- Inactivo hasta que se decida lanzar
  )
ON CONFLICT (slug) DO NOTHING;
