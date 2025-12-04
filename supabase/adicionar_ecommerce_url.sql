-- ==========================================
-- ADICIONAR COLUNA ECOMMERCE_URL AOS PRODUTOS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Adicionar a coluna ecommerce_url à tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ecommerce_url TEXT;

-- Comentário explicativo
COMMENT ON COLUMN products.ecommerce_url IS 'URL do produto no e-commerce externo para redirecionamento';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'ecommerce_url';

