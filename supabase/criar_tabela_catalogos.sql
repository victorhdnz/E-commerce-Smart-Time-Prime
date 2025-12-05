-- ==========================================
-- Criar tabela de Catálogos de Produtos
-- ==========================================

-- Criar tabela product_catalogs
CREATE TABLE IF NOT EXISTS product_catalogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  theme_colors JSONB DEFAULT '{
    "primary": "#000000",
    "secondary": "#ffffff",
    "accent": "#D4AF37",
    "background": "#ffffff",
    "text": "#000000"
  }'::jsonb,
  content JSONB DEFAULT '{
    "hero": {},
    "categories": [],
    "featured_products": [],
    "sections": []
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_product_catalogs_slug ON product_catalogs(slug);
CREATE INDEX IF NOT EXISTS idx_product_catalogs_is_active ON product_catalogs(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_product_catalogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_catalogs_updated_at ON product_catalogs;
CREATE TRIGGER trigger_update_product_catalogs_updated_at
  BEFORE UPDATE ON product_catalogs
  FOR EACH ROW
  EXECUTE FUNCTION update_product_catalogs_updated_at();

-- Habilitar RLS
ALTER TABLE product_catalogs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Leitura pública para catálogos ativos
DROP POLICY IF EXISTS "Catálogos ativos são públicos" ON product_catalogs;
CREATE POLICY "Catálogos ativos são públicos" ON product_catalogs
  FOR SELECT
  USING (is_active = true);

-- Admins e editores podem ver todos
DROP POLICY IF EXISTS "Admins podem ver todos os catálogos" ON product_catalogs;
CREATE POLICY "Admins podem ver todos os catálogos" ON product_catalogs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Admins e editores podem criar
DROP POLICY IF EXISTS "Admins podem criar catálogos" ON product_catalogs;
CREATE POLICY "Admins podem criar catálogos" ON product_catalogs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Admins e editores podem atualizar
DROP POLICY IF EXISTS "Admins podem atualizar catálogos" ON product_catalogs;
CREATE POLICY "Admins podem atualizar catálogos" ON product_catalogs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Admins podem deletar
DROP POLICY IF EXISTS "Admins podem deletar catálogos" ON product_catalogs;
CREATE POLICY "Admins podem deletar catálogos" ON product_catalogs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Comentário na tabela
COMMENT ON TABLE product_catalogs IS 'Catálogos de produtos com layout personalizado';

