# 🔧 Como Configurar Cookies no Supabase para Vercel

## ⚠️ Problema

O middleware não está conseguindo ler a sessão do Supabase na Vercel, mesmo com o usuário logado no cliente. Isso geralmente é causado por configuração incorreta de URLs no Supabase.

## 📋 Solução - Configurar URLs no Supabase Dashboard

### 1. Acesse o Supabase Dashboard

1. Vá para [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto "Smart Time Prime"

### 2. Configure Authentication URLs

1. No menu lateral, vá em **Authentication**
2. Clique em **URL Configuration**
3. Configure as seguintes URLs:

#### **Site URL:**
```
https://e-commerce-smart-time-prime-ef8c.vercel.app
```

#### **Redirect URLs:**
Adicione TODAS essas URLs:
```
https://e-commerce-smart-time-prime-ef8c.vercel.app/**
https://e-commerce-smart-time-prime-ef8c.vercel.app/auth/callback
http://localhost:3000/** (para desenvolvimento local)
http://localhost:3000/auth/callback
```

### 3. Salvar Configurações

Clique em **Save** para salvar as configurações.

### 4. Testar

1. Faça logout
2. Faça login novamente
3. Tente acessar o Dashboard

## 🔍 Verificar se Funcionou

Se ainda não funcionar, verifique:

1. **Cookies do navegador:**
   - Abra DevTools (F12)
   - Vá em Application > Cookies
   - Verifique se há cookies começando com `sb-` do Supabase
   - Os cookies devem ter o domínio da Vercel

2. **Variáveis de ambiente na Vercel:**
   - Verifique se `NEXT_PUBLIC_SUPABASE_URL` está configurado
   - Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurado
   - Verifique se `NEXT_PUBLIC_SITE_URL` está como `https://e-commerce-smart-time-prime-ef8c.vercel.app`

## 🐛 Se Ainda Não Funcionar

Se mesmo após configurar as URLs ainda não funcionar, pode ser necessário:

1. **Limpar cookies do navegador** e fazer login novamente
2. **Fazer deploy novamente na Vercel** para garantir que as variáveis estão atualizadas
3. **Verificar se o domínio da Vercel está correto** no `.env.local` e nas variáveis da Vercel

