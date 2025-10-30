-- Adicionar campos faltantes para layouts sazonais funcionarem completamente
ALTER TABLE seasonal_layouts
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_cta_text TEXT,
ADD COLUMN IF NOT EXISTS hero_bg_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS hero_text_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS timer_title TEXT DEFAULT 'Oferta por Tempo Limitado!',
ADD COLUMN IF NOT EXISTS timer_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS timer_bg_color TEXT,
ADD COLUMN IF NOT EXISTS timer_text_color TEXT,
ADD COLUMN IF NOT EXISTS site_theme JSONB DEFAULT '{}';

