-- SQL para corrigir problemas de navegação do perfil do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela profiles existe e tem a estrutura correta
DO $$
BEGIN
    -- Verificar se a coluna role existe na tabela profiles
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
    END IF;

    -- Verificar se a coluna is_active existe na tabela profiles
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- 2. Criar tabela user_profile_tabs se não existir
CREATE TABLE IF NOT EXISTS user_profile_tabs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tab_name text NOT NULL,
    tab_link text NOT NULL,
    tab_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profile_tabs_user_id ON user_profile_tabs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_tabs_active ON user_profile_tabs(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profile_tabs_order ON user_profile_tabs(tab_order);

-- 4. Configurar RLS (Row Level Security) para user_profile_tabs
ALTER TABLE user_profile_tabs ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS para user_profile_tabs
DROP POLICY IF EXISTS "Users can view their own profile tabs" ON user_profile_tabs;
CREATE POLICY "Users can view their own profile tabs" ON user_profile_tabs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile tabs" ON user_profile_tabs;
CREATE POLICY "Users can insert their own profile tabs" ON user_profile_tabs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile tabs" ON user_profile_tabs;
CREATE POLICY "Users can update their own profile tabs" ON user_profile_tabs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile tabs" ON user_profile_tabs;
CREATE POLICY "Users can delete their own profile tabs" ON user_profile_tabs
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Inserir abas padrão para todos os usuários existentes
INSERT INTO user_profile_tabs (user_id, tab_name, tab_link, tab_order, is_active)
SELECT 
    p.id,
    'Minha Conta',
    '/minha-conta',
    1,
    true
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_profile_tabs upt 
    WHERE upt.user_id = p.id AND upt.tab_name = 'Minha Conta'
);

INSERT INTO user_profile_tabs (user_id, tab_name, tab_link, tab_order, is_active)
SELECT 
    p.id,
    'Meus Pedidos',
    '/minha-conta/pedidos',
    2,
    true
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM user_profile_tabs upt 
    WHERE upt.user_id = p.id AND upt.tab_name = 'Meus Pedidos'
);

-- 7. Inserir aba Dashboard apenas para admins e editores
INSERT INTO user_profile_tabs (user_id, tab_name, tab_link, tab_order, is_active)
SELECT 
    p.id,
    'Dashboard',
    '/dashboard',
    3,
    true
FROM profiles p
WHERE p.role IN ('admin', 'editor')
AND NOT EXISTS (
    SELECT 1 FROM user_profile_tabs upt 
    WHERE upt.user_id = p.id AND upt.tab_name = 'Dashboard'
);

-- 8. Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_user_profile_tabs_updated_at ON user_profile_tabs;
CREATE TRIGGER update_user_profile_tabs_updated_at
    BEFORE UPDATE ON user_profile_tabs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Criar função para inserir abas padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_profile_tabs()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir aba Minha Conta
    INSERT INTO user_profile_tabs (user_id, tab_name, tab_link, tab_order, is_active)
    VALUES (NEW.id, 'Minha Conta', '/minha-conta', 1, true);
    
    -- Inserir aba Meus Pedidos
    INSERT INTO user_profile_tabs (user_id, tab_name, tab_link, tab_order, is_active)
    VALUES (NEW.id, 'Meus Pedidos', '/minha-conta/pedidos', 2, true);
    
    -- Inserir aba Dashboard se for admin ou editor
    IF NEW.role IN ('admin', 'editor') THEN
        INSERT INTO user_profile_tabs (user_id, tab_name, tab_link, tab_order, is_active)
        VALUES (NEW.id, 'Dashboard', '/dashboard', 3, true);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar trigger para inserir abas padrão para novos perfis
DROP TRIGGER IF EXISTS create_profile_tabs_on_insert ON profiles;
CREATE TRIGGER create_profile_tabs_on_insert
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_profile_tabs();

-- 12. Verificar se todas as políticas RLS estão ativas para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 13. Garantir que as políticas básicas do profiles existem
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 14. Criar view para facilitar consulta das abas do usuário
CREATE OR REPLACE VIEW user_navigation_tabs AS
SELECT 
    upt.id,
    upt.user_id,
    upt.tab_name,
    upt.tab_link,
    upt.tab_order,
    upt.is_active,
    p.role as user_role,
    p.full_name,
    p.email
FROM user_profile_tabs upt
JOIN profiles p ON p.id = upt.user_id
WHERE upt.is_active = true
ORDER BY upt.tab_order;

-- 15. Conceder permissões na view
GRANT SELECT ON user_navigation_tabs TO authenticated;

-- Finalização
SELECT 'Script executado com sucesso! Estrutura do banco de dados corrigida.' as status;