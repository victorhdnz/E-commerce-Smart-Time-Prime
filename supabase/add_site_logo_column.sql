-- Adicionar coluna site_logo à tabela site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS site_logo TEXT;

-- Comentário para documentação
COMMENT ON COLUMN site_settings.site_logo IS 'URL da logo da empresa que aparece no navigation ao lado esquerdo do nome';

