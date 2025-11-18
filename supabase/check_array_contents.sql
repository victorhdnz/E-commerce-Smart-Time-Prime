-- Script para verificar o conteúdo dos arrays e ver se há imagens/vídeos salvos
-- Isso ajuda a identificar se os dados foram perdidos ou apenas os campos estão vazios

SELECT 
  'hero_banners' as campo,
  jsonb_array_length(COALESCE(value->'hero_banners', '[]'::jsonb)) as quantidade_itens,
  CASE 
    WHEN jsonb_array_length(COALESCE(value->'hero_banners', '[]'::jsonb)) > 0 
    THEN '✓ Tem ' || jsonb_array_length(COALESCE(value->'hero_banners', '[]'::jsonb))::text || ' item(ns)'
    ELSE '✗ Array vazio'
  END as status,
  value->'hero_banners' as conteudo_preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'showcase_images' as campo,
  jsonb_array_length(COALESCE(value->'showcase_images', '[]'::jsonb)) as quantidade_itens,
  CASE 
    WHEN jsonb_array_length(COALESCE(value->'showcase_images', '[]'::jsonb)) > 0 
    THEN '✓ Tem ' || jsonb_array_length(COALESCE(value->'showcase_images', '[]'::jsonb))::text || ' item(ns)'
    ELSE '✗ Array vazio'
  END as status,
  value->'showcase_images' as conteudo_preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'story_images' as campo,
  jsonb_array_length(COALESCE(value->'story_images', '[]'::jsonb)) as quantidade_itens,
  CASE 
    WHEN jsonb_array_length(COALESCE(value->'story_images', '[]'::jsonb)) > 0 
    THEN '✓ Tem ' || jsonb_array_length(COALESCE(value->'story_images', '[]'::jsonb))::text || ' item(ns)'
    ELSE '✗ Array vazio'
  END as status,
  value->'story_images' as conteudo_preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'about_us_store_images' as campo,
  jsonb_array_length(COALESCE(value->'about_us_store_images', '[]'::jsonb)) as quantidade_itens,
  CASE 
    WHEN jsonb_array_length(COALESCE(value->'about_us_store_images', '[]'::jsonb)) > 0 
    THEN '✓ Tem ' || jsonb_array_length(COALESCE(value->'about_us_store_images', '[]'::jsonb))::text || ' item(ns)'
    ELSE '✗ Array vazio'
  END as status,
  value->'about_us_store_images' as conteudo_preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'showcase_video_url' as campo,
  CASE 
    WHEN value->>'showcase_video_url' IS NOT NULL AND value->>'showcase_video_url' != '' 
    THEN 1 
    ELSE 0 
  END as quantidade_itens,
  CASE 
    WHEN value->>'showcase_video_url' IS NOT NULL AND value->>'showcase_video_url' != '' 
    THEN '✓ URL presente: ' || LEFT(value->>'showcase_video_url', 50)
    ELSE '✗ URL vazia ou não existe'
  END as status,
  value->'showcase_video_url' as conteudo_preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'value_package_items' as campo,
  jsonb_array_length(COALESCE(value->'value_package_items', '[]'::jsonb)) as quantidade_itens,
  CASE 
    WHEN jsonb_array_length(COALESCE(value->'value_package_items', '[]'::jsonb)) > 0 
    THEN '✓ Tem ' || jsonb_array_length(COALESCE(value->'value_package_items', '[]'::jsonb))::text || ' item(ns)'
    ELSE '✗ Array vazio'
  END as status,
  value->'value_package_items' as conteudo_preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'media_showcase_features' as campo,
  jsonb_array_length(COALESCE(value->'media_showcase_features', '[]'::jsonb)) as quantidade_itens,
  CASE 
    WHEN jsonb_array_length(COALESCE(value->'media_showcase_features', '[]'::jsonb)) > 0 
    THEN '✓ Tem ' || jsonb_array_length(COALESCE(value->'media_showcase_features', '[]'::jsonb))::text || ' item(ns)'
    ELSE '✗ Array vazio'
  END as status,
  value->'media_showcase_features' as conteudo_preview
FROM site_settings
WHERE key = 'general';

-- Verificar também campos de texto importantes
SELECT 
  'hero_title' as campo,
  CASE 
    WHEN value->>'hero_title' IS NOT NULL AND value->>'hero_title' != '' 
    THEN '✓ Texto presente'
    ELSE '✗ Texto vazio'
  END as status,
  LEFT(value->>'hero_title', 100) as preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'hero_subtitle' as campo,
  CASE 
    WHEN value->>'hero_subtitle' IS NOT NULL AND value->>'hero_subtitle' != '' 
    THEN '✓ Texto presente'
    ELSE '✗ Texto vazio'
  END as status,
  LEFT(value->>'hero_subtitle', 100) as preview
FROM site_settings
WHERE key = 'general'

UNION ALL

SELECT 
  'value_package_title' as campo,
  CASE 
    WHEN value->>'value_package_title' IS NOT NULL AND value->>'value_package_title' != '' 
    THEN '✓ Texto presente'
    ELSE '✗ Texto vazio'
  END as status,
  LEFT(value->>'value_package_title', 100) as preview
FROM site_settings
WHERE key = 'general';

