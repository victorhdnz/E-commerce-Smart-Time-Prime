-- ==========================================
-- ADICIONAR LAYOUTS PADRÃO
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Layout Padrão (Landing Page existente)
INSERT INTO landing_layouts (
  id,
  name,
  slug,
  description,
  theme_colors,
  default_fonts,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Layout Padrão',
  'padrao',
  'Layout padrão com Hero, Media Showcase, Social Proof, FAQ e mais. Ideal para vendas diretas e conversão.',
  '{"primary": "#000000", "secondary": "#ffffff", "accent": "#FFD700", "background": "#ffffff", "text": "#000000", "button": "#000000", "buttonText": "#ffffff"}',
  '{"heading": "Inter", "body": "Inter", "button": "Inter"}',
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  theme_colors = EXCLUDED.theme_colors,
  default_fonts = EXCLUDED.default_fonts,
  updated_at = NOW();

-- Layout Apple Watch Style
INSERT INTO landing_layouts (
  id,
  name,
  slug,
  description,
  theme_colors,
  default_fonts,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Layout Apple Style',
  'apple-watch',
  'Layout minimalista inspirado na Apple. Design limpo com foco em produtos premium e experiência visual.',
  '{"primary": "#0071e3", "secondary": "#ffffff", "accent": "#f56300", "background": "#ffffff", "text": "#1d1d1f", "button": "#0071e3", "buttonText": "#ffffff"}',
  '{"heading": "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif", "body": "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif", "button": "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif"}',
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  theme_colors = EXCLUDED.theme_colors,
  default_fonts = EXCLUDED.default_fonts,
  updated_at = NOW();

-- Criar uma versão padrão para cada layout (se não existir)
INSERT INTO landing_versions (
  layout_id,
  name,
  slug,
  description,
  is_default,
  is_active,
  custom_styles,
  sections_config
) 
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'Versão Principal',
  'principal',
  'Versão principal do layout padrão',
  true,
  true,
  '{}',
  '{}'
WHERE NOT EXISTS (
  SELECT 1 FROM landing_versions 
  WHERE layout_id = '00000000-0000-0000-0000-000000000001' 
  AND slug = 'principal'
);

INSERT INTO landing_versions (
  layout_id,
  name,
  slug,
  description,
  is_default,
  is_active,
  custom_styles,
  sections_config
) 
SELECT 
  '00000000-0000-0000-0000-000000000002',
  'Versão Principal',
  'principal',
  'Versão principal do layout Apple Style',
  true,
  true,
  '{}',
  '{}'
WHERE NOT EXISTS (
  SELECT 1 FROM landing_versions 
  WHERE layout_id = '00000000-0000-0000-0000-000000000002' 
  AND slug = 'principal'
);

-- Mostrar layouts criados
SELECT l.name as layout, l.slug, v.name as versao, v.slug as versao_slug
FROM landing_layouts l
LEFT JOIN landing_versions v ON v.layout_id = l.id
ORDER BY l.created_at;

