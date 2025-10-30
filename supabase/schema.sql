-- Smart Time Prime Database Schema
-- Execute este script no SQL Editor do Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PROFILES (Usuários)
-- ==========================================
CREATE TABLE profiles (
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
CREATE TABLE addresses (
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
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bling_id TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  bling_price DECIMAL(10, 2),
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
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PRODUCT COLORS (Variações de Cor)
-- ==========================================
CREATE TABLE product_colors (
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
CREATE TABLE product_gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  gift_product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- REVIEWS (Avaliações)
-- ==========================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ORDERS (Pedidos)
-- ==========================================
CREATE TABLE orders (
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
CREATE TABLE order_items (
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
-- LAYOUTS (Layouts Sazonais)
-- ==========================================
CREATE TABLE seasonal_layouts (
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
CREATE TABLE landing_sections (
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
CREATE TABLE timers (
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
CREATE TABLE faqs (
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
CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES para Performance
-- ==========================================
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_landing_sections_layout ON landing_sections(layout_id);
CREATE INDEX idx_landing_sections_order ON landing_sections(order_position);

-- ==========================================
-- RLS (Row Level Security) Policies
-- ==========================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Products (Público para leitura)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Only admins can insert products" ON products FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Only admins can update products" ON products FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Only admins can delete products" ON products FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Product Colors
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product colors are viewable by everyone" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Only admins can manage product colors" ON product_colors FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Landing Sections (Público para leitura)
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landing sections are viewable by everyone" ON landing_sections FOR SELECT USING (is_visible = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Only admins can manage landing sections" ON landing_sections FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

-- FAQs (Público para leitura)
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active FAQs are viewable by everyone" ON faqs FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
CREATE POLICY "Only admins can manage FAQs" ON faqs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));

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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasonal_layouts_updated_at BEFORE UPDATE ON seasonal_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_landing_sections_updated_at BEFORE UPDATE ON landing_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- DADOS INICIAIS
-- ==========================================

-- Inserir configurações padrão do site
INSERT INTO site_settings (key, value, description) VALUES
('site_name', '"Smart Time Prime"', 'Nome do site'),
('primary_color', '"#000000"', 'Cor primária'),
('secondary_color', '"#ffffff"', 'Cor secundária'),
('accent_color', '"#FFD700"', 'Cor de destaque'),
('frete_uberlandia', '15.00', 'Valor do frete para Uberlândia'),
('cep_uberlandia', '"38400"', 'Prefixo CEP de Uberlândia'),
('whatsapp_number', '""', 'Número do WhatsApp'),
('email_contact', '""', 'Email de contato'),
('instagram_url', '""', 'URL do Instagram'),
('facebook_url', '""', 'URL do Facebook');

-- Inserir layout padrão
INSERT INTO seasonal_layouts (name, slug, is_active, description) VALUES
('Layout Padrão', 'padrao', true, 'Layout padrão do site');

