-- ============================================
-- MIGRACIÓN 016: RLS - AUDIT_LOGS Y USER_ROLES
-- ============================================
-- audit_logs: solo admin puede leer. INSERT via service_role.
-- user_roles: usuario lee su propio rol. Admin lee todos.

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT_LOGS
-- ============================================
-- Los logs de auditoría son sensibles.
-- Solo admin puede consultarlos.
-- Se crean desde Edge Functions (service_role).

-- Admin puede ver todos los logs
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Owner puede ver logs de su negocio (para transparencia)
CREATE POLICY "audit_logs_select_owner"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (business_id = public.get_user_business_id());

-- INSERT: SOLO via Edge Functions (service_role)
-- No permitir INSERT desde el cliente.
-- No permitir UPDATE ni DELETE (logs son inmutables).

-- ============================================
-- USER_ROLES
-- ============================================
-- Un usuario puede leer su propio rol.
-- Admin puede leer y modificar todos los roles.

-- Usuario puede ver su propio rol
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin puede ver todos los roles
CREATE POLICY "user_roles_select_admin"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin puede insertar roles (promover a admin)
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin puede actualizar roles
CREATE POLICY "user_roles_update_admin"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admin puede eliminar roles
CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Un usuario normal NO puede modificar su rol.
-- Solo admin o el trigger on_auth_user_created pueden asignar roles.
