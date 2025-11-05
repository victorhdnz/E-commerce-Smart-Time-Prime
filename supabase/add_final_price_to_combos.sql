-- Adicionar coluna final_price à tabela product_combos
ALTER TABLE product_combos
ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2);

-- Atualizar comentário
COMMENT ON COLUMN product_combos.final_price IS 'Preço final do combo após aplicar desconto';

-- Se houver combos existentes, calcular o final_price baseado nos valores atuais
-- (Isso é opcional, mas pode ser útil se já existirem combos)
UPDATE product_combos
SET final_price = (
  SELECT COALESCE(
    (SELECT SUM(products.local_price * combo_items.quantity)
     FROM combo_items
     JOIN products ON products.id = combo_items.product_id
     WHERE combo_items.combo_id = product_combos.id),
    0
  ) - COALESCE(product_combos.discount_amount, 0)
)
WHERE final_price IS NULL;

