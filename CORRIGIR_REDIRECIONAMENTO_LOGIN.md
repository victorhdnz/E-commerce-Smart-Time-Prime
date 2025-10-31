# 🔧 Corrigir Redirecionamento para Domínio Antigo após Login

## ⚠️ Problema

Após fazer login com Google, está redirecionando para:
```
https://e-commerce-smart-time-prime-ef8c.vercel.app/login?error=session_exchange_failed
```

Em vez de:
```
https://www.smarttimeprime.com.br?auth=success
```

## 🔍 Causas Possíveis

1. **Variável de ambiente `NEXT_PUBLIC_SITE_URL` não atualizada na Vercel**
2. **Configuração do Supabase ainda apontando para domínio antigo**
3. **Supabase redirecionando para URL antiga**

---

## ✅ Solução Passo a Passo

### 1. Atualizar Variável de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **E-commerce Smart Time Prime**
3. Vá em **Settings** > **Environment Variables**
4. Procure por `NEXT_PUBLIC_SITE_URL`
5. Se existir, **edite** para:
   ```
   https://www.smarttimeprime.com.br
   ```
6. Se **não existir**, **adicione**:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://www.smarttimeprime.com.br`
   - **Environments**: Production, Preview, Development
7. Clique em **Save**
8. **IMPORTANTE**: Faça um novo deploy para aplicar as mudanças

---

### 2. Atualizar Configuração do Supabase

#### 2.1. Site URL

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Smart Time Prime**
3. Vá em **Authentication** > **URL Configuration**
4. Em **Site URL**, altere para:
   ```
   https://www.smarttimeprime.com.br
   ```
5. Clique em **Save**

#### 2.2. Redirect URLs

Em **Redirect URLs**, adicione **TODAS** essas URLs:

```
https://www.smarttimeprime.com.br/**
https://www.smarttimeprime.com.br/auth/callback
https://www.smarttimeprime.com.br/api/bling/callback
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/api/bling/callback
```

**⚠️ IMPORTANTE**: Mantenha também o domínio antigo temporariamente se ainda estiver em uso:
```
https://e-commerce-smart-time-prime-ef8c.vercel.app/**
https://e-commerce-smart-time-prime-ef8c.vercel.app/auth/callback
```

6. Clique em **Save**

---

### 3. Fazer Novo Deploy na Vercel

Após atualizar as variáveis de ambiente:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Deployments**
4. Clique nos **3 pontos** do último deployment
5. Selecione **Redeploy**
6. Ou faça um commit e push para trigger automático

---

### 4. Limpar Cache e Cookies

1. Abra o navegador em modo anônimo/privado
2. Ou limpe os cookies do site:
   - Chrome: DevTools (F12) > Application > Cookies > Delete All
   - Firefox: DevTools > Storage > Cookies > Clear All
3. Tente fazer login novamente

---

## 🔍 Verificar se Funcionou

### Verificação 1: Variável de Ambiente

No terminal ou via código, verifique se a variável está correta:

```bash
# No terminal (se tiver acesso SSH)
echo $NEXT_PUBLIC_SITE_URL
```

Ou adicione temporariamente no código para debug:

```typescript
// Em qualquer arquivo server-side
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
```

### Verificação 2: Testar Login

1. Acesse: `https://www.smarttimeprime.com.br/login`
2. Clique em **"Entrar com Google"**
3. Selecione sua conta
4. Deve redirecionar para: `https://www.smarttimeprime.com.br?auth=success`
5. **NÃO** deve redirecionar para o domínio antigo

---

## 🐛 Se Ainda Não Funcionar

### Problema: Ainda redireciona para domínio antigo

**Solução**: Verifique se o Supabase está configurado corretamente:

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** > **Providers** > **Google**
3. Verifique se o **Redirect URL** está como:
   ```
   https://vdznpevjomdnrocxyjjw.supabase.co/auth/v1/callback
   ```
4. Isso deve estar correto, não mexa!

### Problema: Erro `session_exchange_failed`

**Causa**: O Supabase está tentando redirecionar para uma URL não autorizada.

**Solução**: 
1. Verifique se adicionou **TODAS** as URLs de redirecionamento no Supabase (passo 2.2)
2. Verifique se a **Site URL** está correta (passo 2.1)
3. Faça logout e login novamente após atualizar

---

## 📋 Checklist Completo

- [ ] Atualizado `NEXT_PUBLIC_SITE_URL` na Vercel para `https://www.smarttimeprime.com.br`
- [ ] Feito novo deploy na Vercel
- [ ] Atualizado **Site URL** no Supabase para `https://www.smarttimeprime.com.br`
- [ ] Adicionado todas as **Redirect URLs** no Supabase
- [ ] Limpado cookies e cache do navegador
- [ ] Testado login e verificado redirecionamento para domínio novo

---

## 🔗 Referências

- Arquivo que faz redirecionamento: `src/app/auth/callback/route.ts`
- Função que determina URL: `src/lib/utils/siteUrl.ts`
- Configuração do Google OAuth: `CONFIGURAR_GOOGLE_OAUTH_URLS.md`

