-- Adicionar coluna bling_product_id na tabela products se não existir
ALTER TABLE products
ADD COLUMN IF NOT EXISTS bling_product_id TEXT;

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_products_bling_product_id ON products(bling_product_id);

-- Adicionar comentário na coluna
COMMENT ON COLUMN products.bling_product_id IS 'ID do produto no Bling para sincronização';

