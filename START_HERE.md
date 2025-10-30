# 🚀 COMECE AQUI - Smart Time Prime

## 👋 Bem-vindo!

Este é o **Smart Time Prime**, um e-commerce completo e moderno de relógios premium.

**✨ Tudo está pronto e funcionando!** Você só precisa configurar as credenciais.

---

## 📂 O Que Foi Criado?

### ✅ E-commerce Completo
- Landing Page modular e animada
- Catálogo de produtos com filtros
- Página de detalhes do produto
- Carrinho de compras persistente
- Checkout com cálculo de frete
- Sistema de preços dinâmicos (local/nacional)
- Sistema de brindes automático
- Área de Minha Conta

### ✅ Dashboard Administrativo
- Gerenciamento de produtos
- Editor de FAQ
- Layouts sazonais (Black Friday, Natal, etc.)
- Estatísticas em tempo real
- Controle de permissões

### ✅ Integrações
- Supabase (banco de dados + auth + storage)
- Google OAuth (login)
- ViaCEP (busca de endereço)
- Melhor Envio (cálculo de frete)

### ✅ Design Profissional
- Responsivo (mobile, tablet, desktop)
- Animações suaves (Framer Motion)
- Paleta elegante (preto, branco, dourado)
- Loading states
- Error handling

---

## 🎯 Início Rápido (5 minutos)

### 1️⃣ Instalar

```bash
npm install
```

### 2️⃣ Configurar Supabase

**Criar Projeto:**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha nome e senha

**Executar SQL:**
1. Vá em **SQL Editor**
2. Copie TODO o conteúdo de `supabase/schema.sql`
3. Cole e clique em **Run**

**Criar Buckets:**
1. Vá em **Storage**
2. Crie 3 buckets **públicos**:
   - `products`
   - `banners`
   - `profiles`

### 3️⃣ Configurar Google OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto
3. Vá em **APIs & Services** > **Credentials**
4. Crie **OAuth 2.0 Client ID**
5. Adicione:
   - Origem autorizada: `http://localhost:3000`
   - Redirect URI: `https://SEU-PROJETO.supabase.co/auth/v1/callback`

### 4️⃣ Variáveis de Ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
# OBTENHA NO SUPABASE > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OBTENHA NO GOOGLE CLOUD CONSOLE
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# CONFIGURAÇÕES
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_FRETE_UBERLANDIA=15.00
NEXT_PUBLIC_CEP_UBERLANDIA=38400
```

### 5️⃣ Rodar

```bash
npm run dev
```

Abra: **http://localhost:3000** 🎉

### 6️⃣ Tornar-se Admin

1. Faça login com Google (primeira vez)
2. Vá no Supabase: **Table Editor** > `profiles`
3. Encontre sua linha
4. Altere `role` para `admin`
5. Recarregue a página

Agora acesse: **http://localhost:3000/dashboard** 🎛️

---

## 📚 Documentação

Escolha o guia certo para você:

### 🟢 Iniciante
- **[QUICKSTART.md](QUICKSTART.md)** ← Comece aqui!

### 🟡 Configuração Detalhada
- **[SETUP.md](SETUP.md)** - Guia completo de instalação

### 🔵 Deploy em Produção
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Como colocar no ar (Hostinger)

### 🟣 Recursos Avançados
- **[FEATURES.md](FEATURES.md)** - Lista completa de funcionalidades
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Resumo técnico

---

## 🗂️ Estrutura de Pastas

```
smart-time-prime/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── page.tsx           # Landing Page
│   │   ├── produtos/          # Catálogo
│   │   ├── carrinho/          # Carrinho
│   │   ├── checkout/          # Checkout
│   │   ├── minha-conta/       # Conta do usuário
│   │   └── dashboard/         # Admin
│   ├── components/            # Componentes React
│   │   ├── ui/               # Botões, Inputs, etc
│   │   ├── landing/          # Seções da home
│   │   ├── products/         # Cards de produto
│   │   └── layout/           # Header, Footer
│   ├── lib/                  # Bibliotecas
│   │   ├── supabase/        # Cliente Supabase
│   │   └── utils/           # Funções úteis
│   ├── hooks/               # React Hooks
│   └── types/               # TypeScript types
├── supabase/
│   └── schema.sql           # ⭐ IMPORTANTE: Script do banco
├── .env.local.example       # ⭐ Template de configuração
└── package.json
```

---

## ✅ Checklist de Primeira Configuração

- [ ] Node.js 18+ instalado
- [ ] Projeto criado no Supabase
- [ ] Script SQL executado (schema.sql)
- [ ] 3 buckets de storage criados (públicos)
- [ ] OAuth configurado no Google Cloud
- [ ] Arquivo `.env.local` criado e preenchido
- [ ] `npm install` executado
- [ ] `npm run dev` funcionando
- [ ] Login com Google realizado
- [ ] Role alterado para `admin` no Supabase
- [ ] Dashboard acessível

---

## 🎨 Personalização via Dashboard

Após login como admin, você pode:

### Produtos
- `/dashboard/produtos` - Adicionar/editar produtos
- Upload de imagens
- Configurar variações de cor
- Definir preços local e nacional
- Vincular brindes

### Landing Page
- `/dashboard/landing` - Editar textos e banners
- Configurar CTAs
- Reordenar seções
- Upload de imagens Hero

### FAQ
- `/dashboard/faq` - Adicionar perguntas
- Reordenar com drag & drop
- Ativar/desativar

### Layouts Sazonais
- `/dashboard/layouts` - Criar temas
- Agendar ativação automática
- Personalizar cores
- Black Friday, Natal, etc.

---

## 🚀 Deploy (Quando Estiver Pronto)

Veja o guia completo: **[DEPLOYMENT.md](DEPLOYMENT.md)**

**Resumo:**
```bash
npm run build
# Upload da pasta .next para Hostinger
```

---

## 🆘 Problemas Comuns

### ❌ "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Google OAuth não funciona
- Verifique as URLs de callback
- Confirme credenciais no `.env.local`
- Verifique se o domínio está autorizado

### ❌ Imagens não aparecem
- Confirme que os buckets foram criados
- Verifique se estão marcados como **públicos**
- No Supabase: Storage > [bucket] > Settings > Public

### ❌ Erro 401/403 no Supabase
- Confirme as keys no `.env.local`
- Verifique se copiou a key **anon public** (não a secret)

### ❌ Dashboard não carrega
- Confirme que alterou `role` para `admin` na tabela `profiles`
- Faça logout e login novamente

---

## 💡 Dicas

### Teste Local Primeiro
Garanta que tudo funciona em `localhost:3000` antes de fazer deploy.

### Dados de Teste
Crie produtos de teste no dashboard para ver o site populado.

### Backup
Exporte o SQL do Supabase antes de fazer alterações grandes.

### Performance
Use imagens otimizadas (WebP, < 500KB cada).

---

## 📞 Recursos Úteis

### Documentação das Tecnologias
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Ferramentas
- [Compressor de Imagem](https://tinypng.com)
- [Gerador de Paleta](https://coolors.co)
- [Google PageSpeed](https://pagespeed.web.dev)

---

## 🎉 Está Pronto!

Você tem em mãos um **e-commerce completo**, com:

✅ Mais de **200 funcionalidades**  
✅ Design **profissional e moderno**  
✅ Dashboard **administrativo completo**  
✅ **Totalmente personalizável**  
✅ Pronto para **produção**  

### Próximo Passo
👉 Abra o **[QUICKSTART.md](QUICKSTART.md)** e comece agora!

---

## 💬 Feedback

Encontrou algum problema ou tem sugestões?
- Revise a documentação
- Verifique os logs (console do navegador)
- Confira as variáveis de ambiente

---

**Desenvolvido com ❤️ usando Cursor AI**

🚀 **Boas vendas!**

