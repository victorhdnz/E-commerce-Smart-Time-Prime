# ⚡ Quick Start - Smart Time Prime

Inicie o projeto em **5 minutos**!

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase (gratuita)

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o script:
   ```sql
   # Cole todo o conteúdo de supabase/schema.sql
   ```
4. Vá em **Storage** e crie 3 buckets públicos:
   - `products`
   - `banners`
   - `profiles`

### 3. Configurar Google OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto
3. Vá em **APIs & Services** > **Credentials**
4. Crie **OAuth 2.0 Client ID**
5. Adicione callback URL: `https://seu-projeto.supabase.co/auth/v1/callback`

### 4. Variáveis de Ambiente

Copie e configure:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### 5. Rodar Projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

### 6. Criar Usuário Admin

1. Faça login com Google
2. No Supabase, vá em **Table Editor** > `profiles`
3. Encontre seu usuário
4. Altere `role` para `admin`

### 7. Acessar Dashboard

Acesse: **http://localhost:3000/dashboard**

---

## ✅ Checklist de Validação

- [ ] Projeto rodando em localhost:3000
- [ ] Login com Google funcionando
- [ ] Perfil criado no Supabase
- [ ] Role alterado para admin
- [ ] Dashboard acessível
- [ ] Buckets de storage criados

---

## 🎯 Próximos Passos

1. **Adicionar Produtos**
   - Vá em `/dashboard/produtos`
   - Clique em "Novo Produto"
   - Preencha dados e faça upload de imagens

2. **Configurar FAQ**
   - Vá em `/dashboard/faq`
   - Adicione perguntas e respostas

3. **Criar Layouts Sazonais**
   - Vá em `/dashboard/layouts`
   - Crie temas para Black Friday, Natal, etc.

4. **Personalizar Landing Page**
   - Vá em `/dashboard/landing`
   - Edite seções, banners e textos

---

## 📚 Documentação Completa

- [SETUP.md](SETUP.md) - Guia completo de instalação
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guia de deploy
- [FEATURES.md](FEATURES.md) - Lista de funcionalidades
- [README.md](README.md) - Visão geral do projeto

---

## 🆘 Problemas Comuns

### Erro: "Module not found"
```bash
rm -rf node_modules
npm install
```

### Google OAuth não funciona
- Verifique URLs de callback
- Confirme credenciais no `.env.local`

### Imagens não carregam
- Verifique se os buckets foram criados
- Confirme se estão marcados como públicos

---

## 💬 Suporte

Dúvidas? Revise a documentação ou verifique:

1. Console do navegador (F12)
2. Terminal onde rodou `npm run dev`
3. Logs do Supabase

---

🎉 **Pronto! Seu e-commerce está rodando!**

