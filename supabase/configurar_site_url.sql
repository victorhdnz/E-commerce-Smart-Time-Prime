-- ==========================================
-- Verificar e Configurar Site URL no Supabase
-- ==========================================
-- Execute este script no SQL Editor do Supabase
-- Isso garante que os cookies funcionem corretamente na Vercel

-- Verificar configurações de Auth no Supabase Dashboard:
-- 1. Vá em Authentication > URL Configuration
-- 2. Adicione sua URL da Vercel como Site URL:
--    https://e-commerce-smart-time-prime-ef8c.vercel.app
-- 3. Adicione também como Redirect URL:
--    https://e-commerce-smart-time-prime-ef8c.vercel.app/**
--    https://e-commerce-smart-time-prime-ef8c.vercel.app/auth/callback

-- Este script apenas mostra informações - a configuração é feita no Dashboard

SELECT 
    'Configure no Dashboard: Authentication > URL Configuration' as instrucao,
    'Site URL: https://e-commerce-smart-time-prime-ef8c.vercel.app' as site_url,
    'Redirect URLs: https://e-commerce-smart-time-prime-ef8c.vercel.app/**' as redirect_urls;

