-- Adicionar coluna 'images' à tabela products
-- Execute este script no SQL Editor do Supabase

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Comentário para documentação
COMMENT ON COLUMN products.images IS 'Array de URLs das imagens do produto';

-- Atualizar produtos existentes para ter array vazio se NULL
UPDATE products 
SET images = '{}' 
WHERE images IS NULL;

