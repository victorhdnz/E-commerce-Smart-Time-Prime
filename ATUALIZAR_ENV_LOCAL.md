# 🔧 Atualizar .env.local para Domínio Personalizado

## 📋 Variáveis que Precisam ser Atualizadas

Atualize seu arquivo `.env.local` com as seguintes variáveis usando o domínio personalizado:

```env
# URL do site (OBRIGATÓRIO - usar domínio personalizado)
NEXT_PUBLIC_SITE_URL=https://www.smarttimeprime.com.br
```

## 📝 Como Atualizar

1. Abra o arquivo `.env.local` na raiz do projeto
2. Procure pela seguinte variável e atualize:
   - `NEXT_PUBLIC_SITE_URL` → deve ser `https://www.smarttimeprime.com.br`
3. Se essa variável não existir, adicione-a
4. Salve o arquivo

## ⚠️ Importante

- **`.env.local`** é para **desenvolvimento local** apenas
- **Vercel** usa variáveis de ambiente configuradas no dashboard (Settings > Environment Variables)
- Ambos devem ter os mesmos valores para consistência
- Nunca commite o `.env.local` no git (já está no `.gitignore`)

## ✅ Verificação

Após atualizar, você pode verificar se está funcionando:

1. **Reinicie o servidor de desenvolvimento** (`npm run dev`)
2. **Teste a função `getSiteUrl()`** no console do navegador:
   ```javascript
   // No console do navegador (após fazer login)
   console.log('Site URL:', window.location.origin)
   ```
   Deve mostrar: `https://www.smarttimeprime.com.br` (ou `http://localhost:3000` em desenvolvimento local)

## 📌 Exemplo Completo de .env.local

Seu `.env.local` deve ter algo assim (mantendo outras variáveis que você já tem):

```env
# ============================================
# Site Configuration
# ============================================
NEXT_PUBLIC_SITE_URL=https://www.smarttimeprime.com.br

# ============================================
# Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key

# ============================================
# Cloudinary
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=seu_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# ============================================
# Outras variáveis que você já tem
# ============================================
# ... suas outras variáveis
```

