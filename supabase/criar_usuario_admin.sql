-- ==========================================
-- CRIAR USUÁRIO ADMIN COM EMAIL/SENHA
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- OPÇÃO 1: Se o usuário já existe (criado via Google), deletar e recriar
-- Primeiro, encontre e delete o usuário antigo (se existir)
DELETE FROM auth.users WHERE email = 'contato@smarttimeprime.com.br';

-- OPÇÃO 2: Criar novo usuário via Supabase Dashboard
-- 1. Vá em Authentication → Users → Add user → Create new user
-- 2. Email: contato@smarttimeprime.com.br
-- 3. Password: SmartTime@2024!Prime
-- 4. Marque "Auto Confirm User"
-- 5. Clique em "Create user"

-- Após criar o usuário no Dashboard, execute este SQL para definir como admin:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'contato@smarttimeprime.com.br';

-- Se o profile não existir, criar manualmente:
-- (Substitua 'UUID_DO_USUARIO' pelo ID do usuário criado)
/*
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
  'UUID_DO_USUARIO',
  'contato@smarttimeprime.com.br',
  'admin',
  'Administrador',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
*/

-- Verificar se funcionou:
SELECT id, email, role FROM profiles WHERE email = 'contato@smarttimeprime.com.br';

