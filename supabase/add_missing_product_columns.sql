-- Adicionar colunas faltantes na tabela products
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna 'images' (array de URLs das imagens)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

COMMENT ON COLUMN products.images IS 'Array de URLs das imagens do produto';

-- 2. Adicionar coluna 'product_code' (código interno do produto)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_code TEXT;

COMMENT ON COLUMN products.product_code IS 'Código do produto para referência interna (visível apenas no dashboard)';

-- 3. Atualizar produtos existentes para ter array vazio se NULL
UPDATE products 
SET images = '{}' 
WHERE images IS NULL;

