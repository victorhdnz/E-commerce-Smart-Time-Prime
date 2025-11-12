-- Corrigir políticas RLS para cupons
-- Permitir que admins e editors possam gerenciar cupons

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;

-- Políticas para coupons
-- Todos podem ver cupons ativos
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Admins e editors podem fazer tudo com cupons
CREATE POLICY "Admins and editors can manage coupons" ON coupons 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Políticas para coupon_usage
-- Usuários só veem seus próprios usos
CREATE POLICY "Users can view own coupon usage" ON coupon_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios usos
CREATE POLICY "Users can insert own coupon usage" ON coupon_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

