-- Adicionar campos de controle de publicação à tabela site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_published_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES profiles(id);

-- Criar tabela para histórico de publicações
CREATE TABLE IF NOT EXISTS publication_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settings_key TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('publish', 'unpublish', 'schedule', 'auto_publish')),
  published_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  settings_snapshot JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_publication_history_settings_key ON publication_history(settings_key);
CREATE INDEX IF NOT EXISTS idx_publication_history_published_at ON publication_history(published_at);
CREATE INDEX IF NOT EXISTS idx_site_settings_scheduled_publish ON site_settings(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;

-- Habilitar RLS
ALTER TABLE publication_history ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para publication_history
CREATE POLICY "Editores podem ver histórico de publicações" ON publication_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Editores podem inserir no histórico" ON publication_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Função para publicar configurações automaticamente
CREATE OR REPLACE FUNCTION auto_publish_scheduled_settings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Publicar configurações agendadas que chegaram na hora
  UPDATE site_settings 
  SET 
    is_published = true,
    last_published_at = NOW(),
    scheduled_publish_at = NULL
  WHERE 
    scheduled_publish_at IS NOT NULL 
    AND scheduled_publish_at <= NOW()
    AND is_published = false;

  -- Registrar no histórico
  INSERT INTO publication_history (settings_key, action, published_at, notes)
  SELECT 
    key,
    'auto_publish',
    NOW(),
    'Publicação automática agendada'
  FROM site_settings 
  WHERE 
    scheduled_publish_at IS NOT NULL 
    AND scheduled_publish_at <= NOW()
    AND is_published = true;
END;
$$;

-- Comentários para documentação
COMMENT ON TABLE publication_history IS 'Histórico de todas as ações de publicação realizadas no sistema';
COMMENT ON COLUMN site_settings.is_published IS 'Indica se as configurações estão publicadas e visíveis no site';
COMMENT ON COLUMN site_settings.scheduled_publish_at IS 'Data e hora agendada para publicação automática';
COMMENT ON COLUMN site_settings.last_published_at IS 'Última vez que as configurações foram publicadas';
COMMENT ON COLUMN site_settings.published_by IS 'Usuário que realizou a última publicação';