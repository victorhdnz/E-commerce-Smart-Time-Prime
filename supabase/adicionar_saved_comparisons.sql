-- ==========================================
-- ADICIONAR TABELA SAVED_COMPARISONS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Tabela para salvar links de comparação pré-definidos para campanhas
CREATE TABLE IF NOT EXISTS saved_comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  product_ids TEXT[] NOT NULL, -- Array de IDs dos produtos
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_slug ON saved_comparisons(slug);

-- Habilitar RLS
ALTER TABLE saved_comparisons ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ler, apenas admins/editors podem gerenciar
CREATE POLICY "Saved comparisons are viewable by everyone"
  ON saved_comparisons FOR SELECT
  USING (true);

CREATE POLICY "Saved comparisons are insertable by admins and editors"
  ON saved_comparisons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Saved comparisons are updatable by admins and editors"
  ON saved_comparisons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Saved comparisons are deletable by admins and editors"
  ON saved_comparisons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_saved_comparisons_updated_at
  BEFORE UPDATE ON saved_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

