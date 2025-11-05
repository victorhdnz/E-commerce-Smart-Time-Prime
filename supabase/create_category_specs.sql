-- Sistema de Categorias com Especificações Fixas
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de categorias com especificações padrão
CREATE TABLE IF NOT EXISTS category_specifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_name TEXT NOT NULL,
  spec_key TEXT NOT NULL,
  spec_label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_name, spec_key)
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_category_specs_category ON category_specifications(category_name);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_category_specs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_specs_timestamp
BEFORE UPDATE ON category_specifications
FOR EACH ROW
EXECUTE FUNCTION update_category_specs_updated_at();

-- RLS Policies
ALTER TABLE category_specifications ENABLE ROW LEVEL SECURITY;

-- Todos podem ver as especificações de categoria
CREATE POLICY "Todos podem ver especificações de categoria"
ON category_specifications FOR SELECT
USING (true);

-- Apenas editores podem gerenciar especificações
CREATE POLICY "Apenas editores podem gerenciar especificações de categoria"
ON category_specifications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Comentários
COMMENT ON TABLE category_specifications IS 'Especificações padrão para cada categoria de produto';
COMMENT ON COLUMN category_specifications.category_name IS 'Nome da categoria (deve corresponder ao campo category em products)';
COMMENT ON COLUMN category_specifications.spec_key IS 'Chave da especificação (usada internamente)';
COMMENT ON COLUMN category_specifications.spec_label IS 'Rótulo da especificação (exibido ao usuário)';
COMMENT ON COLUMN category_specifications.display_order IS 'Ordem de exibição da especificação';

