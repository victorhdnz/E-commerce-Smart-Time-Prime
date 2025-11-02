-- Criar tabela de favoritos (wishlist)
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

COMMENT ON TABLE favorites IS 'Tabela de produtos favoritados pelos usuários';

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios favoritos
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios favoritos
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

