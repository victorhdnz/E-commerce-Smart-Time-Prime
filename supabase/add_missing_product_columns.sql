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

-- 3. Adicionar coluna 'specifications' (JSONB para especificações técnicas)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]';

COMMENT ON COLUMN products.specifications IS 'Array de objetos com key e value para especificações técnicas do produto';

-- 4. Adicionar coluna 'benefits' (JSONB para benefícios editáveis)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '{
  "free_shipping": {"enabled": true, "text": "Frete grátis para Uberlândia acima de R$ 200"},
  "warranty": {"enabled": true, "text": "Garantia de 1 ano"},
  "returns": {"enabled": true, "text": "Troca grátis em 7 dias"},
  "gift": {"enabled": false, "text": ""}
}'::JSONB;

COMMENT ON COLUMN products.benefits IS 'Objeto JSONB com benefícios editáveis do produto (frete, garantia, troca, brinde)';

-- 5. Atualizar produtos existentes para ter valores padrão se NULL
UPDATE products 
SET images = '{}',
    specifications = '[]'::JSONB,
    benefits = '{
      "free_shipping": {"enabled": true, "text": "Frete grátis para Uberlândia acima de R$ 200"},
      "warranty": {"enabled": true, "text": "Garantia de 1 ano"},
      "returns": {"enabled": true, "text": "Troca grátis em 7 dias"},
      "gift": {"enabled": false, "text": ""}
    }'::JSONB
WHERE images IS NULL OR specifications IS NULL OR benefits IS NULL;

