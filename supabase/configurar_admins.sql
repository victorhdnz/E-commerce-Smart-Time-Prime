-- ==========================================
-- Configurar Administradores
-- ==========================================
-- Este script garante que os emails especificados tenham role='admin'
-- Execute no SQL Editor do Supabase

-- Lista de emails admin
DO $$
DECLARE
    admin_emails TEXT[] := ARRAY[
        'victorhugo10diniz@gmail.com',
        'contato@smarttimeprime.com.br'
    ];
    admin_email TEXT;
    user_id UUID;
BEGIN
    -- Para cada email admin, garantir que o profile existe e tem role='admin'
    FOREACH admin_email IN ARRAY admin_emails
    LOOP
        -- Buscar o user_id pelo email na tabela auth.users
        SELECT id INTO user_id
        FROM auth.users
        WHERE email = admin_email
        LIMIT 1;

        -- Se o usuário existe no auth.users
        IF user_id IS NOT NULL THEN
            -- Criar ou atualizar o profile com role='admin'
            INSERT INTO profiles (id, email, role, updated_at)
            VALUES (user_id, admin_email, 'admin', NOW())
            ON CONFLICT (id) 
            DO UPDATE SET 
                role = 'admin',
                email = admin_email,
                updated_at = NOW();
            
            RAISE NOTICE 'Profile admin configurado para: % (ID: %)', admin_email, user_id;
        ELSE
            RAISE NOTICE 'Usuário não encontrado no auth.users: %. Execute o login primeiro.', admin_email;
        END IF;
    END LOOP;
END $$;

-- Verificar os admins configurados
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE role = 'admin'
ORDER BY email;

