-- Adicionar coluna product_code na tabela products
-- Este código será visível apenas no dashboard para facilitar identificação manual

ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_code TEXT;

COMMENT ON COLUMN products.product_code IS 'Código do produto para identificação manual (visível apenas no dashboard)';

