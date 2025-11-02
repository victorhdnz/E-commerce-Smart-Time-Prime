-- Script de Otimização para Sistema de Preço com Endereço
-- Execute este script no SQL Editor do Supabase para melhorar a performance
-- Este script é OPCIONAL, mas recomendado para melhor performance

-- ==========================================
-- ÍNDICES PARA OTIMIZAÇÃO DE CONSULTAS DE ENDEREÇO
-- ==========================================

-- Índice composto para consultas de endereço padrão do usuário
-- A consulta do useUserLocation sempre busca por user_id + is_default = true
CREATE INDEX IF NOT EXISTS idx_addresses_user_default 
ON addresses(user_id, is_default) 
WHERE is_default = true;

-- Índice adicional para consultas que filtram apenas por user_id (caso precise de todos os endereços)
CREATE INDEX IF NOT EXISTS idx_addresses_user_id 
ON addresses(user_id);

-- ==========================================
-- NOTAS:
-- ==========================================
-- 1. O índice idx_addresses_user já existe no schema.sql (linha 221)
-- 2. Este índice adicional (idx_addresses_user_default) otimiza especificamente
--    as consultas que buscam o endereço padrão do usuário
-- 3. O uso de WHERE is_default = true cria um índice parcial mais eficiente
-- 4. Este script é SEGURO para executar mesmo se os índices já existirem
--    (usa IF NOT EXISTS)

