-- Adicionar colunas de imagens e vídeo na tabela site_settings

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS showcase_image_1 TEXT DEFAULT 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
ADD COLUMN IF NOT EXISTS showcase_image_2 TEXT DEFAULT 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800',
ADD COLUMN IF NOT EXISTS showcase_image_3 TEXT DEFAULT 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
ADD COLUMN IF NOT EXISTS showcase_image_4 TEXT DEFAULT 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800',
ADD COLUMN IF NOT EXISTS showcase_video_url TEXT DEFAULT '';

-- Comentários para documentação
COMMENT ON COLUMN site_settings.showcase_image_1 IS 'URL da primeira imagem do carrossel de destaques';
COMMENT ON COLUMN site_settings.showcase_image_2 IS 'URL da segunda imagem do carrossel de destaques';
COMMENT ON COLUMN site_settings.showcase_image_3 IS 'URL da terceira imagem do carrossel de destaques';
COMMENT ON COLUMN site_settings.showcase_image_4 IS 'URL da quarta imagem do carrossel de destaques';
COMMENT ON COLUMN site_settings.showcase_video_url IS 'URL do vídeo vertical (Reels/Stories)';

