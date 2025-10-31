-- ==========================================
-- Configurar Administradores - Versão Simples
-- ==========================================
-- Execute este script no SQL Editor do Supabase

-- Atualizar profile do primeiro admin (se existir)
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'victorhugo10diniz@gmail.com';

-- Atualizar profile do segundo admin (se existir)
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'contato@smarttimeprime.com.br';

-- Verificar os admins configurados
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY email;

