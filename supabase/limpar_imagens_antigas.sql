-- Script para limpar imagens antigas do Unsplash e preparar para Cloudinary
-- Execute este script no SQL Editor do Supabase

-- Atualizar as imagens para strings vazias (limpar todas as URLs antigas)
UPDATE site_settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        value,
        '{showcase_image_1}', '""'::jsonb
      ),
      '{showcase_image_2}', '""'::jsonb
    ),
    '{showcase_image_3}', '""'::jsonb
  ),
  '{showcase_image_4}', '""'::jsonb
),
updated_at = NOW()
WHERE key = 'general';

-- Verificar o resultado
SELECT key, value->'showcase_image_1' as imagem_1, 
       value->'showcase_image_2' as imagem_2,
       value->'showcase_image_3' as imagem_3,
       value->'showcase_image_4' as imagem_4
FROM site_settings 
WHERE key = 'general';

