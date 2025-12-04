-- ==========================================
-- NOVA ESTRUTURA PARA LANDING PAGES
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- ==========================================
-- LANDING LAYOUTS (Layouts Principais)
-- ==========================================
CREATE TABLE IF NOT EXISTS landing_layouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  custom_url TEXT UNIQUE, -- URL customizada (ex: /lp/campanha-black-friday)
  theme_colors JSONB DEFAULT '{}', -- Cores do tema
  default_fonts JSONB DEFAULT '{}', -- Fontes padrão
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- LANDING VERSIONS (Versões/Campanhas)
-- ==========================================
CREATE TABLE IF NOT EXISTS landing_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  layout_id UUID REFERENCES landing_layouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- Slug único dentro do layout
  description TEXT,
  version_number INTEGER DEFAULT 1, -- Número da versão
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Versão padrão do layout
  custom_styles JSONB DEFAULT '{}', -- Estilos customizados (fontes, cores, etc.)
  sections_config JSONB DEFAULT '{}', -- Configuração das seções
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(layout_id, slug) -- Slug único por layout
);

-- ==========================================
-- LANDING ANALYTICS (Analytics/Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS landing_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  layout_id UUID REFERENCES landing_layouts(id) ON DELETE CASCADE,
  version_id UUID REFERENCES landing_versions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- ID da sessão do usuário
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click', 'scroll', 'time_on_page', 'exit', 'conversion')),
  event_data JSONB DEFAULT '{}', -- Dados do evento (elemento clicado, scroll depth, etc.)
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCT COMPARISONS (Comparador)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  comparison_topics JSONB DEFAULT '[]', -- Array de tópicos de comparação
  -- Exemplo: [{"topic": "Bateria", "value": "48h"}, {"topic": "Tela", "value": "1.9\""}]
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCT SUPPORT PAGES (Páginas de Suporte/Manual)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_support_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  model_slug TEXT UNIQUE NOT NULL, -- Slug do modelo (ex: "apple-watch-series-11")
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}', -- Conteúdo da página (seções, imagens, vídeos, etc.)
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_landing_layouts_slug ON landing_layouts(slug);
CREATE INDEX IF NOT EXISTS idx_landing_layouts_custom_url ON landing_layouts(custom_url);
CREATE INDEX IF NOT EXISTS idx_landing_versions_layout_id ON landing_versions(layout_id);
CREATE INDEX IF NOT EXISTS idx_landing_versions_slug ON landing_versions(layout_id, slug);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_layout_id ON landing_analytics(layout_id);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_version_id ON landing_analytics(version_id);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_created_at ON landing_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_event_type ON landing_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_product_comparisons_product_id ON product_comparisons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_support_pages_product_id ON product_support_pages(product_id);
CREATE INDEX IF NOT EXISTS idx_product_support_pages_model_slug ON product_support_pages(model_slug);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Landing Layouts: Admins e editors podem tudo, todos podem ler
ALTER TABLE landing_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing layouts are viewable by everyone"
  ON landing_layouts FOR SELECT
  USING (true);

CREATE POLICY "Landing layouts are insertable by admins and editors"
  ON landing_layouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Landing layouts are updatable by admins and editors"
  ON landing_layouts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Landing layouts are deletable by admins and editors"
  ON landing_layouts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Landing Versions: Admins e editors podem tudo, todos podem ler
ALTER TABLE landing_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing versions are viewable by everyone"
  ON landing_versions FOR SELECT
  USING (true);

CREATE POLICY "Landing versions are insertable by admins and editors"
  ON landing_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Landing versions are updatable by admins and editors"
  ON landing_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Landing versions are deletable by admins and editors"
  ON landing_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Landing Analytics: Todos podem inserir (para tracking), admins e editors podem ler
ALTER TABLE landing_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing analytics are insertable by everyone"
  ON landing_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Landing analytics are viewable by admins and editors"
  ON landing_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Product Comparisons: Admins e editors podem tudo, todos podem ler
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product comparisons are viewable by everyone"
  ON product_comparisons FOR SELECT
  USING (true);

CREATE POLICY "Product comparisons are insertable by admins and editors"
  ON product_comparisons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Product comparisons are updatable by admins and editors"
  ON product_comparisons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Product comparisons are deletable by admins and editors"
  ON product_comparisons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Product Support Pages: Admins e editors podem tudo, todos podem ler
ALTER TABLE product_support_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product support pages are viewable by everyone"
  ON product_support_pages FOR SELECT
  USING (true);

CREATE POLICY "Product support pages are insertable by admins and editors"
  ON product_support_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Product support pages are updatable by admins and editors"
  ON product_support_pages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Product support pages are deletable by admins and editors"
  ON product_support_pages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- ==========================================
-- TRIGGERS PARA UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_landing_layouts_updated_at
  BEFORE UPDATE ON landing_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_versions_updated_at
  BEFORE UPDATE ON landing_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_comparisons_updated_at
  BEFORE UPDATE ON product_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_support_pages_updated_at
  BEFORE UPDATE ON product_support_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FUNÇÃO PARA GARANTIR APENAS UMA VERSÃO DEFAULT POR LAYOUT
-- ==========================================
CREATE OR REPLACE FUNCTION ensure_single_default_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Desmarcar outras versões default do mesmo layout
    UPDATE landing_versions
    SET is_default = false
    WHERE layout_id = NEW.layout_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_version_trigger
  BEFORE INSERT OR UPDATE ON landing_versions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_version();

