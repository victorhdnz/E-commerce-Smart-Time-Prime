-- ==========================================
-- Adicionar estrutura de layouts para Catálogos e Suporte
-- ==========================================

-- Criar tabela de layouts de catálogo
CREATE TABLE IF NOT EXISTS catalog_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  preview_image TEXT,
  default_content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de layouts de suporte
CREATE TABLE IF NOT EXISTS support_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  preview_image TEXT,
  default_content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campo layout_id nas tabelas existentes
ALTER TABLE product_catalogs 
ADD COLUMN IF NOT EXISTS layout_id UUID REFERENCES catalog_layouts(id);

ALTER TABLE product_support_pages 
ADD COLUMN IF NOT EXISTS layout_id UUID REFERENCES support_layouts(id);

-- Inserir layouts padrão para Catálogos
INSERT INTO catalog_layouts (name, slug, description, default_content) VALUES
(
  'Catálogo Apple Style',
  'apple-style',
  'Layout minimalista e elegante inspirado no estilo Apple. Ideal para exibir produtos premium com foco em imagens grandes e tipografia limpa.',
  '{
    "hero": {
      "title": "Smart Watch",
      "subtitle": "O mais poderoso de todos os tempos.",
      "badge": "Novo"
    },
    "theme_colors": {
      "primary": "#000000",
      "secondary": "#f5f5f7",
      "accent": "#0071e3",
      "background": "#ffffff",
      "text": "#1d1d1f"
    }
  }'::jsonb
),
(
  'Catálogo Grade',
  'grade',
  'Layout em grade com múltiplos produtos por linha. Perfeito para catálogos com muitos itens.',
  '{
    "hero": {
      "title": "Nossos Produtos",
      "subtitle": "Encontre o produto ideal para você."
    },
    "theme_colors": {
      "primary": "#000000",
      "secondary": "#f9fafb",
      "accent": "#D4AF37",
      "background": "#ffffff",
      "text": "#111827"
    }
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Inserir layouts padrão para Suporte
INSERT INTO support_layouts (name, slug, description, default_content) VALUES
(
  'Manual Apple Guide',
  'apple-guide',
  'Layout estilo manual da Apple com seções de feature-cards, steps e accordion. Ideal para guias de configuração e manuais de uso.',
  '{
    "sections": [
      {
        "type": "hero",
        "title": "Manual de Uso",
        "subtitle": "Tudo o que você precisa saber."
      }
    ],
    "theme_colors": {
      "primary": "#000000",
      "secondary": "#f5f5f7",
      "accent": "#0071e3",
      "text": "#1d1d1f"
    }
  }'::jsonb
),
(
  'FAQ Expandido',
  'faq-expandido',
  'Layout focado em perguntas frequentes com seções de accordion. Ideal para páginas de suporte simples.',
  '{
    "sections": [
      {
        "type": "hero",
        "title": "Perguntas Frequentes",
        "subtitle": "Tire suas dúvidas aqui."
      }
    ],
    "theme_colors": {
      "primary": "#000000",
      "secondary": "#ffffff",
      "accent": "#D4AF37",
      "text": "#1d1d1f"
    }
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS
ALTER TABLE catalog_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_layouts ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Layouts de catálogo são públicos" ON catalog_layouts FOR SELECT USING (true);
CREATE POLICY "Layouts de suporte são públicos" ON support_layouts FOR SELECT USING (true);

-- Políticas de escrita para admins
CREATE POLICY "Admins podem gerenciar layouts de catálogo" ON catalog_layouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins podem gerenciar layouts de suporte" ON support_layouts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Comentários nas tabelas
COMMENT ON TABLE catalog_layouts IS 'Layouts pré-definidos para catálogos de produtos';
COMMENT ON TABLE support_layouts IS 'Layouts pré-definidos para páginas de suporte';

