-- Script para adicionar campos de nomes dos donos/fundadores
-- Execute este script no Supabase SQL Editor se você já executou o add_black_friday_landing_fields.sql antes

DO $$
DECLARE
  existing_value JSONB;
  updated_value JSONB;
BEGIN
  -- Buscar valor existente
  SELECT value INTO existing_value
  FROM site_settings
  WHERE key = 'general'
  LIMIT 1;

  -- Se não existir, criar do zero
  IF existing_value IS NULL THEN
    existing_value := '{}'::JSONB;
  END IF;

  updated_value := existing_value;

  -- Adicionar story_founders_names se não existir
  IF NOT (existing_value ? 'story_founders_names') THEN
    updated_value := jsonb_set(updated_value, '{story_founders_names}', '"Guilherme e Letícia"');
  ELSE
    -- Se existir mas estiver vazio, atualizar para o valor padrão
    IF (existing_value->>'story_founders_names') IS NULL OR (existing_value->>'story_founders_names') = '' THEN
      updated_value := jsonb_set(updated_value, '{story_founders_names}', '"Guilherme e Letícia"');
    END IF;
  END IF;

  -- Adicionar about_us_founders_names se não existir
  IF NOT (existing_value ? 'about_us_founders_names') THEN
    updated_value := jsonb_set(updated_value, '{about_us_founders_names}', '"Guilherme e Letícia"');
  ELSE
    -- Se existir mas estiver vazio, atualizar para o valor padrão
    IF (existing_value->>'about_us_founders_names') IS NULL OR (existing_value->>'about_us_founders_names') = '' THEN
      updated_value := jsonb_set(updated_value, '{about_us_founders_names}', '"Guilherme e Letícia"');
    END IF;
  END IF;

  -- Atualizar ou inserir
  UPDATE site_settings
  SET value = updated_value,
      updated_at = NOW()
  WHERE key = 'general';

  -- Se não houver registro, inserir
  IF NOT FOUND THEN
    INSERT INTO site_settings (key, value, description, updated_at)
    VALUES ('general', updated_value, 'Configurações gerais da landing page Black Friday', NOW());
  END IF;

  RAISE NOTICE 'Nomes dos donos adicionados/atualizados com sucesso!';
END $$;

-- Verificar se os campos foram adicionados
SELECT
  key,
  value->>'story_founders_names' as story_founders_names,
  value->>'about_us_founders_names' as about_us_founders_names
FROM site_settings
WHERE key = 'general';

