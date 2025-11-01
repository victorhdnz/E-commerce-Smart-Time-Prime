-- ==========================================
-- SQL para adicionar campos da Landing Page Black Friday
-- ==========================================
-- Este script adiciona TODOS os campos editáveis necessários para a nova landing page
-- Mantém dados existentes e adiciona apenas campos novos com valores padrão

-- ==========================================
-- ATUALIZAR site_settings com todos os novos campos
-- ==========================================

-- Usar JSONB_SET para adicionar novos campos sem perder os existentes
-- Se o registro 'general' já existir, atualiza adicionando novos campos
-- Se não existir, cria com todos os campos

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

  -- Construir objeto JSONB com todos os campos necessários
  -- Adiciona apenas se o campo não existir (preserva valores existentes)
  
  updated_value := existing_value;
  
  -- ==========================================
  -- HERO SECTION
  -- ==========================================
  IF NOT (existing_value ? 'hero_title') THEN
    updated_value := jsonb_set(updated_value, '{hero_title}', '"🖤 SMART TIME PRIME — BLACK FRIDAY UBERLÂNDIA"');
  END IF;
  
  IF NOT (existing_value ? 'hero_subtitle') THEN
    updated_value := jsonb_set(updated_value, '{hero_subtitle}', '"🚨 A BLACK FRIDAY CHEGOU!\nSmartwatch Série 11 com até 50% OFF + 4 BRINDES EXCLUSIVOS\n📦 Entrega em até 24h direto do Shopping Planalto – Uberlândia/MG"');
  END IF;
  
  IF NOT (existing_value ? 'hero_badge_text') THEN
    updated_value := jsonb_set(updated_value, '{hero_badge_text}', '"🚨 A BLACK FRIDAY CHEGOU!"');
  END IF;
  
  IF NOT (existing_value ? 'hero_cta_text') THEN
    updated_value := jsonb_set(updated_value, '{hero_cta_text}', '"💬 QUERO MEU SÉRIE 11 AGORA!"');
  END IF;
  
  IF NOT (existing_value ? 'hero_cta_link') THEN
    updated_value := jsonb_set(updated_value, '{hero_cta_link}', '""');
  END IF;
  
  IF NOT (existing_value ? 'hero_bg_color') THEN
    updated_value := jsonb_set(updated_value, '{hero_bg_color}', '"#000000"');
  END IF;
  
  IF NOT (existing_value ? 'hero_text_color') THEN
    updated_value := jsonb_set(updated_value, '{hero_text_color}', '"#FFFFFF"');
  END IF;
  
  -- Hero Images (array de 4 imagens)
  IF NOT (existing_value ? 'hero_images') THEN
    updated_value := jsonb_set(updated_value, '{hero_images}', '[]'::JSONB);
  END IF;
  
  -- ==========================================
  -- TIMER SECTION
  -- ==========================================
  IF NOT (existing_value ? 'timer_title') THEN
    updated_value := jsonb_set(updated_value, '{timer_title}', '"⚡ Black Friday - Tempo Limitado!"');
  END IF;
  
  IF NOT (existing_value ? 'timer_end_date') THEN
    updated_value := jsonb_set(updated_value, '{timer_end_date}', 'null');
  END IF;
  
  IF NOT (existing_value ? 'timer_bg_color') THEN
    updated_value := jsonb_set(updated_value, '{timer_bg_color}', '"#000000"');
  END IF;
  
  IF NOT (existing_value ? 'timer_text_color') THEN
    updated_value := jsonb_set(updated_value, '{timer_text_color}', '"#FFFFFF"');
  END IF;
  
  -- ==========================================
  -- FIXED TIMER (Cronômetro Fixo)
  -- ==========================================
  IF NOT (existing_value ? 'fixed_timer_bg_color') THEN
    updated_value := jsonb_set(updated_value, '{fixed_timer_bg_color}', '"#000000"');
  END IF;
  
  IF NOT (existing_value ? 'fixed_timer_text_color') THEN
    updated_value := jsonb_set(updated_value, '{fixed_timer_text_color}', '"#FFFFFF"');
  END IF;
  
  -- ==========================================
  -- EXIT POPUP (Pop-up de Saída)
  -- ==========================================
  IF NOT (existing_value ? 'exit_popup_title') THEN
    updated_value := jsonb_set(updated_value, '{exit_popup_title}', '"⚠️ Espere!"');
  END IF;
  
  IF NOT (existing_value ? 'exit_popup_message') THEN
    updated_value := jsonb_set(updated_value, '{exit_popup_message}', '"Ainda dá tempo de garantir seu Smartwatch Série 11 com 4 brindes grátis."');
  END IF;
  
  IF NOT (existing_value ? 'exit_popup_button_text') THEN
    updated_value := jsonb_set(updated_value, '{exit_popup_button_text}', '"💬 FALAR AGORA NO WHATSAPP"');
  END IF;
  
  IF NOT (existing_value ? 'exit_popup_whatsapp_number') THEN
    updated_value := jsonb_set(updated_value, '{exit_popup_whatsapp_number}', '"5534984136291"');
  END IF;
  
  -- ==========================================
  -- MEDIA SHOWCASE (Fotos e Vídeo)
  -- ==========================================
  IF NOT (existing_value ? 'media_showcase_title') THEN
    updated_value := jsonb_set(updated_value, '{media_showcase_title}', '"💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO"');
  END IF;
  
  -- Features (array de objetos: {icon, text})
  IF NOT (existing_value ? 'media_showcase_features') THEN
    updated_value := jsonb_set(updated_value, '{media_showcase_features}', '[
      {"icon": "📱", "text": "Responda mensagens e chamadas direto do relógio"},
      {"icon": "❤️", "text": "Monitore batimentos, sono e pressão arterial"},
      {"icon": "🔋", "text": "Bateria que dura até 5 dias"},
      {"icon": "💧", "text": "Resistente à água e suor"},
      {"icon": "🎨", "text": "Troque pulseiras em segundos"},
      {"icon": "📲", "text": "Compatível com Android e iPhone"}
    ]'::JSONB);
  END IF;
  
  IF NOT (existing_value ? 'showcase_image_1') THEN
    updated_value := jsonb_set(updated_value, '{showcase_image_1}', '""');
  END IF;
  
  IF NOT (existing_value ? 'showcase_image_2') THEN
    updated_value := jsonb_set(updated_value, '{showcase_image_2}', '""');
  END IF;
  
  IF NOT (existing_value ? 'showcase_image_3') THEN
    updated_value := jsonb_set(updated_value, '{showcase_image_3}', '""');
  END IF;
  
  IF NOT (existing_value ? 'showcase_image_4') THEN
    updated_value := jsonb_set(updated_value, '{showcase_image_4}', '""');
  END IF;
  
  IF NOT (existing_value ? 'showcase_video_url') THEN
    updated_value := jsonb_set(updated_value, '{showcase_video_url}', '""');
  END IF;
  
  -- ==========================================
  -- VALUE PACKAGE (Pacote de Valor)
  -- ==========================================
  IF NOT (existing_value ? 'value_package_title') THEN
    updated_value := jsonb_set(updated_value, '{value_package_title}', '"🎁 VOCÊ LEVA TUDO ISSO"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_image') THEN
    updated_value := jsonb_set(updated_value, '{value_package_image}', '""');
  END IF;
  
  -- Items (array de objetos: {name, price})
  IF NOT (existing_value ? 'value_package_items') THEN
    updated_value := jsonb_set(updated_value, '{value_package_items}', '[
      {"name": "Smartwatch Série 11", "price": ""},
      {"name": "2 Pulseiras extras", "price": "R$ 79"},
      {"name": "1 Case protetor", "price": "R$ 39"},
      {"name": "1 Película premium", "price": "R$ 29"}
    ]'::JSONB);
  END IF;
  
  IF NOT (existing_value ? 'value_package_total_price') THEN
    updated_value := jsonb_set(updated_value, '{value_package_total_price}', '"R$ 447"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_sale_price') THEN
    updated_value := jsonb_set(updated_value, '{value_package_sale_price}', '"R$ 299"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_delivery_text') THEN
    updated_value := jsonb_set(updated_value, '{value_package_delivery_text}', '"📍 Entrega em até 24h para Uberlândia"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_button_text') THEN
    updated_value := jsonb_set(updated_value, '{value_package_button_text}', '"💬 GARANTIR MEU DESCONTO AGORA!"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_whatsapp_group_link') THEN
    updated_value := jsonb_set(updated_value, '{value_package_whatsapp_group_link}', '""');
  END IF;
  
  IF NOT (existing_value ? 'value_package_whatsapp_number') THEN
    updated_value := jsonb_set(updated_value, '{value_package_whatsapp_number}', '"5534984136291"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_stock_text') THEN
    updated_value := jsonb_set(updated_value, '{value_package_stock_text}', '"📦 Estoque limitado"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_discount_text') THEN
    updated_value := jsonb_set(updated_value, '{value_package_discount_text}', '"🎯 De R$ 499 → por R$ 299 + 4 brindes grátis!"');
  END IF;
  
  IF NOT (existing_value ? 'value_package_promotion_text') THEN
    updated_value := jsonb_set(updated_value, '{value_package_promotion_text}', '"🕒 Promoção válida enquanto durar o estoque."');
  END IF;
  
  -- ==========================================
  -- STORY SECTION (História)
  -- ==========================================
  IF NOT (existing_value ? 'story_title') THEN
    updated_value := jsonb_set(updated_value, '{story_title}', '"✍️ NOSSA HISTÓRIA"');
  END IF;
  
  IF NOT (existing_value ? 'story_content') THEN
    updated_value := jsonb_set(updated_value, '{story_content}', '"A Smart Time Prime nasceu em Uberlândia com o propósito de unir estilo e tecnologia no dia a dia das pessoas.\n\nHoje somos uma das lojas mais lembradas quando o assunto é smartwatch e confiança."');
  END IF;
  
  IF NOT (existing_value ? 'story_image') THEN
    updated_value := jsonb_set(updated_value, '{story_image}', '""');
  END IF;

  IF NOT (existing_value ? 'story_founders_names') THEN
    updated_value := jsonb_set(updated_value, '{story_founders_names}', '"Guilherme e Letícia"');
  END IF;
  
  -- ==========================================
  -- ABOUT US SECTION (Quem Somos)
  -- ==========================================
  IF NOT (existing_value ? 'about_us_title') THEN
    updated_value := jsonb_set(updated_value, '{about_us_title}', '"🏪 SOBRE A SMART TIME PRIME"');
  END IF;
  
  IF NOT (existing_value ? 'about_us_description') THEN
    updated_value := jsonb_set(updated_value, '{about_us_description}', '"A Smart Time Prime é uma loja de tecnologia localizada em Uberlândia/MG, dentro do Shopping Planalto.\n\nSomos referência em smartwatches e acessórios tecnológicos, com atendimento humano, entrega rápida e garantia total."');
  END IF;
  
  IF NOT (existing_value ? 'about_us_store_image') THEN
    updated_value := jsonb_set(updated_value, '{about_us_store_image}', '""');
  END IF;
  
  IF NOT (existing_value ? 'about_us_founders_image') THEN
    updated_value := jsonb_set(updated_value, '{about_us_founders_image}', '""');
  END IF;

  IF NOT (existing_value ? 'about_us_founders_names') THEN
    updated_value := jsonb_set(updated_value, '{about_us_founders_names}', '"Guilherme e Letícia"');
  END IF;

  IF NOT (existing_value ? 'about_us_location') THEN
    updated_value := jsonb_set(updated_value, '{about_us_location}', '"Shopping Planalto, Uberlândia/MG"');
  END IF;
  
  -- Manter campos About antigos se existirem
  IF NOT (existing_value ? 'about_title') AND (existing_value ? 'about_us_title') THEN
    updated_value := jsonb_set(updated_value, '{about_title}', (existing_value->>'about_us_title')::JSONB);
  END IF;
  
  IF NOT (existing_value ? 'about_description') AND (existing_value ? 'about_us_description') THEN
    updated_value := jsonb_set(updated_value, '{about_description}', (existing_value->>'about_us_description')::JSONB);
  END IF;
  
  IF NOT (existing_value ? 'about_image') AND (existing_value ? 'about_us_store_image') THEN
    updated_value := jsonb_set(updated_value, '{about_image}', (existing_value->>'about_us_store_image')::JSONB);
  END IF;
  
  -- ==========================================
  -- SOCIAL PROOF (Avaliações Google)
  -- ==========================================
  IF NOT (existing_value ? 'social_proof_title') THEN
    updated_value := jsonb_set(updated_value, '{social_proof_title}', '"⭐ CLIENTES DE UBERLÂNDIA QUE JÁ ESTÃO USANDO"');
  END IF;
  
  IF NOT (existing_value ? 'social_proof_google_icon') THEN
    updated_value := jsonb_set(updated_value, '{social_proof_google_icon}', 'true');
  END IF;
  
  IF NOT (existing_value ? 'social_proof_allow_photos') THEN
    updated_value := jsonb_set(updated_value, '{social_proof_allow_photos}', 'true');
  END IF;
  
  IF NOT (existing_value ? 'social_proof_testimonial_count') THEN
    updated_value := jsonb_set(updated_value, '{social_proof_testimonial_count}', '"💬 Mais de 1.000 smartwatches entregues em Uberlândia."');
  END IF;
  
  -- ==========================================
  -- CONTACT SECTION (manter existente)
  -- ==========================================
  IF NOT (existing_value ? 'contact_title') THEN
    updated_value := jsonb_set(updated_value, '{contact_title}', '"Entre em Contato"');
  END IF;
  
  IF NOT (existing_value ? 'contact_description') THEN
    updated_value := jsonb_set(updated_value, '{contact_description}', '"Estamos aqui para ajudar você!"');
  END IF;

  -- ==========================================
  -- SALVAR OU ATUALIZAR
  -- ==========================================
  INSERT INTO site_settings (key, value, description, updated_at)
  VALUES ('general', updated_value, 'Configurações gerais da landing page Black Friday', NOW())
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = updated_value,
    updated_at = NOW();

  RAISE NOTICE 'Site settings atualizado com sucesso!';
END $$;

-- ==========================================
-- VERIFICAR SE OS CAMPOS FORAM ADICIONADOS
-- ==========================================
SELECT 
  key,
  jsonb_object_keys(value) as campo
FROM site_settings
WHERE key = 'general'
ORDER BY campo;

