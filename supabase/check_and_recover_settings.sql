-- Script para verificar e tentar recuperar configurações perdidas
-- Este script verifica o estado atual do site_settings e tenta recuperar dados

-- 1. Verificar o estado atual do registro 'general' e listar todos os campos
SELECT 
  id,
  key,
  updated_at,
  jsonb_object_keys(value) as campo
FROM site_settings
WHERE key = 'general'
ORDER BY campo;

-- 2. Verificar se há registros de backup ou histórico
SELECT 
  id,
  key,
  updated_at,
  description
FROM site_settings
WHERE key = 'general'
ORDER BY updated_at DESC;

-- 3. Verificar a ordem das seções (pode estar em registro separado)
SELECT 
  id,
  key,
  value as section_order,
  updated_at
FROM site_settings
WHERE key = 'landing_section_order';

-- 4. Listar todos os registros de site_settings para ver se há dados em outros lugares
SELECT 
  id,
  key,
  updated_at,
  description,
  CASE 
    WHEN jsonb_typeof(value) = 'object' THEN 'object'
    WHEN jsonb_typeof(value) = 'array' THEN 'array'
    ELSE jsonb_typeof(value)
  END as tipo_valor
FROM site_settings
ORDER BY updated_at DESC
LIMIT 20;

-- 5. Verificar se há campos importantes que deveriam existir
SELECT 
  CASE 
    WHEN value ? 'hero_title' THEN '✓ hero_title existe'
    ELSE '✗ hero_title FALTANDO'
  END as hero_title_status,
  CASE 
    WHEN value ? 'showcase_images' THEN '✓ showcase_images existe'
    ELSE '✗ showcase_images FALTANDO'
  END as showcase_images_status,
  CASE 
    WHEN value ? 'value_package_items' THEN '✓ value_package_items existe'
    ELSE '✗ value_package_items FALTANDO'
  END as value_package_items_status,
  CASE 
    WHEN value ? 'hero_banners' THEN '✓ hero_banners existe'
    ELSE '✗ hero_banners FALTANDO'
  END as hero_banners_status,
  CASE 
    WHEN value ? 'showcase_video_url' THEN '✓ showcase_video_url existe'
    ELSE '✗ showcase_video_url FALTANDO'
  END as showcase_video_url_status,
  CASE 
    WHEN value ? 'hero_element_order' THEN '✓ hero_element_order existe'
    ELSE '✗ hero_element_order FALTANDO'
  END as hero_element_order_status
FROM site_settings
WHERE key = 'general';

-- 6. Ver o valor completo do JSONB (últimas 5000 caracteres para não exceder limite)
SELECT 
  id,
  key,
  updated_at,
  LEFT(value::text, 5000) as value_preview,
  LENGTH(value::text) as tamanho_total
FROM site_settings
WHERE key = 'general';

