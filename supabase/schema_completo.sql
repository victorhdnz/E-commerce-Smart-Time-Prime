-- ==========================================
-- SCHEMA COMPLETO DO E-COMMERCE
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES (Usuários)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'editor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ADDRESSES (Endereços)
-- ==========================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCTS (Produtos)
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  local_price DECIMAL(10, 2) NOT NULL,
  national_price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  weight DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  length DECIMAL(10, 2),
  category TEXT,
  tags TEXT[],
  images TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCT COLORS (Variações de Cor)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCT GIFTS (Brindes Vinculados)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  gift_product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCT COMBOS (Combos de Produtos)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_combos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2),
  available_quantity INTEGER DEFAULT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  seasonal_layout_id UUID REFERENCES seasonal_layouts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COMBO ITEMS (Itens dos Combos)
-- ==========================================
CREATE TABLE IF NOT EXISTS combo_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  combo_id UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(combo_id, product_id)
);

-- ==========================================
-- REVIEWS (Avaliações)
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  photo TEXT,
  google_review_link TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ORDERS (Pedidos)
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  tracking_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ORDER ITEMS (Itens do Pedido)
-- ==========================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL NOT NULL,
  color_id UUID REFERENCES product_colors(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  is_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COUPONS (Cupons de Desconto)
-- ==========================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COUPON USAGE (Uso de Cupons)
-- ==========================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- ==========================================
-- FAVORITES (Favoritos/Wishlist)
-- ==========================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==========================================
-- SEASONAL LAYOUTS (Layouts Sazonais)
-- ==========================================
CREATE TABLE IF NOT EXISTS seasonal_layouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  theme_colors JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- LANDING PAGE SECTIONS (Seções Modulares)
-- ==========================================
CREATE TABLE IF NOT EXISTS landing_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  layout_id UUID REFERENCES seasonal_layouts(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('hero', 'timer', 'featured_products', 'gifts', 'social_proof', 'about', 'last_call', 'faq', 'custom')),
  title TEXT,
  content JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  cta_config JSONB DEFAULT '{}',
  order_position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  background_color TEXT,
  text_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TIMERS (Cronômetros)
-- ==========================================
CREATE TABLE IF NOT EXISTS timers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES landing_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- FAQ (Perguntas Frequentes)
-- ==========================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SITE SETTINGS (Configurações Globais)
-- ==========================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  -- Colunas diretas para configurações comuns
  site_name TEXT,
  site_title TEXT,
  site_logo TEXT,
  site_description TEXT,
  footer_text TEXT,
  copyright_text TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  loading_emoji TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SITE TERMS (Termos e Políticas)
-- ==========================================
CREATE TABLE IF NOT EXISTS site_terms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT DEFAULT 'file-text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- WHATSAPP VIP REGISTRATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS whatsapp_vip_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_group_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES para Performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_landing_sections_layout ON landing_sections(layout_id);
CREATE INDEX IF NOT EXISTS idx_landing_sections_order ON landing_sections(order_position);
CREATE INDEX IF NOT EXISTS idx_combos_active ON product_combos(is_active);
CREATE INDEX IF NOT EXISTS idx_combos_featured ON product_combos(is_featured);
CREATE INDEX IF NOT EXISTS idx_combos_seasonal ON product_combos(seasonal_layout_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_combo ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_product ON combo_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_gifts_active ON product_gifts(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_site_terms_key ON site_terms(key);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_email ON whatsapp_vip_registrations(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_phone ON whatsapp_vip_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_created_at ON whatsapp_vip_registrations(created_at DESC);

-- ==========================================
-- RLS (Row Level Security) Policies
-- ==========================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
CREATE POLICY "Only admins can insert products" ON products FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
DROP POLICY IF EXISTS "Only admins can update products" ON products;
CREATE POLICY "Only admins can update products" ON products FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
CREATE POLICY "Only admins can delete products" ON products FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Product Colors
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product colors are viewable by everyone" ON product_colors;
CREATE POLICY "Product colors are viewable by everyone" ON product_colors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can manage product colors" ON product_colors;
CREATE POLICY "Only admins can manage product colors" ON product_colors FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Product Gifts
ALTER TABLE product_gifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Product gifts are viewable by everyone" ON product_gifts;
CREATE POLICY "Product gifts are viewable by everyone" ON product_gifts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can manage product gifts" ON product_gifts;
CREATE POLICY "Only admins can manage product gifts" ON product_gifts FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Product Combos
ALTER TABLE product_combos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Combos são visíveis para todos" ON product_combos;
CREATE POLICY "Combos são visíveis para todos" ON product_combos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Apenas editores podem gerenciar combos" ON product_combos;
CREATE POLICY "Apenas editores podem gerenciar combos" ON product_combos FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')));

-- Combo Items
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Items de combo são visíveis para todos" ON combo_items;
CREATE POLICY "Items de combo são visíveis para todos" ON combo_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Apenas editores podem gerenciar items de combo" ON combo_items;
CREATE POLICY "Apenas editores podem gerenciar items de combo" ON combo_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')));

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM orders WHERE orders.id = order_items.order_id) OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Only admins can manage coupons" ON coupons;
CREATE POLICY "Only admins can manage coupons" ON coupons FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Coupon Usage
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
CREATE POLICY "Users can view own coupon usage" ON coupon_usage FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own coupon usage" ON coupon_usage;
CREATE POLICY "Users can insert own coupon usage" ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Landing Sections
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Landing sections are viewable by everyone" ON landing_sections;
CREATE POLICY "Landing sections are viewable by everyone" ON landing_sections FOR SELECT USING (is_visible = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Only admins can manage landing sections" ON landing_sections;
CREATE POLICY "Only admins can manage landing sections" ON landing_sections FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- FAQs
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active FAQs are viewable by everyone" ON faqs;
CREATE POLICY "Active FAQs are viewable by everyone" ON faqs FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Only admins can manage FAQs" ON faqs;
CREATE POLICY "Only admins can manage FAQs" ON faqs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can update site settings" ON site_settings;
CREATE POLICY "Only admins can update site settings" ON site_settings FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "Only admins can insert site settings" ON site_settings;
CREATE POLICY "Only admins can insert site settings" ON site_settings FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Site Terms
ALTER TABLE site_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access for all users" ON site_terms;
CREATE POLICY "Allow read access for all users" ON site_terms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert for authenticated users with editor or admin role" ON site_terms;
CREATE POLICY "Allow insert for authenticated users with editor or admin role" ON site_terms FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));
DROP POLICY IF EXISTS "Allow update for authenticated users with editor or admin role" ON site_terms;
CREATE POLICY "Allow update for authenticated users with editor or admin role" ON site_terms FOR UPDATE USING (auth.role() = 'authenticated' AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin'));
DROP POLICY IF EXISTS "Allow delete for authenticated users with admin role" ON site_terms;
CREATE POLICY "Allow delete for authenticated users with admin role" ON site_terms FOR DELETE USING (auth.role() = 'authenticated' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- WhatsApp VIP Registrations
ALTER TABLE whatsapp_vip_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir inserção pública" ON whatsapp_vip_registrations;
CREATE POLICY "Permitir inserção pública" ON whatsapp_vip_registrations FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Apenas admins podem ler" ON whatsapp_vip_registrations;
CREATE POLICY "Apenas admins podem ler" ON whatsapp_vip_registrations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_seasonal_layouts_updated_at ON seasonal_layouts;
CREATE TRIGGER update_seasonal_layouts_updated_at BEFORE UPDATE ON seasonal_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_landing_sections_updated_at ON landing_sections;
CREATE TRIGGER update_landing_sections_updated_at BEFORE UPDATE ON landing_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_combos_timestamp ON product_combos;
CREATE TRIGGER update_combos_timestamp BEFORE UPDATE ON product_combos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_site_terms_updated_at ON site_terms;
CREATE TRIGGER update_site_terms_updated_at BEFORE UPDATE ON site_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar profile automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- DADOS INICIAIS
-- ==========================================

-- Inserir configurações padrão do site
INSERT INTO site_settings (key, value, description, site_name) VALUES
('general', '{}', 'Configurações gerais do site', 'Smart Time Prime')
ON CONFLICT (key) DO NOTHING;

-- Inserir layout padrão
INSERT INTO seasonal_layouts (name, slug, is_active, description) VALUES
('Layout Padrão', 'padrao', true, 'Layout padrão do site')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- FIM DO SCHEMA
-- ==========================================

