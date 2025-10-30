-- Fix RLS policies for profiles table
-- Permite que usuários autenticados criem seus próprios profiles

-- Habilitar RLS se ainda não estiver habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Política para permitir que usuários autenticados criem seu próprio profile
-- Isso é importante quando o trigger não funciona ou quando o profile precisa ser criado manualmente
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Garantir que usuários possam ver seus próprios profiles mesmo sem serem públicos
-- (a política pública já existe, mas esta garante acesso próprio)
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT 
  USING (auth.uid() = id OR true);

-- Garantir que o trigger está criado corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING; -- Se o profile já existe, não fazer nada
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

