-- Adicionar colunas faltantes na tabela site_settings
-- Estas colunas são usadas na página de configurações do dashboard

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
  -- Adicionar colunas de informações gerais
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'site_name') THEN
    ALTER TABLE site_settings ADD COLUMN site_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'site_description') THEN
    ALTER TABLE site_settings ADD COLUMN site_description TEXT;
  END IF;

  -- Adicionar colunas de contato
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_email') THEN
    ALTER TABLE site_settings ADD COLUMN contact_email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_phone') THEN
    ALTER TABLE site_settings ADD COLUMN contact_phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_whatsapp') THEN
    ALTER TABLE site_settings ADD COLUMN contact_whatsapp TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'contact_maps_link') THEN
    ALTER TABLE site_settings ADD COLUMN contact_maps_link TEXT;
  END IF;

  -- Adicionar colunas de redes sociais
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'instagram_url') THEN
    ALTER TABLE site_settings ADD COLUMN instagram_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'facebook_url') THEN
    ALTER TABLE site_settings ADD COLUMN facebook_url TEXT;
  END IF;

  -- Adicionar colunas de endereço
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address_street') THEN
    ALTER TABLE site_settings ADD COLUMN address_street TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address_city') THEN
    ALTER TABLE site_settings ADD COLUMN address_city TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address_state') THEN
    ALTER TABLE site_settings ADD COLUMN address_state TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address_zip') THEN
    ALTER TABLE site_settings ADD COLUMN address_zip TEXT;
  END IF;
END $$;

-- Comentários para documentação
COMMENT ON COLUMN site_settings.site_name IS 'Nome do site';
COMMENT ON COLUMN site_settings.site_description IS 'Descrição do site';
COMMENT ON COLUMN site_settings.contact_email IS 'Email de contato';
COMMENT ON COLUMN site_settings.contact_phone IS 'Telefone de contato';
COMMENT ON COLUMN site_settings.contact_whatsapp IS 'WhatsApp de contato';
COMMENT ON COLUMN site_settings.contact_maps_link IS 'Link do Google Maps';
COMMENT ON COLUMN site_settings.instagram_url IS 'URL do Instagram';
COMMENT ON COLUMN site_settings.facebook_url IS 'URL do Facebook';
COMMENT ON COLUMN site_settings.address_street IS 'Endereço completo (rua)';
COMMENT ON COLUMN site_settings.address_city IS 'Cidade';
COMMENT ON COLUMN site_settings.address_state IS 'Estado';
COMMENT ON COLUMN site_settings.address_zip IS 'CEP';

