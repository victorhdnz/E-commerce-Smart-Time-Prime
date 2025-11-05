-- Corrigir políticas RLS da tabela site_terms
-- O problema é que a política de INSERT pode estar falhando na verificação de role

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow read access for all users" ON site_terms;
DROP POLICY IF EXISTS "Allow insert for authenticated users with editor or admin role" ON site_terms;
DROP POLICY IF EXISTS "Allow update for authenticated users with editor or admin role" ON site_terms;
DROP POLICY IF EXISTS "Allow delete for authenticated users with admin role" ON site_terms;

-- Recriar políticas com verificação mais robusta

-- Permitir leitura para todos
CREATE POLICY "Allow read access for all users" ON site_terms
  FOR SELECT USING (true);

-- Permitir inserção para usuários autenticados com role editor ou admin
CREATE POLICY "Allow insert for authenticated users with editor or admin role" ON site_terms
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Permitir atualização para usuários autenticados com role editor ou admin
CREATE POLICY "Allow update for authenticated users with editor or admin role" ON site_terms
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('editor', 'admin')
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Permitir exclusão apenas para admins
CREATE POLICY "Allow delete for authenticated users with admin role" ON site_terms
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

