# 🚀 Guia de Instalação e Configuração

## Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Conta no Google Cloud Console (para OAuth)
- Conta na Hostinger (para deploy)

## 1️⃣ Instalação Local

### Passo 1: Instalar dependências

```bash
npm install
```

### Passo 2: Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais (veja seção abaixo).

### Passo 3: Rodar o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 2️⃣ Configuração do Supabase

### Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Aguarde a criação do banco de dados

### Executar Script SQL

1. Vá em **SQL Editor** no painel do Supabase
2. Copie todo o conteúdo do arquivo `supabase/schema.sql`
3. Cole e execute o script
4. Verifique se todas as tabelas foram criadas

### Configurar Storage (Buckets)

No painel do Supabase, vá em **Storage** e crie os seguintes buckets:

1. **products** (público)
   - Para imagens de produtos
   
2. **banners** (público)
   - Para banners da landing page

3. **profiles** (público)
   - Para fotos de perfil dos usuários

**Importante:** Marque todos os buckets como públicos nas configurações.

### Configurar Google OAuth

1. Vá em **Authentication** > **Providers**
2. Ative o provedor **Google**
3. Adicione as credenciais do Google Cloud Console
4. Configure a URL de callback: `https://seu-projeto.supabase.co/auth/v1/callback`

### Obter Credenciais

No painel do Supabase:
- **Settings** > **API**
- Copie:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 3️⃣ Configuração do Google OAuth

### Criar Projeto no Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure:
   - Tipo: Web application
   - Nome: Smart Time Prime
   - URIs autorizadas:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - URIs de redirecionamento:
     - `https://seu-projeto.supabase.co/auth/v1/callback`

6. Copie:
   - Client ID → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

---

## 4️⃣ Arquivo `.env.local`

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Melhor Envio (opcional)
MELHOR_ENVIO_API_KEY=sua-api-key
MELHOR_ENVIO_SANDBOX=false

# Bling (opcional)
BLING_API_KEY=sua-api-key

# Configurações do Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Smart Time Prime
NEXT_PUBLIC_FRETE_UBERLANDIA=15.00
NEXT_PUBLIC_CEP_UBERLANDIA=38400
```

---

## 5️⃣ Criar Usuário Administrador

Após a primeira autenticação com Google:

1. Vá no Supabase **Table Editor**
2. Abra a tabela `profiles`
3. Encontre seu usuário
4. Edite o campo `role` para `admin`

---

## 6️⃣ Deploy na Hostinger

### Pré-requisitos

- Plano de hospedagem com suporte a Node.js
- Acesso SSH à Hostinger

### Passo 1: Build do Projeto

```bash
npm run build
```

### Passo 2: Upload dos Arquivos

Faça upload via FTP ou SSH dos seguintes arquivos/pastas:

```
.next/
node_modules/
public/
src/
.env.local
package.json
package-lock.json
next.config.js
```

### Passo 3: Configurar Node.js na Hostinger

1. Acesse o painel da Hostinger
2. Vá em **Advanced** > **Node.js**
3. Configure:
   - Versão: 18 ou superior
   - Entry point: `node_modules/next/dist/bin/next`
   - Argumentos: `start`

### Passo 4: Instalar Dependências

No terminal SSH:

```bash
cd ~/public_html
npm install
```

### Passo 5: Iniciar Aplicação

```bash
npm run start
```

### Configurar Domínio

1. Aponte seu domínio para a Hostinger
2. Configure SSL (Let's Encrypt gratuito)
3. Atualize as URLs no `.env.local`

---

## 7️⃣ Populando o Banco de Dados

### Criar Layout Padrão

O script SQL já cria um layout padrão. Para adicionar mais:

1. Acesse `/dashboard/layouts`
2. Clique em "Novo Layout"
3. Preencha os dados e salve

### Adicionar Produtos

1. Acesse `/dashboard/produtos`
2. Clique em "Novo Produto"
3. Preencha:
   - Nome, descrição, preços
   - Dimensões (para cálculo de frete)
   - Upload de imagens
   - Variações de cor

### Criar FAQs

1. Acesse `/dashboard/faq`
2. Adicione perguntas e respostas
3. Reordene arrastando

---

## 8️⃣ Integrações Opcionais

### Melhor Envio (Cálculo de Frete)

1. Crie conta em [melhorenvio.com.br](https://melhorenvio.com.br)
2. Obtenha API Token
3. Adicione no `.env.local`
4. Implemente em `src/lib/utils/shipping.ts`

---

## 9️⃣ Testes

### Testar Autenticação

1. Acesse `/login`
2. Faça login com Google
3. Verifique se o perfil foi criado no Supabase

### Testar Carrinho

1. Adicione produtos ao carrinho
2. Verifique persistência (localStorage)
3. Teste remoção e atualização de quantidade

### Testar Checkout

1. Adicione produtos ao carrinho
2. Vá para `/checkout`
3. Preencha endereço
4. Teste cálculo de frete

### Testar Dashboard

1. Defina seu usuário como `admin`
2. Acesse `/dashboard`
3. Teste criação de produtos, FAQs e layouts

---

## 🔧 Troubleshooting

### Erro de CORS no Supabase

Adicione seu domínio nas configurações:
- Supabase > **Settings** > **API** > **URL Configuration**

### Google OAuth não funciona

Verifique:
- URLs de redirecionamento corretas
- Credenciais no `.env.local`
- Callback URL do Supabase configurada no Google

### Imagens não carregam

Verifique:
- Buckets criados no Supabase Storage
- Buckets marcados como públicos
- URLs das imagens corretas

### Frete não calcula

Verifique:
- API do Melhor Envio configurada
- Dimensões dos produtos cadastradas
- CEP válido

---

## 📚 Recursos Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação
2. Revise os logs (browser console e servidor)
3. Verifique variáveis de ambiente
4. Teste em ambiente local primeiro

---

## ✅ Checklist de Deploy

- [ ] Supabase configurado
- [ ] Banco de dados criado (schema.sql)
- [ ] Buckets de storage criados
- [ ] Google OAuth configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Build realizado com sucesso
- [ ] Deploy na Hostinger concluído
- [ ] Domínio apontado e SSL ativo
- [ ] Usuário admin criado
- [ ] Produtos cadastrados
- [ ] FAQs adicionadas
- [ ] Layout testado em mobile
- [ ] Performance verificada

🎉 **Parabéns! Seu e-commerce está no ar!**

