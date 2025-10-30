-- 1. Limpar tabela site_settings
TRUNCATE TABLE site_settings;

-- 2. Inserir configuração única no formato key-value
INSERT INTO site_settings (key, value, description) VALUES
('general', '{"hero_title":"Elegância e Precisão em Cada Instante","hero_subtitle":"Descubra nossa coleção exclusiva de relógios premium","hero_cta_text":"Ver Coleção","about_title":"Sobre a Smart Time Prime","about_description":"Somos especialistas em relógios premium, oferecendo as melhores marcas e modelos com design moderno e tecnologia de ponta.","contact_title":"Entre em Contato","contact_description":"Estamos aqui para ajudar você!","showcase_image_1":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800","showcase_image_2":"https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800","showcase_image_3":"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800","showcase_image_4":"https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800","showcase_video_url":""}', 'Configurações gerais do site')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 3. Adicionar RLS policies para site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Todos podem ver configurações
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone" 
ON site_settings FOR SELECT 
USING (true);

-- Apenas admins/editors podem atualizar
DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;
CREATE POLICY "Only admins can update site settings" 
ON site_settings FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Apenas admins/editors podem inserir
DROP POLICY IF EXISTS "Only admins can insert site settings" ON site_settings;
CREATE POLICY "Only admins can insert site settings" 
ON site_settings FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

