# 📋 Guia Completo de Replicação do Projeto

Este documento contém todas as informações necessárias para replicar este projeto e-commerce para outras empresas.

---

## 📑 Índice

1. [Configurações Externas](#1-configurações-externas)
2. [Banco de Dados](#2-banco-de-dados)
3. [Storage (Buckets)](#3-storage-buckets)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [Configuração de Administrador](#5-configuração-de-administrador)
6. [Checkout e Pagamentos](#6-checkout-e-pagamentos)
7. [Deploy](#7-deploy)

---

## 1. Configurações Externas

### 1.1. Supabase

#### Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização (se necessário)
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: Nome do projeto (ex: "E-commerce [Nome da Empresa]")
   - **Database Password**: Senha forte (salve em local seguro)
   - **Region**: Escolha a região mais próxima dos usuários
5. Aguarde a criação do projeto (2-3 minutos)

#### Obter Credenciais
1. No painel do Supabase, vá em **Settings** > **API**
2. Copie as seguintes credenciais:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **MANTENHA SECRETO**

#### Configurar URLs de Redirecionamento
1. Vá em **Authentication** > **URL Configuration**
2. Configure:
   - **Site URL**: `https://seu-dominio.com` (produção) ou `http://localhost:3000` (dev)
   - **Redirect URLs**: Adicione todas as URLs necessárias:
     ```
     https://seu-dominio.com/**
     https://seu-dominio.com/auth/callback
     http://localhost:3000/**
     http://localhost:3000/auth/callback
     ```

---

### 1.2. Google OAuth (Autenticação)

#### Criar Projeto no Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Clique em **"Select a project"** > **"New Project"**
3. Preencha:
   - **Project name**: Nome do projeto (ex: "E-commerce [Nome da Empresa]")
   - Clique em **"Create"**

#### Habilitar Google+ API
1. No menu lateral, vá em **APIs & Services** > **Library**
2. Procure por **"Google+ API"**
3. Clique em **"Enable"**

#### Criar Credenciais OAuth 2.0
1. Vá em **APIs & Services** > **Credentials**
2. Clique em **"Create Credentials"** > **"OAuth 2.0 Client ID"**
3. Se solicitado, configure a tela de consentimento:
   - **User Type**: External
   - **App name**: Nome da empresa
   - **User support email**: Email de suporte
   - **Developer contact**: Seu email
   - Salve e continue
4. Configure o OAuth Client:
   - **Application type**: Web application
   - **Name**: E-commerce [Nome da Empresa]
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://seu-dominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://SEU-PROJETO.supabase.co/auth/v1/callback
     https://seu-dominio.com/auth/callback
     http://localhost:3000/auth/callback
     ```
5. Clique em **"Create"**
6. Copie as credenciais:
   - **Client ID** → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Client secret** → `GOOGLE_CLIENT_SECRET` ⚠️ **MANTENHA SECRETO**

#### Configurar no Supabase
1. No painel do Supabase, vá em **Authentication** > **Providers**
2. Encontre **Google** e clique para editar
3. Ative o provider
4. Cole:
   - **Client ID (for OAuth)**: O Client ID do Google
   - **Client Secret (for OAuth)**: O Client Secret do Google
5. Salve

---

### 1.3. Cloudinary (Upload de Imagens)

#### Criar Conta
1. Acesse [cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita
3. Após criar, você será redirecionado para o Dashboard

#### Obter Credenciais
1. No Dashboard, você verá:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET` ⚠️ **MANTENHA SECRETO**

#### Configurar Upload Presets (Opcional)
1. Vá em **Settings** > **Upload**
2. Em **Upload presets**, você pode criar presets personalizados
3. Para este projeto, não é necessário configurar presets

---

### 1.4. Vercel (Hospedagem)

#### Conectar Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab/Bitbucket
3. Clique em **"Add New"** > **"Project"**
4. Importe o repositório do projeto
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Configurar Variáveis de Ambiente
1. No projeto na Vercel, vá em **Settings** > **Environment Variables**
2. Adicione **TODAS** as variáveis listadas na seção [Variáveis de Ambiente](#4-variáveis-de-ambiente)
3. Configure para cada ambiente:
   - **Production**: Produção
   - **Preview**: Preview/Staging
   - **Development**: Desenvolvimento

#### Configurar Domínio Personalizado
1. Vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar DNS
4. Após configurar, atualize:
   - `NEXT_PUBLIC_SITE_URL` na Vercel
   - Site URL no Supabase
   - Redirect URLs no Google OAuth

---

### 1.5. Stripe (Pagamentos) - Estrutura Preparada

#### Criar Conta
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta (use modo Test para desenvolvimento)
3. Complete o onboarding

#### Obter Chaves de API
1. No Dashboard, vá em **Developers** > **API keys**
2. Você verá duas chaves:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` ⚠️ **MANTENHA SECRETO**

#### Configurar Webhooks (Produção)
1. Vá em **Developers** > **Webhooks**
2. Clique em **"Add endpoint"**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/stripe/webhook`
   - **Events to send**: Selecione:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `checkout.session.completed`
4. Copie o **Signing secret** → `STRIPE_WEBHOOK_SECRET`

#### Modo Test vs Live
- **Test Mode**: Use durante desenvolvimento (chaves começam com `pk_test_` e `sk_test_`)
- **Live Mode**: Use em produção (chaves começam com `pk_live_` e `sk_live_`)
- ⚠️ Configure variáveis diferentes para cada ambiente

---

## 2. Banco de Dados

### 2.1. Executar SQL Completo

1. No Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Copie **TODO** o conteúdo do arquivo `supabase/schema_completo.sql`
4. Cole no editor
5. Clique em **"Run"** (ou `Ctrl/Cmd + Enter`)
6. Aguarde a execução (pode levar alguns minutos)
7. Verifique se todas as tabelas foram criadas em **Table Editor**

**⚠️ IMPORTANTE**: O arquivo `schema_completo.sql` já está limpo e não contém referências ao Bling ou outras integrações não utilizadas.

### 2.2. Estrutura do Banco

O banco de dados contém as seguintes tabelas:

- **profiles**: Usuários e perfis
- **addresses**: Endereços de entrega
- **products**: Catálogo de produtos
- **product_colors**: Variações de cor dos produtos
- **product_gifts**: Brindes vinculados aos produtos
- **product_combos**: Combos de produtos
- **reviews**: Avaliações de produtos
- **orders**: Pedidos realizados
- **order_items**: Itens dos pedidos
- **coupons**: Cupons de desconto
- **favorites**: Produtos favoritos dos usuários
- **faqs**: Perguntas frequentes
- **seasonal_layouts**: Layouts sazonais (Black Friday, etc.)
- **landing_sections**: Seções da landing page
- **timers**: Cronômetros para promoções
- **site_settings**: Configurações globais do site
- **site_terms**: Termos de uso e políticas
- **whatsapp_vip_registrations**: Cadastros para grupo VIP do WhatsApp
- **coupons**: Cupons de desconto
- **coupon_usage**: Rastreamento de uso de cupons
- **favorites**: Produtos favoritos dos usuários
- **site_terms**: Termos de uso e políticas

### 2.3. Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas de segurança:
- Usuários só veem seus próprios dados
- Produtos são públicos para leitura
- Apenas admins/editores podem modificar produtos
- Pedidos são privados por usuário

---

## 3. Storage (Buckets)

### 3.1. Criar Buckets

No Supabase, vá em **Storage** e crie os seguintes buckets:

#### Bucket: `products`
- **Name**: `products`
- **Public bucket**: ✅ **SIM** (marcar como público)
- **File size limit**: 10 MB (ou conforme necessário)
- **Allowed MIME types**: `image/*`

#### Bucket: `banners`
- **Name**: `banners`
- **Public bucket**: ✅ **SIM**
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/*`

#### Bucket: `profiles`
- **Name**: `profiles`
- **Public bucket**: ✅ **SIM**
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/*`

### 3.2. Configurar Políticas RLS

Execute o arquivo `supabase/setup_storage_policies.sql` no SQL Editor do Supabase.

Isso configurará:
- Admins/editores podem fazer upload em `products` e `banners`
- Todos podem ver imagens (buckets públicos)
- Usuários podem fazer upload apenas de seu próprio avatar em `profiles`

---

## 4. Variáveis de Ambiente

### 4.1. Arquivo `.env.local` (Desenvolvimento)

Crie o arquivo `.env.local` na raiz do projeto:

```env
# ============================================
# Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# ============================================
# Google OAuth
# ============================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui

# ============================================
# Cloudinary
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret

# ============================================
# Stripe (Pagamentos)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (apenas em produção)

# ============================================
# Configurações do Site
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Nome da Empresa
```

### 4.2. Variáveis na Vercel (Produção)

Configure as mesmas variáveis no Vercel, mas com valores de produção:

```env
# URLs de produção
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com

# Stripe em modo Live (se estiver em produção)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### 4.3. Variáveis Opcionais

Estas variáveis podem ser configuradas no banco de dados (`site_settings`) ou como variáveis de ambiente:

```env
# Frete (pode ser configurado no dashboard)
NEXT_PUBLIC_FRETE_UBERLANDIA=15.00
NEXT_PUBLIC_CEP_UBERLANDIA=38400

# Melhor Envio (se usar cálculo de frete)
MELHOR_ENVIO_API_KEY=sua-api-key
MELHOR_ENVIO_SANDBOX=false
```

---

## 5. Configuração de Administrador

### 5.1. Método 1: Via SQL (Recomendado)

Após criar o primeiro usuário fazendo login com Google:

1. No Supabase, vá em **SQL Editor**
2. Execute o seguinte SQL (substitua `email@exemplo.com` pelo email do administrador):

```sql
-- Tornar usuário admin por email
UPDATE profiles
SET role = 'admin'
WHERE email = 'email@exemplo.com';
```

### 5.2. Método 2: Via Table Editor

1. No Supabase, vá em **Table Editor** > **profiles**
2. Encontre o usuário pelo email
3. Edite o campo `role` para `admin`
4. Salve

### 5.3. Método 3: Múltiplos Administradores

Para configurar múltiplos administradores de uma vez:

```sql
-- Tornar múltiplos usuários admin
UPDATE profiles
SET role = 'admin'
WHERE email IN (
  'admin1@exemplo.com',
  'admin2@exemplo.com',
  'admin3@exemplo.com'
);
```

### 5.4. Método 4: Configurar Administradores Antes do Primeiro Login

Se você quiser configurar administradores antes mesmo de fazer login, você pode criar os usuários diretamente no Supabase e depois atualizar o role:

1. No Supabase, vá em **Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha o email e senha (ou use "Auto-generate password")
4. Após criar, execute o SQL do Método 1 ou 2 para tornar admin

**⚠️ Nota**: O usuário precisará fazer login pelo menos uma vez para que o perfil seja criado automaticamente na tabela `profiles`.

### 5.4. Verificar Permissões

Após configurar, faça logout e login novamente. Você deve ter acesso ao dashboard em `/dashboard`.

---

## 6. Checkout e Pagamentos

### 6.1. Estrutura Preparada

O projeto já tem a estrutura do Stripe preparada. Você só precisa:

1. Adicionar as chaves do Stripe no `.env.local` e na Vercel
2. Configurar os webhooks (seção 1.5)
3. Testar o fluxo de pagamento

### 6.2. Arquivos de Checkout

Os seguintes arquivos já estão preparados:

- `src/app/checkout/page.tsx` - Página de checkout
- `src/app/api/stripe/checkout/route.ts` - API de criação de sessão
- `src/app/api/stripe/webhook/route.ts` - Webhook do Stripe (estrutura pronta)

### 6.3. Configurar Webhook Local (Desenvolvimento)

Para testar webhooks localmente:

1. Instale o Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) ou baixe em [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Autentique: `stripe login`
3. Execute: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copie o `webhook signing secret` e adicione ao `.env.local` como `STRIPE_WEBHOOK_SECRET`

---

## 7. Deploy

### 7.1. Deploy na Vercel

1. Conecte o repositório (seção 1.4)
2. Configure todas as variáveis de ambiente
3. Clique em **"Deploy"**
4. Aguarde o build completar
5. Acesse a URL fornecida

### 7.2. Configurar Domínio Personalizado

1. Na Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções
4. Aguarde a propagação (pode levar até 24h)
5. Atualize:
   - `NEXT_PUBLIC_SITE_URL` na Vercel
   - Site URL no Supabase
   - Redirect URLs no Google OAuth

### 7.3. Verificações Pós-Deploy

- [ ] Login com Google funciona
- [ ] Upload de imagens funciona (Cloudinary)
- [ ] Checkout redireciona para Stripe
- [ ] Webhooks do Stripe estão funcionando
- [ ] Todas as páginas carregam corretamente
- [ ] Dashboard está acessível apenas para admins

---

## 📝 Checklist Final

Antes de considerar o projeto replicado:

- [ ] Supabase configurado e SQL executado
- [ ] Buckets criados e políticas configuradas
- [ ] Google OAuth configurado e testado
- [ ] Cloudinary configurado
- [ ] Stripe configurado (chaves adicionadas)
- [ ] Variáveis de ambiente configuradas (local e Vercel)
- [ ] Administrador configurado
- [ ] Deploy realizado na Vercel
- [ ] Domínio personalizado configurado
- [ ] Testes básicos realizados

---

## 🆘 Troubleshooting

### Erro: "Invalid API key" (Supabase)
- Verifique se copiou as chaves corretas
- Certifique-se de usar `NEXT_PUBLIC_` para chaves públicas

### Erro: "Redirect URI mismatch" (Google)
- Verifique se todas as URLs estão configuradas no Google Cloud Console
- Certifique-se de que a URL do Supabase está correta

### Erro: "Unauthorized" no Dashboard
- Verifique se o usuário tem `role = 'admin'` na tabela `profiles`
- Faça logout e login novamente

### Imagens não carregam
- Verifique se os buckets estão marcados como públicos
- Verifique as políticas RLS dos buckets
- Verifique as credenciais do Cloudinary

---

## 📚 Documentação Adicional

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Stripe](https://stripe.com/docs)
- [Documentação do Cloudinary](https://cloudinary.com/documentation)

---

**Última atualização**: 2025

