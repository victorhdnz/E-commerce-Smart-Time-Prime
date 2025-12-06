-- ==========================================
-- Adicionar coluna price e migrar dados
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Adicionar coluna price se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products ADD COLUMN price NUMERIC(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Migrar dados: usar local_price se existir, senão national_price, senão 0
UPDATE products 
SET price = COALESCE(
  NULLIF(local_price, 0),
  NULLIF(national_price, 0),
  0
)
WHERE price IS NULL OR price = 0;

-- Tornar a coluna NOT NULL após migração
ALTER TABLE products 
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN price SET DEFAULT 0;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Comentário na coluna
COMMENT ON COLUMN products.price IS 'Preço único do produto (substitui local_price e national_price)';

