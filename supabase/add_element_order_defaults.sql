-- Adicionar valores padrão para ordem dos elementos dentro de cada seção
-- Este script garante que os campos de ordem dos elementos existam no JSONB value
-- Também remove o campo hero_viewer_count_link que não é mais necessário

DO $$
DECLARE
  current_value JSONB;
  updated_value JSONB;
BEGIN
  -- Buscar o registro 'general' existente
  SELECT value INTO current_value
  FROM site_settings
  WHERE key = 'general'
  LIMIT 1;

  -- Se não existir registro, criar um novo
  IF current_value IS NULL THEN
    INSERT INTO site_settings (key, value, description, updated_at)
    VALUES (
      'general',
      jsonb_build_object(
        'hero_element_order', ARRAY['hero_banner_visible', 'hero_badge_visible', 'hero_title_visible', 'hero_subtitle_visible', 'hero_viewer_count', 'hero_timer_visible', 'hero_cta_visible', 'hero_button_visible']::text[],
        'media_showcase_element_order', ARRAY['media_showcase_title_visible', 'media_showcase_features_visible', 'media_showcase_images_visible', 'media_showcase_video_visible']::text[],
        'value_package_element_order', ARRAY['value_package_title_visible', 'value_package_image_visible', 'value_package_items_visible', 'value_package_prices_visible', 'value_package_timer_visible', 'value_package_button_visible']::text[],
        'social_proof_element_order', ARRAY['social_proof_title_visible', 'social_proof_reviews_visible']::text[],
        'story_element_order', ARRAY['story_title_visible', 'story_content_visible', 'story_images_visible']::text[],
        'about_us_element_order', ARRAY['about_us_title_visible', 'about_us_description_visible', 'about_us_images_visible', 'about_us_location_visible']::text[],
        'contact_element_order', ARRAY['contact_title_visible', 'contact_description_visible', 'contact_whatsapp_visible', 'contact_email_visible', 'contact_schedule_visible', 'contact_location_visible']::text[],
        'faq_element_order', ARRAY['faq_title_visible']::text[]
      ),
      'Configurações gerais do site',
      NOW()
    );
  ELSE
    -- Atualizar registro existente, adicionando apenas os campos que não existem
    updated_value := current_value;

    -- Adicionar hero_element_order se não existir
    IF NOT (updated_value ? 'hero_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'hero_element_order', ARRAY['hero_banner_visible', 'hero_badge_visible', 'hero_title_visible', 'hero_subtitle_visible', 'hero_viewer_count', 'hero_timer_visible', 'hero_cta_visible', 'hero_button_visible']::text[]
      );
    END IF;

    -- Adicionar media_showcase_element_order se não existir
    IF NOT (updated_value ? 'media_showcase_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'media_showcase_element_order', ARRAY['media_showcase_title_visible', 'media_showcase_features_visible', 'media_showcase_images_visible', 'media_showcase_video_visible']::text[]
      );
    END IF;

    -- Adicionar value_package_element_order se não existir
    IF NOT (updated_value ? 'value_package_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'value_package_element_order', ARRAY['value_package_title_visible', 'value_package_image_visible', 'value_package_items_visible', 'value_package_prices_visible', 'value_package_timer_visible', 'value_package_button_visible']::text[]
      );
    END IF;

    -- Adicionar social_proof_element_order se não existir
    IF NOT (updated_value ? 'social_proof_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'social_proof_element_order', ARRAY['social_proof_title_visible', 'social_proof_reviews_visible']::text[]
      );
    END IF;

    -- Adicionar story_element_order se não existir
    IF NOT (updated_value ? 'story_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'story_element_order', ARRAY['story_title_visible', 'story_content_visible', 'story_images_visible']::text[]
      );
    END IF;

    -- Adicionar about_us_element_order se não existir
    IF NOT (updated_value ? 'about_us_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'about_us_element_order', ARRAY['about_us_title_visible', 'about_us_description_visible', 'about_us_images_visible', 'about_us_location_visible']::text[]
      );
    END IF;

    -- Adicionar contact_element_order se não existir
    IF NOT (updated_value ? 'contact_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'contact_element_order', ARRAY['contact_title_visible', 'contact_description_visible', 'contact_whatsapp_visible', 'contact_email_visible', 'contact_schedule_visible', 'contact_location_visible']::text[]
      );
    END IF;

    -- Adicionar faq_element_order se não existir
    IF NOT (updated_value ? 'faq_element_order') THEN
      updated_value := updated_value || jsonb_build_object(
        'faq_element_order', ARRAY['faq_title_visible']::text[]
      );
    END IF;

    -- Remover hero_viewer_count_link se existir (não é mais necessário)
    IF updated_value ? 'hero_viewer_count_link' THEN
      updated_value := updated_value - 'hero_viewer_count_link';
    END IF;

    -- Atualizar o registro
    UPDATE site_settings
    SET 
      value = updated_value,
      updated_at = NOW()
    WHERE key = 'general';
  END IF;

  RAISE NOTICE 'Valores padrão de ordem dos elementos adicionados com sucesso!';
END $$;

