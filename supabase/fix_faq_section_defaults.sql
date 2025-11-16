-- Script para garantir que os valores padrão da seção FAQ estejam corretos
-- Este script atualiza as configurações existentes para incluir os valores padrão da FAQ
-- caso eles não existam

-- Atualizar configurações gerais para incluir valores padrão da FAQ se não existirem
UPDATE site_settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(value, '{}'::jsonb),
      '{section_faq_visible}',
      COALESCE(value->'section_faq_visible', 'true'::jsonb)
    ),
    '{faq_title}',
    COALESCE(value->'faq_title', '"Perguntas Frequentes"'::jsonb)
  ),
  '{faq_bg_color}',
  COALESCE(value->'faq_bg_color', '"#ffffff"'::jsonb)
)
WHERE key = 'general'
  AND (
    value->'section_faq_visible' IS NULL
    OR value->'faq_title' IS NULL
    OR value->'faq_bg_color' IS NULL
  );

-- Garantir que faq_title_visible também existe
UPDATE site_settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{faq_title_visible}',
  COALESCE(value->'faq_title_visible', 'true'::jsonb)
)
WHERE key = 'general'
  AND value->'faq_title_visible' IS NULL;

-- Garantir que section_faq_visible_default também existe
UPDATE site_settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{section_faq_visible_default}',
  COALESCE(value->'section_faq_visible_default', 'true'::jsonb)
)
WHERE key = 'general'
  AND value->'section_faq_visible_default' IS NULL;

-- Verificar se a seção FAQ está na ordem das seções
-- Para landing_section_order, o value é diretamente um array, não um objeto
DO $$
DECLARE
  current_order jsonb;
  new_order jsonb;
BEGIN
  -- Buscar a ordem atual (value é diretamente o array)
  SELECT value INTO current_order
  FROM site_settings
  WHERE key = 'landing_section_order';
  
  -- Se não existe, criar com a ordem padrão incluindo 'faq'
  IF current_order IS NULL THEN
    INSERT INTO site_settings (key, value, description)
    VALUES ('landing_section_order', '["hero", "media_showcase", "value_package", "social_proof", "story", "whatsapp_vip", "about_us", "contact", "faq"]'::jsonb, 'Ordem das seções da landing page')
    ON CONFLICT (key) DO NOTHING;
  -- Se existe mas não tem 'faq', adicionar ao final
  ELSIF NOT (current_order @> '"faq"'::jsonb) THEN
    -- Adicionar 'faq' ao final do array
    new_order := current_order || '["faq"]'::jsonb;
    UPDATE site_settings
    SET value = new_order
    WHERE key = 'landing_section_order';
  END IF;
END $$;

