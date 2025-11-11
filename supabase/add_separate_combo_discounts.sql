-- Adicionar colunas de desconto separadas para preço local e nacional nos combos

ALTER TABLE product_combos
ADD COLUMN IF NOT EXISTS discount_percentage_local DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount_local DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage_national DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount_national DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN product_combos.discount_percentage_local IS 'Desconto percentual aplicado ao preço local (Uberlândia)';
COMMENT ON COLUMN product_combos.discount_amount_local IS 'Desconto em valor fixo aplicado ao preço local (Uberlândia)';
COMMENT ON COLUMN product_combos.discount_percentage_national IS 'Desconto percentual aplicado ao preço nacional';
COMMENT ON COLUMN product_combos.discount_amount_national IS 'Desconto em valor fixo aplicado ao preço nacional';

