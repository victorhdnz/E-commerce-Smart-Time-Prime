# 📱 Configurar Link do Grupo VIP do WhatsApp

## ✅ Link do Grupo

O link do grupo VIP do WhatsApp é:
```
https://chat.whatsapp.com/EVPNbUpwsjW7FMlerVRDqo?mode=wwt
```

## 📋 Como Configurar

### Opção 1: Via Dashboard (Recomendado)

1. Acesse: `/dashboard/whatsapp-vip`
2. Clique em **"Adicionar Link"** ou **"Editar Link"**
3. Cole o link: `https://chat.whatsapp.com/EVPNbUpwsjW7FMlerVRDqo?mode=wwt`
4. Clique em **OK**
5. Pronto! O link será salvo automaticamente

### Opção 2: Via SQL (Direto no Supabase)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o script: `supabase/insert_whatsapp_vip_link.sql`

Ou execute diretamente:

```sql
INSERT INTO site_settings (key, value, description, updated_at)
VALUES (
  'whatsapp_vip_group_link',
  'https://chat.whatsapp.com/EVPNbUpwsjW7FMlerVRDqo?mode=wwt',
  'Link do Grupo VIP do WhatsApp',
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();
```

## ✅ Como Funciona

1. **Usuário preenche o formulário** na página inicial (nome, e-mail, telefone)
2. **Botão aparece automaticamente** quando todos os campos estão preenchidos
3. **Usuário clica em "Entrar no Grupo VIP do WhatsApp"**
4. **Redireciona para o grupo** no WhatsApp
5. **Usuário também pode clicar em "Cadastrar"** para salvar os dados no banco

## 🔍 Verificar se Funcionou

1. Acesse a página inicial (`/`)
2. Role até a seção "Entre para o Grupo VIP do WhatsApp"
3. Preencha os campos: Nome, E-mail e Telefone
4. O botão **"Entrar no Grupo VIP do WhatsApp"** deve aparecer automaticamente
5. Clique no botão e verifique se abre o grupo no WhatsApp

