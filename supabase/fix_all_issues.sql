-- ==========================================
-- FIX COMPLETO - RESOLVER TODOS OS PROBLEMAS
-- ==========================================

-- 1. LIMPAR E RECRIAR SITE_SETTINGS
TRUNCATE TABLE site_settings;

INSERT INTO site_settings (key, value, description) VALUES
('general', '{"hero_title":"Elegância e Precisão em Cada Instante","hero_subtitle":"Descubra nossa coleção exclusiva de relógios premium","hero_cta_text":"Ver Coleção","hero_bg_color":"#000000","hero_text_color":"#FFFFFF","about_title":"Sobre a Smart Time Prime","about_description":"Somos especialistas em relógios premium, oferecendo as melhores marcas e modelos com design moderno e tecnologia de ponta.","contact_title":"Entre em Contato","contact_description":"Estamos aqui para ajudar você!","showcase_image_1":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800","showcase_image_2":"https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800","showcase_image_3":"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800","showcase_image_4":"https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800","showcase_video_url":""}', 'Configurações gerais do site')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 2. RLS POLICIES PARA SITE_SETTINGS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone" 
ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;
CREATE POLICY "Only admins can update site settings" 
ON site_settings FOR UPDATE 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

DROP POLICY IF EXISTS "Only admins can insert site settings" ON site_settings;
CREATE POLICY "Only admins can insert site settings" 
ON site_settings FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- 3. RLS POLICIES PARA ORDER_ITEMS (Corrigir erro 400)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" 
ON order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')))
  )
);

DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
CREATE POLICY "Users can create own order items" 
ON order_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 4. RLS POLICIES PARA PRODUCT_GIFTS
ALTER TABLE product_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product gifts are viewable by everyone" ON product_gifts;
CREATE POLICY "Product gifts are viewable by everyone" 
ON product_gifts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Only admins can manage product gifts" ON product_gifts;
CREATE POLICY "Only admins can manage product gifts" 
ON product_gifts FOR ALL 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- 5. VERIFICAR DADOS
SELECT 'site_settings' as tabela, COUNT(*) as linhas FROM site_settings
UNION ALL
SELECT 'seasonal_layouts', COUNT(*) FROM seasonal_layouts
UNION ALL
SELECT 'product_gifts', COUNT(*) FROM product_gifts
UNION ALL
SELECT 'faqs', COUNT(*) FROM faqs;

