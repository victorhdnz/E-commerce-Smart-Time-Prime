-- Adicionar coluna loading_emoji na tabela site_settings
-- Esta coluna armazena o emoji usado nas animações de carregamento

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'loading_emoji') THEN
    ALTER TABLE site_settings ADD COLUMN loading_emoji TEXT DEFAULT '⌚';
  END IF;
END $$;

-- Comentário para documentação
COMMENT ON COLUMN site_settings.loading_emoji IS 'Emoji usado nas animações de carregamento do site';

