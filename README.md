# 🛍️ Smart Time Prime

> E-commerce Premium de Relógios com Design Moderno e Dashboard Administrativo Completo

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Sobre o Projeto

**Smart Time Prime** é um e-commerce completo e moderno, desenvolvido com as melhores tecnologias do mercado. Oferece uma experiência de compra excepcional com design elegante, animações suaves e funcionalidades avançadas.

### 🎯 Principais Destaques

- 🎨 **Design Elegante** - Interface sofisticada em preto, branco e dourado
- ⚡ **Performance** - Next.js 14 com App Router e otimizações automáticas
- 📱 **100% Responsivo** - Funciona perfeitamente em todos os dispositivos
- 🎛️ **Dashboard Admin** - Gerenciamento completo via interface visual
- 🎭 **Layouts Sazonais** - Temas para Black Friday, Natal e outras datas
- 💰 **Preços Dinâmicos** - Preços diferentes para local e nacional
- 🎁 **Sistema de Brindes** - Brindes automáticos vinculados aos produtos
- 🔐 **Login Social** - Autenticação rápida com Google OAuth

---

## 🚀 Início Rápido

### ⚡ 5 Minutos para Rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.local.example .env.local
# Preencha as credenciais do Supabase e Google

# 3. Rodar o projeto
npm run dev

# 4. Abrir no navegador
http://localhost:3000
```

### 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| **[START_HERE.md](START_HERE.md)** | ⭐ **Comece aqui!** Guia completo de boas-vindas |
| **[QUICKSTART.md](QUICKSTART.md)** | ⚡ Configure em 5 minutos |
| **[SETUP.md](SETUP.md)** | 🔧 Instalação detalhada passo a passo |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | 🚀 Como fazer deploy na Hostinger |
| **[FEATURES.md](FEATURES.md)** | 📋 Lista completa de funcionalidades |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | 📊 Resumo técnico do projeto |

---

## 🎨 Funcionalidades Principais

### 🛍️ E-commerce Completo

- ✅ **Catálogo de Produtos** - Grid responsivo com filtros
- ✅ **Página de Detalhes** - Galeria de imagens, variações de cor
- ✅ **Carrinho Persistente** - Salva itens entre sessões
- ✅ **Checkout Inteligente** - Busca CEP, calcula frete automaticamente
- ✅ **Múltiplos Pagamentos** - Cartão, PIX com desconto

### 💎 Recursos Premium

- 🎁 **Brindes Automáticos** - Produtos ganham brindes configuráveis
- 💰 **Preços Dinâmicos** - Uberlândia tem preço local, outros nacional
- 🔒 **Login para Ver Preço** - Preços revelados apenas após autenticação
- ⏱️ **Cronômetros** - Contagem regressiva para ofertas
- ⭐ **Avaliações** - Sistema de reviews com 5 estrelas

### 🎛️ Dashboard Administrativo

- 📦 **Gerenciar Produtos** - CRUD completo com upload de imagens
- 🎨 **Landing Page** - Editor visual de seções (drag & drop)
- 🎭 **Layouts Sazonais** - Crie temas para datas especiais
- ❓ **FAQ Editável** - Adicione e reordene perguntas
- 📊 **Estatísticas** - Vendas, pedidos e clientes em tempo real
- ⚙️ **Configurações** - Cores, frete, SEO e mais

### 🎨 Design e UX

- ✨ **Animações Suaves** - Framer Motion em toda interface
- 🖼️ **Imagens Otimizadas** - Lazy loading e WebP automático
- 📱 **Mobile First** - Design pensado para smartphones
- ♿ **Acessibilidade** - Navegação por teclado, ARIA labels
- 🌙 **Loading States** - Feedback visual em todas ações

---

## 🛠️ Stack Tecnológica

### Frontend
```
Next.js 14      React 18      TypeScript
Tailwind CSS    Framer Motion    Lucide Icons
```

### Backend
```
Supabase (PostgreSQL + Auth + Storage)
Next.js API Routes
Row Level Security (RLS)
```

### Gerenciamento de Estado
```
Zustand (Carrinho)
React Hooks
Context API
```

### Integrações
```
Google OAuth    ViaCEP    Melhor Envio
```

---

## 📁 Estrutura do Projeto

```
smart-time-prime/
├── 📚 Documentação
│   ├── START_HERE.md          ⭐ Comece aqui
│   ├── QUICKSTART.md          5 minutos
│   ├── SETUP.md               Instalação
│   └── DEPLOYMENT.md          Deploy
│
├── 🗄️ supabase/
│   └── schema.sql             Script banco de dados
│
├── 📱 src/
│   ├── app/                   Páginas (App Router)
│   │   ├── page.tsx          Landing Page
│   │   ├── produtos/         Catálogo
│   │   ├── carrinho/         Carrinho
│   │   ├── checkout/         Checkout
│   │   ├── minha-conta/      Área do cliente
│   │   └── dashboard/        Admin
│   │
│   ├── components/           Componentes
│   │   ├── ui/              Botões, Inputs
│   │   ├── landing/         Seções Home
│   │   ├── products/        Cards
│   │   └── layout/          Header, Footer
│   │
│   ├── lib/                 Bibliotecas
│   │   ├── supabase/       Cliente
│   │   └── utils/          Utilitários
│   │
│   ├── hooks/              React Hooks
│   └── types/              TypeScript Types
│
└── 📄 Configuração
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── next.config.js
```

---

## 🗄️ Banco de Dados

### 13 Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários e perfis |
| `products` | Catálogo de produtos |
| `product_colors` | Variações de cor |
| `product_gifts` | Brindes vinculados |
| `addresses` | Endereços de entrega |
| `orders` | Pedidos realizados |
| `order_items` | Itens dos pedidos |
| `reviews` | Avaliações de produtos |
| `faqs` | Perguntas frequentes |
| `seasonal_layouts` | Layouts temáticos |
| `landing_sections` | Seções da home |
| `timers` | Cronômetros |
| `site_settings` | Configurações globais |

### 3 Buckets de Storage

- **products** - Imagens de produtos
- **banners** - Banners da landing page
- **profiles** - Fotos de perfil

---

## 🎯 Casos de Uso

### Para Lojistas
- Venda online com interface profissional
- Dashboard para gerenciar tudo
- Campanhas sazonais (Black Friday, Natal)
- Sem necessidade de programação

### Para Desenvolvedores
- Código limpo e bem documentado
- TypeScript para segurança de tipos
- Componentes reutilizáveis
- Fácil de customizar e estender

### Para Clientes
- Experiência de compra fluida
- Login rápido com Google
- Rastreamento de pedidos
- Interface responsiva

---

## 📊 Estatísticas

- 📝 **8.500+** linhas de código
- 🧩 **20+** componentes React
- 📄 **14** páginas completas
- 🗄️ **13** tabelas no banco
- ✨ **200+** funcionalidades
- 📚 **8** arquivos de documentação

---

## ⚙️ Configuração

### 1️⃣ Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Configurações
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_FRETE_UBERLANDIA=15.00
```

### 2️⃣ Banco de Dados

```bash
# Execute no SQL Editor do Supabase
cat supabase/schema.sql
```

### 3️⃣ Storage

Crie 3 buckets **públicos**:
- products
- banners
- profiles

---

## 🚀 Deploy

### Build
```bash
npm run build
```

### Hostinger
Veja o guia completo em **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Outras Plataformas
- ✅ Vercel
- ✅ Netlify
- ✅ VPS próprio

---

## 📸 Screenshots

### Landing Page
Design moderno com hero animado, cronômetro e produtos em destaque.

### Dashboard
Interface administrativa completa para gerenciar produtos, FAQ e layouts.

### Checkout
Fluxo de compra intuitivo com cálculo automático de frete.

---

## 🤝 Contribuindo

Este é um projeto comercial. Para sugestões ou melhorias, abra uma issue.

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte

### Documentação
- [START_HERE.md](START_HERE.md) - Início
- [QUICKSTART.md](QUICKSTART.md) - Setup rápido
- [SETUP.md](SETUP.md) - Instalação completa

### Problemas Comuns
Consulte a seção de troubleshooting em [SETUP.md](SETUP.md)

---

## ✨ Créditos

Desenvolvido com ❤️ usando:
- **Cursor AI** - IDE inteligente
- **Next.js** - Framework React
- **Supabase** - Backend completo
- **Tailwind CSS** - Estilização

---

## 🎉 Comece Agora!

```bash
git clone seu-repositorio
cd smart-time-prime
npm install
cp .env.local.example .env.local
npm run dev
```

👉 Leia **[START_HERE.md](START_HERE.md)** para configuração completa!

---

**Smart Time Prime** © 2025 - Todos os direitos reservados.

