-- ==========================================
-- CORREÇÃO RLS PARA TABELA: product_combos
-- ==========================================

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Combos são visíveis para todos" ON product_combos;
DROP POLICY IF EXISTS "Apenas editores podem gerenciar combos" ON product_combos;

-- Permitir leitura para todos
CREATE POLICY "Combos são visíveis para todos"
ON product_combos FOR SELECT
USING (true);

-- Permitir inserção apenas para admins e editors
CREATE POLICY "Admins e editors podem inserir combos"
ON product_combos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Permitir atualização apenas para admins e editors
CREATE POLICY "Admins e editors podem atualizar combos"
ON product_combos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Permitir exclusão apenas para admins e editors
CREATE POLICY "Admins e editors podem deletar combos"
ON product_combos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- ==========================================
-- CORREÇÃO RLS PARA TABELA: combo_items
-- ==========================================

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Items de combo são visíveis para todos" ON combo_items;
DROP POLICY IF EXISTS "Apenas editores podem gerenciar items de combo" ON combo_items;

-- Permitir leitura para todos
CREATE POLICY "Items de combo são visíveis para todos"
ON combo_items FOR SELECT
USING (true);

-- Permitir inserção apenas para admins e editors
CREATE POLICY "Admins e editors podem inserir items de combo"
ON combo_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Permitir atualização apenas para admins e editors
CREATE POLICY "Admins e editors podem atualizar items de combo"
ON combo_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Permitir exclusão apenas para admins e editors
CREATE POLICY "Admins e editors podem deletar items de combo"
ON combo_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

