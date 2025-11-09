# 🌐 Atualizar para Domínio Personalizado

## ✅ O que já está pronto

O código já está preparado para usar o domínio personalizado através da variável de ambiente `NEXT_PUBLIC_SITE_URL`. Todas as URLs são geradas dinamicamente usando a função `getSiteUrl()`.

## 📋 Passo a Passo Completo

### 1. Configurar Variável de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto "E-commerce Smart Time Prime"
3. Vá em **Settings** > **Environment Variables**
4. Procure por `NEXT_PUBLIC_SITE_URL`
5. Se existir, edite para seu domínio personalizado: `https://www.smarttimeprime.com.br`
6. Se não existir, adicione:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://www.smarttimeprime.com.br`
   - **Environment**: Production (e Preview se quiser)
7. Salve e faça um novo deploy

### 2. Atualizar Configurações no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** > **URL Configuration**

#### **Site URL:**
```
https://www.smarttimeprime.com.br
```

#### **Redirect URLs:**
Adicione TODAS essas URLs:
```
https://www.smarttimeprime.com.br/**
https://www.smarttimeprime.com.br/auth/callback
http://localhost:3000/** (para desenvolvimento local)
http://localhost:3000/auth/callback
```

4. Salve as configurações

### 4. Atualizar .env.local (OBRIGATÓRIO para desenvolvimento local)

**⚠️ IMPORTANTE**: Você precisa atualizar o `.env.local` também para que tudo funcione corretamente em desenvolvimento local!

1. Abra o arquivo `.env.local` na raiz do projeto
2. Atualize ou adicione as seguintes variáveis:

```env
# URL do site (OBRIGATÓRIO - atualizar para domínio personalizado)
NEXT_PUBLIC_SITE_URL=https://www.smarttimeprime.com.br
```

3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento (`npm run dev`)

**📌 Nota**: 
- O `.env.local` é para **desenvolvimento local** apenas
- Na **Vercel**, configure essas variáveis em **Settings > Environment Variables**
- Ambos devem ter os mesmos valores para consistência

**📄 Veja mais detalhes**: Consulte o arquivo `ATUALIZAR_ENV_LOCAL.md` para instruções completas.

### 5. Verificar se Funcionou

Após fazer o deploy:

1. **Teste Login Google:**
   - Faça logout
   - Faça login novamente
   - Deve funcionar corretamente

3. **Verifique no console do navegador:**
   - Não deve haver erros de CORS
   - Cookies devem ter o domínio personalizado

## ✅ Resumo

| Onde Atualizar | O que Atualizar | Status |
|----------------|-----------------|--------|
| **Vercel** | `NEXT_PUBLIC_SITE_URL` no Environment Variables | ✅ **OBRIGATÓRIO** |
| **Supabase - Site URL** | Site URL | ✅ **OBRIGATÓRIO** |
| **Supabase - Redirect URLs** | Todas as URLs de redirecionamento | ✅ **OBRIGATÓRIO** |
| **.env.local** | `NEXT_PUBLIC_SITE_URL` | ✅ **OBRIGATÓRIO** (para desenvolvimento) |
| **Código** | Já está pronto (usa `getSiteUrl()`) | ✅ **PRONTO** |

## 🔍 Como Verificar

Execute este comando no console do navegador após fazer login:

```javascript
console.log('Site URL:', window.location.origin)
```

Deve mostrar seu domínio personalizado, não `e-commerce-smart-time-prime-ef8c.vercel.app`.

## ⚠️ Importante

- **Não precisa alterar o código**: O código já usa `getSiteUrl()` que lê a variável `NEXT_PUBLIC_SITE_URL`
- **Após configurar na Vercel**: Faça um novo deploy para aplicar as mudanças
- **Após configurar no Supabase**: Teste imediatamente, pode levar alguns minutos para propagar

