-- Sistema de Tópicos de Classificação por Categoria
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de tópicos de classificação por categoria
CREATE TABLE IF NOT EXISTS category_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_name TEXT NOT NULL,
  topic_key TEXT NOT NULL,
  topic_label TEXT NOT NULL,
  topic_type TEXT NOT NULL CHECK (topic_type IN ('rating', 'text')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_name, topic_key)
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_category_topics_category ON category_topics(category_name);
CREATE INDEX IF NOT EXISTS idx_category_topics_type ON category_topics(topic_type);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_category_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_category_topics_timestamp ON category_topics;
CREATE TRIGGER update_category_topics_timestamp
BEFORE UPDATE ON category_topics
FOR EACH ROW
EXECUTE FUNCTION update_category_topics_updated_at();

-- RLS Policies
ALTER TABLE category_topics ENABLE ROW LEVEL SECURITY;

-- Todos podem ver os tópicos de categoria
DROP POLICY IF EXISTS "Todos podem ver tópicos de categoria" ON category_topics;
CREATE POLICY "Todos podem ver tópicos de categoria"
ON category_topics FOR SELECT
USING (true);

-- Apenas editores podem gerenciar tópicos
DROP POLICY IF EXISTS "Apenas editores podem gerenciar tópicos de categoria" ON category_topics;
CREATE POLICY "Apenas editores podem gerenciar tópicos de categoria"
ON category_topics FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Comentários
COMMENT ON TABLE category_topics IS 'Tópicos de classificação padrão para cada categoria de produto';
COMMENT ON COLUMN category_topics.category_name IS 'Nome da categoria (deve corresponder ao campo category em products)';
COMMENT ON COLUMN category_topics.topic_key IS 'Chave do tópico (usada internamente)';
COMMENT ON COLUMN category_topics.topic_label IS 'Rótulo do tópico (exibido ao usuário)';
COMMENT ON COLUMN category_topics.topic_type IS 'Tipo do tópico: rating (estrelas 1-5) ou text (texto livre)';
COMMENT ON COLUMN category_topics.display_order IS 'Ordem de exibição do tópico';

