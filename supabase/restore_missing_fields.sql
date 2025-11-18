-- Script para restaurar campos que podem ter sido perdidos
-- Este script preserva dados existentes e adiciona apenas campos que estão faltando

DO $$
DECLARE
  current_value JSONB;
  updated_value JSONB;
BEGIN
  -- Buscar o valor atual
  SELECT value INTO current_value
  FROM site_settings
  WHERE key = 'general'
  LIMIT 1;

  -- Se não existir registro, criar um novo com valores padrão
  IF current_value IS NULL THEN
    INSERT INTO site_settings (key, value, description, updated_at)
    VALUES (
      'general',
      '{}'::JSONB,
      'Configurações gerais do site',
      NOW()
    );
    current_value := '{}'::JSONB;
  END IF;

  updated_value := current_value;

  -- Preservar arrays vazios se não existirem (não sobrescrever se já existirem)
  -- Apenas adicionar se não existirem
  
  -- Arrays de imagens - só adicionar se não existirem
  IF NOT (updated_value ? 'hero_images') THEN
    updated_value := updated_value || jsonb_build_object('hero_images', '[]'::jsonb);
  END IF;
  
  IF NOT (updated_value ? 'hero_banners') THEN
    updated_value := updated_value || jsonb_build_object('hero_banners', '[]'::jsonb);
  END IF;
  
  IF NOT (updated_value ? 'showcase_images') THEN
    updated_value := updated_value || jsonb_build_object('showcase_images', '[]'::jsonb);
  END IF;
  
  IF NOT (updated_value ? 'story_images') THEN
    updated_value := updated_value || jsonb_build_object('story_images', '[]'::jsonb);
  END IF;
  
  IF NOT (updated_value ? 'about_us_store_images') THEN
    updated_value := updated_value || jsonb_build_object('about_us_store_images', '[]'::jsonb);
  END IF;
  
  -- Campos de URL e texto que podem estar faltando
  IF NOT (updated_value ? 'showcase_video_url') THEN
    updated_value := updated_value || jsonb_build_object('showcase_video_url', '');
  END IF;
  
  IF NOT (updated_value ? 'hero_banner') THEN
    updated_value := updated_value || jsonb_build_object('hero_banner', '');
  END IF;
  
  IF NOT (updated_value ? 'showcase_image_1') THEN
    updated_value := updated_value || jsonb_build_object('showcase_image_1', '');
  END IF;
  
  IF NOT (updated_value ? 'showcase_image_2') THEN
    updated_value := updated_value || jsonb_build_object('showcase_image_2', '');
  END IF;
  
  IF NOT (updated_value ? 'showcase_image_3') THEN
    updated_value := updated_value || jsonb_build_object('showcase_image_3', '');
  END IF;
  
  IF NOT (updated_value ? 'showcase_image_4') THEN
    updated_value := updated_value || jsonb_build_object('showcase_image_4', '');
  END IF;
  
  IF NOT (updated_value ? 'value_package_image') THEN
    updated_value := updated_value || jsonb_build_object('value_package_image', '');
  END IF;
  
  IF NOT (updated_value ? 'story_image') THEN
    updated_value := updated_value || jsonb_build_object('story_image', '');
  END IF;
  
  IF NOT (updated_value ? 'about_us_store_image') THEN
    updated_value := updated_value || jsonb_build_object('about_us_store_image', '');
  END IF;
  
  IF NOT (updated_value ? 'about_us_founders_image') THEN
    updated_value := updated_value || jsonb_build_object('about_us_founders_image', '');
  END IF;

  -- Campos de texto importantes - só adicionar se não existirem
  IF NOT (updated_value ? 'hero_title') THEN
    updated_value := updated_value || jsonb_build_object('hero_title', '');
  END IF;
  
  IF NOT (updated_value ? 'hero_subtitle') THEN
    updated_value := updated_value || jsonb_build_object('hero_subtitle', '');
  END IF;
  
  IF NOT (updated_value ? 'hero_badge_text') THEN
    updated_value := updated_value || jsonb_build_object('hero_badge_text', '');
  END IF;
  
  IF NOT (updated_value ? 'hero_button_text') THEN
    updated_value := updated_value || jsonb_build_object('hero_button_text', '');
  END IF;
  
  IF NOT (updated_value ? 'hero_button_link') THEN
    updated_value := updated_value || jsonb_build_object('hero_button_link', '');
  END IF;
  
  IF NOT (updated_value ? 'value_package_title') THEN
    updated_value := updated_value || jsonb_build_object('value_package_title', '');
  END IF;
  
  IF NOT (updated_value ? 'media_showcase_title') THEN
    updated_value := updated_value || jsonb_build_object('media_showcase_title', '');
  END IF;
  
  IF NOT (updated_value ? 'story_title') THEN
    updated_value := updated_value || jsonb_build_object('story_title', '');
  END IF;
  
  IF NOT (updated_value ? 'story_content') THEN
    updated_value := updated_value || jsonb_build_object('story_content', '');
  END IF;
  
  IF NOT (updated_value ? 'about_us_title') THEN
    updated_value := updated_value || jsonb_build_object('about_us_title', '');
  END IF;
  
  IF NOT (updated_value ? 'about_us_description') THEN
    updated_value := updated_value || jsonb_build_object('about_us_description', '');
  END IF;

  -- Arrays de objetos importantes - só adicionar se não existirem
  IF NOT (updated_value ? 'value_package_items') THEN
    updated_value := updated_value || jsonb_build_object(
      'value_package_items',
      jsonb_build_array(
        jsonb_build_object('name', 'Smartwatch Série 11', 'price', ''),
        jsonb_build_object('name', '2 Pulseiras extras', 'price', 'R$ 79'),
        jsonb_build_object('name', '1 Case protetor', 'price', 'R$ 39'),
        jsonb_build_object('name', '1 Película premium', 'price', 'R$ 29')
      )
    );
  END IF;
  
  IF NOT (updated_value ? 'media_showcase_features') THEN
    updated_value := updated_value || jsonb_build_object(
      'media_showcase_features',
      jsonb_build_array(
        jsonb_build_object('icon', '📱', 'text', 'Responda mensagens e chamadas direto do relógio'),
        jsonb_build_object('icon', '❤️', 'text', 'Monitore batimentos, sono e pressão arterial'),
        jsonb_build_object('icon', '🔋', 'text', 'Bateria que dura até 5 dias'),
        jsonb_build_object('icon', '💧', 'text', 'Resistente à água e suor'),
        jsonb_build_object('icon', '🎨', 'text', 'Troque pulseiras em segundos'),
        jsonb_build_object('icon', '📲', 'text', 'Compatível com Android e iPhone')
      )
    );
  END IF;
  
  IF NOT (updated_value ? 'social_proof_reviews') THEN
    updated_value := updated_value || jsonb_build_object(
      'social_proof_reviews',
      jsonb_build_array(
        jsonb_build_object('id', '1', 'customer_name', 'Maria C., Planalto', 'comment', 'Chegou em menos de 1 dia! Atendimento excelente.', 'rating', 5, 'photo', '', 'google_review_link', ''),
        jsonb_build_object('id', '2', 'customer_name', 'Juliana R., Santa Mônica', 'comment', 'Comprei pro meu marido, ele amou.', 'rating', 5, 'photo', '', 'google_review_link', ''),
        jsonb_build_object('id', '3', 'customer_name', 'Carlos S., Tibery', 'comment', 'Produto top e suporte pelo WhatsApp super rápido.', 'rating', 5, 'photo', '', 'google_review_link', '')
      )
    );
  END IF;

  -- Arrays de ordem de elementos - só adicionar se não existirem
  IF NOT (updated_value ? 'hero_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'hero_element_order', 
      ARRAY['hero_banner_visible', 'hero_badge_visible', 'hero_title_visible', 'hero_subtitle_visible', 'hero_viewer_count', 'hero_timer_visible', 'hero_button_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'media_showcase_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'media_showcase_element_order',
      ARRAY['media_showcase_title_visible', 'media_showcase_features_visible', 'media_showcase_images_visible', 'media_showcase_video_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'value_package_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'value_package_element_order',
      ARRAY['value_package_title_visible', 'value_package_image_visible', 'value_package_items_visible', 'value_package_prices_visible', 'value_package_timer_visible', 'value_package_button_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'social_proof_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'social_proof_element_order',
      ARRAY['social_proof_title_visible', 'social_proof_reviews_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'story_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'story_element_order',
      ARRAY['story_title_visible', 'story_content_visible', 'story_images_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'about_us_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'about_us_element_order',
      ARRAY['about_us_title_visible', 'about_us_description_visible', 'about_us_images_visible', 'about_us_location_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'contact_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'contact_element_order',
      ARRAY['contact_title_visible', 'contact_description_visible', 'contact_whatsapp_visible', 'contact_email_visible', 'contact_schedule_visible', 'contact_location_visible']::text[]
    );
  END IF;
  
  IF NOT (updated_value ? 'faq_element_order') THEN
    updated_value := updated_value || jsonb_build_object(
      'faq_element_order',
      ARRAY['faq_title_visible']::text[]
    );
  END IF;

  -- Atualizar o registro preservando todos os dados existentes
  UPDATE site_settings
  SET 
    value = updated_value,
    updated_at = NOW()
  WHERE key = 'general';

  RAISE NOTICE 'Campos faltantes restaurados com sucesso! Dados existentes foram preservados.';
END $$;

-- Verificar o resultado - campos importantes
SELECT 
  CASE 
    WHEN value ? 'hero_banners' THEN '✓ hero_banners existe'
    ELSE '✗ hero_banners FALTANDO'
  END as hero_banners_status,
  CASE 
    WHEN value ? 'showcase_images' THEN '✓ showcase_images existe'
    ELSE '✗ showcase_images FALTANDO'
  END as showcase_images_status,
  CASE 
    WHEN value ? 'showcase_video_url' THEN '✓ showcase_video_url existe'
    ELSE '✗ showcase_video_url FALTANDO'
  END as showcase_video_url_status,
  CASE 
    WHEN value ? 'hero_title' THEN '✓ hero_title existe'
    ELSE '✗ hero_title FALTANDO'
  END as hero_title_status,
  CASE 
    WHEN value ? 'value_package_items' THEN '✓ value_package_items existe'
    ELSE '✗ value_package_items FALTANDO'
  END as value_package_items_status,
  CASE 
    WHEN value ? 'media_showcase_features' THEN '✓ media_showcase_features existe'
    ELSE '✗ media_showcase_features FALTANDO'
  END as media_showcase_features_status,
  jsonb_array_length(COALESCE(value->'hero_banners', '[]'::jsonb)) as hero_banners_count,
  jsonb_array_length(COALESCE(value->'showcase_images', '[]'::jsonb)) as showcase_images_count,
  jsonb_array_length(COALESCE(value->'story_images', '[]'::jsonb)) as story_images_count
FROM site_settings
WHERE key = 'general';

