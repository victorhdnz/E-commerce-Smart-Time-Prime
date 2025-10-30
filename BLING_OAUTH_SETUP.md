# Configuração OAuth 2.0 do Bling

## 📋 Passo a Passo Completo

### 1. Configurar Redirect URI no Bling Developer Portal

1. Acesse: https://developer.bling.com.br/
2. Faça login com sua conta Bling
3. Vá em **"Minhas Aplicações"** ou **"OAuth Apps"**
4. Encontre seu app ou crie um novo
5. Adicione o Redirect URI (formato esperado pelo Bling):
   ```
   http://localhost:3000/oauth/bling/callback
   ```
   (Para produção, use: `https://seudominio.com/oauth/bling/callback`)

### 2. Variáveis de Ambiente

Adicione no arquivo `.env.local`:

```env
# Credenciais OAuth do Bling (você já tem essas)
BLING_CLIENT_ID=405e0fa8e3996b81f9e14d9b00521c548cbde104
BLING_CLIENT_SECRET=ec5f42e35eec0721fb8fc2b1cc54af374fb1491cab35d3a76259e1923ffc

# URL de redirecionamento (formato esperado pelo Bling: /oauth/bling/callback)
BLING_REDIRECT_URI=http://localhost:3000/oauth/bling/callback

# URL do site (para produção)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Conectar Bling no Dashboard

1. Acesse: `/dashboard/configuracoes`
2. Role até a seção **"Integração Bling"**
3. Clique em **"Conectar Bling"**
4. Você será redirecionado para o Bling
5. **Autorize o acesso** (clique em "Authorize" no modal)
6. Você será redirecionado de volta e verá "✓ Conectado"

### 4. Como Funciona

O fluxo OAuth funciona assim:

```
1. Dashboard → /api/bling/auth
   ↓
2. Redireciona para → https://bling.com.br/Api/v3/oauth/authorize
   ↓
3. Você autoriza no Bling
   ↓
4. Bling redireciona para → /api/bling/callback?code=...
   ↓
5. Nosso servidor troca código por access_token
   ↓
6. Token salvo no Supabase
   ↓
7. Dashboard mostra "Conectado" ✓
```

## 🔧 Troubleshooting

### Erro: "redirect_uri_mismatch"
- **Solução**: Verifique se o Redirect URI configurado no Bling está EXATAMENTE igual a:
  - `http://localhost:3000/oauth/bling/callback` (desenvolvimento)
  - `https://seudominio.com/oauth/bling/callback` (produção)
- **Importante**: O Bling espera o formato `/oauth/bling/callback` (não `/api/bling/callback`)

### Erro: "invalid_client"
- **Solução**: Verifique se `BLING_CLIENT_ID` e `BLING_CLIENT_SECRET` estão corretos no `.env.local`

### Erro: "Bling não autorizado"
- **Solução**: 
  1. Verifique se completou o fluxo OAuth
  2. Verifique se os tokens estão salvos em `site_settings` (key: 'bling_tokens')
  3. Tente conectar novamente

### Não está conectando
- Reinicie o servidor Next.js após adicionar variáveis
- Limpe o cache do navegador
- Verifique se está usando a URL correta (localhost vs produção)

## 🔄 Renovação Automática

Os tokens OAuth expiram após um tempo. O sistema **renova automaticamente** usando o `refresh_token` quando necessário. Você não precisa se preocupar com isso!

## 📊 Verificar Status

Após conectar, você pode verificar se está funcionando:
1. Acesse `/dashboard`
2. Os indicadores devem mostrar dados reais do Bling (se houver pedidos)
3. A seção "Atividade Recente" deve mostrar pedidos reais

## 🔐 Segurança

- Tokens são salvos no Supabase (seguro, não expõe no frontend)
- O `refresh_token` é usado automaticamente para renovar acesso
- Se precisar desconectar, remova os tokens de `site_settings` no Supabase

