# 🛍️ E-commerce Template

> Template completo e reutilizável de E-commerce com Design Moderno e Dashboard Administrativo

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Sobre o Projeto

Este é um **template completo de e-commerce** desenvolvido com as melhores tecnologias do mercado. Pode ser facilmente adaptado para qualquer tipo de negócio, oferecendo uma experiência de compra excepcional com design elegante, animações suaves e funcionalidades avançadas.

**🎯 Perfeito para:**
- Lojas de produtos físicos
- E-commerce de qualquer nicho
- Empresas que precisam de uma solução completa e personalizável
- Projetos que precisam ser replicados para múltiplos clientes

### 🎯 Principais Destaques

- 🎨 **Design Elegante** - Interface sofisticada em preto, branco e dourado
- ⚡ **Performance** - Next.js 14 com App Router e otimizações automáticas
- 📱 **100% Responsivo** - Funciona perfeitamente em todos os dispositivos
- 🎛️ **Dashboard Admin** - Gerenciamento completo via interface visual
- 🎭 **Layouts Sazonais** - Temas para Black Friday, Natal e outras datas
- 💰 **Preços Dinâmicos** - Sistema flexível de preços (local/nacional)
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

### 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md)** | 📋 **Guia completo de replicação** - Configure tudo do zero |

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
- 💰 **Preços Dinâmicos** - Sistema flexível de preços (local/nacional)
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
e-commerce-template/
├── 📚 Documentação
│   ├── README.md              Este arquivo
│   └── REPLICACAO_PROJETO.md  Guia completo de replicação
│
├── 🗄️ supabase/
│   ├── schema_completo.sql    Script completo do banco de dados
│   └── setup_storage_policies.sql  Políticas de storage
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
    ├── .env.example         Template de variáveis
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
| `product_combos` | Combos de produtos |
| `combo_items` | Itens dos combos |
| `addresses` | Endereços de entrega |
| `orders` | Pedidos realizados |
| `order_items` | Itens dos pedidos |
| `reviews` | Avaliações de produtos |
| `coupons` | Cupons de desconto |
| `coupon_usage` | Uso de cupons |
| `favorites` | Lista de desejos |
| `faqs` | Perguntas frequentes |
| `seasonal_layouts` | Layouts temáticos |
| `landing_sections` | Seções da home |
| `timers` | Cronômetros |
| `site_settings` | Configurações globais |
| `site_terms` | Termos e políticas |
| `whatsapp_vip_registrations` | Cadastros VIP |

### 3 Buckets de Storage

- **products** - Imagens de produtos
- **banners** - Banners da landing page
- **profiles** - Fotos de perfil

---

## 🎯 Casos de Uso

### Para Empresas
- Venda online com interface profissional
- Dashboard completo para gerenciar produtos, pedidos e configurações
- Campanhas sazonais (Black Friday, Natal, etc.)
- Sistema totalmente personalizável sem necessidade de programação
- Fácil replicação para múltiplos clientes/negócios

### Para Desenvolvedores
- Template limpo e bem documentado
- TypeScript para segurança de tipos
- Componentes reutilizáveis e modulares
- Fácil de customizar e estender
- Guia completo de replicação incluído
- SQL consolidado e pronto para uso

### Para Clientes Finais
- Experiência de compra fluida e intuitiva
- Login rápido com Google OAuth
- Rastreamento de pedidos
- Interface 100% responsiva

---

## 📊 Estatísticas

- 📝 **8.500+** linhas de código
- 🧩 **20+** componentes React
- 📄 **14** páginas completas
- 🗄️ **13** tabelas no banco
- ✨ **200+** funcionalidades
- 📚 Documentação completa de replicação

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
NEXT_PUBLIC_SITE_NAME=Nome da Sua Empresa
```

### 2️⃣ Banco de Dados

```bash
# Execute no SQL Editor do Supabase
# Use o arquivo: supabase/schema_completo.sql
```

📋 **Veja o guia completo**: [REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md)

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

### Plataformas Suportadas
- ✅ **Vercel** (Recomendado) - Veja guia completo em [REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md#7-deploy)
- ✅ Netlify
- ✅ VPS próprio
- ✅ Qualquer plataforma com suporte a Node.js

---

## 📸 Características Visuais

### Landing Page
Design moderno e personalizável com hero animado, cronômetro para promoções e produtos em destaque.

### Dashboard Administrativo
Interface completa para gerenciar produtos, pedidos, FAQ, layouts sazonais e todas as configurações do site.

### Checkout
Fluxo de compra intuitivo com cálculo automático de frete, múltiplas formas de pagamento e validações em tempo real.

---

## 🔄 Replicação e Personalização

Este template foi projetado para ser facilmente replicado e personalizado para diferentes empresas e negócios.

### Como Replicar
1. Siga o guia completo em **[REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md)**
2. Configure as variáveis de ambiente
3. Execute o SQL completo
4. Personalize cores, textos e imagens
5. Configure integrações (Stripe, Google OAuth, etc.)

### Personalização Rápida
- **Cores**: Configure no dashboard ou edite `tailwind.config.js`
- **Textos**: Edite via dashboard ou diretamente no banco de dados
- **Imagens**: Upload via dashboard ou Cloudinary
- **Funcionalidades**: Código modular facilita adicionar/remover features

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte

### Documentação
- [REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md) - Guia completo de configuração e replicação

### Problemas Comuns
Consulte a seção de troubleshooting em [REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md#-troubleshooting)

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Backend completo (PostgreSQL + Auth + Storage)
- **Tailwind CSS** - Estilização utilitária
- **Framer Motion** - Animações
- **Stripe** - Pagamentos (estrutura preparada)
- **Cloudinary** - Otimização de imagens

---

## 🎉 Comece Agora!

```bash
# 1. Clone o repositório
git clone seu-repositorio
cd e-commerce-template

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Execute o projeto
npm run dev
```

👉 **Leia o guia completo**: **[REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md)**

---

## 📋 Checklist de Configuração

Após clonar o projeto:

- [ ] Configurar Supabase (criar projeto e executar SQL)
- [ ] Configurar Google OAuth
- [ ] Configurar Cloudinary (opcional, para upload de imagens)
- [ ] Configurar Stripe (para pagamentos)
- [ ] Configurar variáveis de ambiente
- [ ] Criar buckets no Supabase Storage
- [ ] Configurar primeiro administrador
- [ ] Personalizar textos e imagens
- [ ] Fazer deploy

**📖 Veja detalhes de cada passo em [REPLICACAO_PROJETO.md](REPLICACAO_PROJETO.md)**

---

**E-commerce Template** - Template reutilizável para qualquer negócio

