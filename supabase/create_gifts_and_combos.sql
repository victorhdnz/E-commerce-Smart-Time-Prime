-- Sistema de Brindes e Combos

-- 1. Atualizar tabela product_gifts para ter mais informações
ALTER TABLE product_gifts
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN product_gifts.display_order IS 'Ordem de exibição do brinde';
COMMENT ON COLUMN product_gifts.is_active IS 'Se o brinde está ativo';

-- 2. Criar tabela de combos
CREATE TABLE IF NOT EXISTS product_combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  seasonal_layout_id UUID REFERENCES seasonal_layouts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela de itens do combo
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combo_id UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(combo_id, product_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_combos_active ON product_combos(is_active);
CREATE INDEX IF NOT EXISTS idx_combos_featured ON product_combos(is_featured);
CREATE INDEX IF NOT EXISTS idx_combos_seasonal ON product_combos(seasonal_layout_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_combo ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_product ON combo_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_gifts_active ON product_gifts(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_combos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_combos_timestamp
BEFORE UPDATE ON product_combos
FOR EACH ROW
EXECUTE FUNCTION update_combos_updated_at();

-- RLS Policies para product_combos
ALTER TABLE product_combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Combos são visíveis para todos"
ON product_combos FOR SELECT
USING (true);

CREATE POLICY "Apenas editores podem gerenciar combos"
ON product_combos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- RLS Policies para combo_items
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items de combo são visíveis para todos"
ON combo_items FOR SELECT
USING (true);

CREATE POLICY "Apenas editores podem gerenciar items de combo"
ON combo_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Comentários
COMMENT ON TABLE product_combos IS 'Combos de produtos com desconto';
COMMENT ON TABLE combo_items IS 'Itens que compõem um combo';

