-- ==========================================
-- CORRIGIR DELETE DE ANALYTICS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Verificar se a política de DELETE existe
DO $$
BEGIN
  -- Remover política existente se houver
  DROP POLICY IF EXISTS "Allow authenticated users to delete analytics" ON landing_analytics;
  DROP POLICY IF EXISTS "Authenticated users can delete analytics" ON landing_analytics;
  DROP POLICY IF EXISTS "Admins can delete all analytics" ON landing_analytics;
END
$$;

-- Criar nova política que permite DELETE para usuários autenticados
CREATE POLICY "Authenticated users can delete analytics" ON landing_analytics
  FOR DELETE
  USING (true);

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'landing_analytics';

