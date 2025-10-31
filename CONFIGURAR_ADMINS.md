# Como Configurar Administradores no Supabase

## 📋 Passo a Passo

### 1. Abrir o SQL Editor no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** no menu lateral
3. Clique em **New Query**

### 2. Executar o Script

Copie e cole o conteúdo do arquivo `supabase/configurar_admins.sql` no editor e execute.

### 3. Verificar

Após executar, você verá uma mensagem de sucesso para cada email configurado e uma lista dos admins.

## 🔐 Emails Admin Configurados

- `victorhugo10diniz@gmail.com`
- `contato@smarttimeprime.com.br`

## ⚠️ Importante

- Os usuários precisam ter feito login pelo menos uma vez (estar na tabela `auth.users`)
- Se um usuário ainda não existe no `auth.users`, será exibida uma mensagem de aviso
- Após fazer login pela primeira vez, execute o script novamente para configurar como admin

## 🔄 Atualizar um Admin

Se você precisar adicionar ou remover um admin:

1. Edite a lista de emails no arquivo `src/lib/utils/admin.ts`
2. Execute o script SQL novamente para sincronizar com o banco

