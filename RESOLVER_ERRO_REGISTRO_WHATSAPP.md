# 🔧 Resolver Erro de Registro do WhatsApp VIP

## ⚠️ Erro Comum

Se você está recebendo o erro **"Erro ao registrar. Tente novamente."**, o problema mais provável é que a **tabela não foi criada** no Supabase.

## ✅ Solução Passo a Passo

### 1. Criar a Tabela no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Smart Time Prime**
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Cole o script abaixo e clique em **Run** (ou pressione `Ctrl + Enter`)

```sql
-- ==========================================
-- Criar tabela para registros WhatsApp VIP
-- ==========================================
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS whatsapp_vip_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_group_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_email ON whatsapp_vip_registrations(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_phone ON whatsapp_vip_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_created_at ON whatsapp_vip_registrations(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE whatsapp_vip_registrations ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (para permitir registro público)
DROP POLICY IF EXISTS "Permitir inserção pública" ON whatsapp_vip_registrations;
CREATE POLICY "Permitir inserção pública"
ON whatsapp_vip_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Política: Apenas admins podem ler (para visualizar no dashboard)
DROP POLICY IF EXISTS "Apenas admins podem ler" ON whatsapp_vip_registrations;
CREATE POLICY "Apenas admins podem ler"
ON whatsapp_vip_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Comentários
COMMENT ON TABLE whatsapp_vip_registrations IS 'Registros para Grupo VIP do WhatsApp';
COMMENT ON COLUMN whatsapp_vip_registrations.name IS 'Nome completo do registrado';
COMMENT ON COLUMN whatsapp_vip_registrations.email IS 'E-mail do registrado';
COMMENT ON COLUMN whatsapp_vip_registrations.phone IS 'Telefone/WhatsApp do registrado';
COMMENT ON COLUMN whatsapp_vip_registrations.whatsapp_group_link IS 'Link do grupo WhatsApp (opcional, pode ser configurado depois)';
```

### 2. Verificar se Funcionou

1. Após executar o script, você deve ver a mensagem: **"Success. No rows returned"**
2. Vá em **Table Editor** no menu lateral
3. Procure pela tabela **`whatsapp_vip_registrations`**
4. Se aparecer, a tabela foi criada com sucesso! ✅

### 3. Testar Novamente

1. Volte para o site
2. Preencha o formulário do Grupo VIP do WhatsApp
3. Clique em **"Entrar no Grupo VIP do WhatsApp"**
4. Deve funcionar agora! 🎉

## 🔍 Outros Possíveis Erros

### Erro: "Permissão negada. Verifique as políticas RLS da tabela."

**Solução:** Execute novamente as políticas RLS do script acima (as linhas que começam com `CREATE POLICY`).

### Erro: "Tabela não encontrada"

**Solução:** Certifique-se de que executou o script SQL completo acima e que a tabela foi criada.

## 📝 Arquivo SQL

O script completo está em: `supabase/create_whatsapp_vip_table.sql`

## ✅ Após Resolver

Quando funcionar, os registros aparecerão automaticamente em:
- **Dashboard**: `/dashboard/whatsapp-vip`

