-- ==========================================
-- ATUALIZAR SLUGS DOS LAYOUTS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Atualizar o slug de 'apple-watch' para 'apple'
UPDATE landing_layouts 
SET 
  slug = 'apple',
  updated_at = NOW()
WHERE slug = 'apple-watch';

-- Verificar se a atualização funcionou
SELECT id, name, slug, created_at FROM landing_layouts;

-- Nota: O layout 'padrao' permanece como está

