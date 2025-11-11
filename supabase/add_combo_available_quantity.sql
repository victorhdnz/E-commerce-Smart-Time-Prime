-- Adicionar coluna de quantidade disponível na tabela product_combos

ALTER TABLE product_combos
ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 0;

COMMENT ON COLUMN product_combos.available_quantity IS 'Quantidade de unidades disponíveis do combo. 0 significa ilimitado.';

