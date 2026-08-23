-- ============================================
-- MIGRACIÓN 008: ÍNDICES ADICIONALES Y TRIGGERS
-- ============================================
-- Trigger para actualizar updated_at automáticamente.
-- Función auxiliar para obtener el business_id del usuario actual.

-- ============================================
-- FUNCIÓN: updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.handle_updated_at IS 'Trigger function para actualizar updated_at en cada UPDATE';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCIÓN: obtener business_id del usuario actual
-- ============================================
-- Utilizada por las políticas RLS para verificar pertenencia.

CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID AS $$
  SELECT id FROM public.businesses
  WHERE owner_user_id = auth.uid()
  AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.get_user_business_id IS 'Retorna el business_id del usuario autenticado actual. Usado en políticas RLS.';

-- ============================================
-- FUNCIÓN: verificar si el usuario es admin
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_admin IS 'Verifica si el usuario actual tiene rol de administrador';

-- ============================================
-- FUNCIÓN: contar productos de un negocio
-- ============================================

CREATE OR REPLACE FUNCTION public.count_business_products(p_business_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.products
  WHERE business_id = p_business_id
  AND status != 'deleted';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.count_business_products IS 'Cuenta productos activos/inactivos de un negocio (excluye eliminados)';

-- ============================================
-- FUNCIÓN: contar imágenes de un producto
-- ============================================

CREATE OR REPLACE FUNCTION public.count_product_images(p_product_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.product_images
  WHERE product_id = p_product_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.count_product_images IS 'Cuenta imágenes de un producto';

-- ============================================
-- TRIGGER: asignar rol seller al registrarse
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'seller');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.users (se ejecuta al crear un nuevo usuario)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Asigna rol seller automáticamente cuando se registra un nuevo usuario';
