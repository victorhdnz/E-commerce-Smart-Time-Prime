-- Adicionar RLS policies para order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver itens de seus próprios pedidos
CREATE POLICY "Users can view own order items" 
ON order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')))
  )
);

-- Usuários podem criar itens em seus próprios pedidos
CREATE POLICY "Users can create own order items" 
ON order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Adicionar RLS policies para product_gifts se ainda não existir
ALTER TABLE product_gifts ENABLE ROW LEVEL SECURITY;

-- Todos podem ver product_gifts
CREATE POLICY "Product gifts are viewable by everyone" 
ON product_gifts FOR SELECT 
USING (is_active = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Apenas admins/editors podem gerenciar product_gifts
CREATE POLICY "Only admins can manage product gifts" 
ON product_gifts FOR ALL 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

