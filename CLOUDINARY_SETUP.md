# 🌥️ Configuração do Cloudinary

## 1️⃣ Criar Arquivo .env.local

Crie um arquivo chamado `.env.local` na raiz do projeto com este conteúdo:

```env
# Supabase (mantenha as que já tem)
NEXT_PUBLIC_SUPABASE_URL=https://vdznpevjomdnrocxyjjw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkem5wZXZqb21kbnJvY3h5amp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDU1NjAsImV4cCI6MjA0NTg4MTU2MH0.9XqUq5m3CeFX2jWh4jTWZsVxOd6eOyiEwNZlcEwOj0s

# Cloudinary (ADICIONE ESTAS)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dz8r9k3qx
CLOUDINARY_API_KEY=584842725668877
CLOUDINARY_API_SECRET=IPioZcMD5ql0HERIg4Ij0YIeSC4

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 2️⃣ Onde usar

- **Dashboard → Landing**: Upload de imagens do carousel
- **Dashboard → Produtos**: Upload de imagens de produtos
- **Minha Conta**: Upload de foto de perfil

## 3️⃣ Vantagens do Cloudinary

- ✅ Mais rápido que Supabase Storage
- ✅ CDN global automático
- ✅ Otimização automática de imagens
- ✅ Transformações em tempo real
- ✅ Mais confiável

