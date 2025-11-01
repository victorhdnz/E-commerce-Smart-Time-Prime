-- Script para otimizar queries do Supabase
-- Este script adiciona índices para melhorar a performance das queries mais usadas

-- Índices para a tabela profiles
-- O índice na coluna id já existe por padrão (primary key), mas vamos garantir outros índices úteis
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Índices para a tabela products
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_active ON products(is_featured, is_active) WHERE is_featured = true AND is_active = true;

-- Índices para a tabela reviews
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Índices para a tabela faqs
CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_faqs_order_position ON faqs(order_position) WHERE is_active = true;

-- Índices para a tabela site_settings
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Índices para a tabela seasonal_layouts
CREATE INDEX IF NOT EXISTS idx_seasonal_layouts_is_active ON seasonal_layouts(is_active) WHERE is_active = true;

-- Índices para a tabela product_combos
CREATE INDEX IF NOT EXISTS idx_product_combos_is_featured ON product_combos(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_product_combos_is_active ON product_combos(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_combos_featured_active ON product_combos(is_featured, is_active) WHERE is_featured = true AND is_active = true;

-- Índices para a tabela orders (para dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC) WHERE status = 'completed';

-- Índices para a tabela product_colors
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON product_colors(product_id);

-- Índices para a tabela combo_items
CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_product_id ON combo_items(product_id);

-- Análise das tabelas para otimizar estatísticas
ANALYZE profiles;
ANALYZE products;
ANALYZE reviews;
ANALYZE faqs;
ANALYZE site_settings;
ANALYZE seasonal_layouts;
ANALYZE product_combos;
ANALYZE orders;
ANALYZE product_colors;
ANALYZE combo_items;

