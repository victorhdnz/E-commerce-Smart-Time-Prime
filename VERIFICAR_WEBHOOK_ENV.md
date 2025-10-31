# ✅ Verificação das Variáveis de Ambiente para Webhook

## ✅ Status: Configuração Correta!

Baseado no seu `.env.local`, todas as variáveis necessárias estão corretas.

## 🔍 Variáveis Necessárias no `.env.local`

### ✅ Variáveis Obrigatórias (já devem estar configuradas):

```env
# Bling API Configuration
BLING_API_KEY=f094aa6b71466caaea6d9a25fe748021ea9f8248
BLING_CLIENT_ID=405e0fa8e3996b81f9e14d9b00521c548cbde104
BLING_CLIENT_SECRET=ec5f42e35eec0721fb8fc2b1cc54af374fb1491cab35d3a76259e1923ffc

# Supabase (já devem estar configuradas)
NEXT_PUBLIC_SUPABASE_URL=https://vdznpevjomdnrocxyjjw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### ✅ Variáveis de Referência (já estão no seu `.env.local`):

```env
# URLs para referência ao configurar no Bling
BLING_REDIRECT_URI=https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/callback
BLING_WEBHOOK_URL=https://e-commerce-smart-time-prime-ef8c.vercel.app/api/webhooks/bling
```

✅ **Status:** Essas variáveis já estão no seu `.env.local` e estão corretas!

⚠️ **IMPORTANTE:** 
- `BLING_WEBHOOK_URL` e `BLING_REDIRECT_URI` são apenas para **referência**
- O código do webhook **não lê essas variáveis diretamente**
- Elas são úteis apenas quando você vai configurar no painel do Bling
- A URL do webhook está correta: `https://e-commerce-smart-time-prime-ef8c.vercel.app/api/webhooks/bling`

### Variável Opcional (segurança):

```env
# Apenas se quiser verificar assinatura do webhook
BLING_WEBHOOK_SECRET=seu_secret_aqui
```

## ✅ Verificação

### 1. Variáveis do Bling API

✅ **BLING_API_KEY** - Necessária para autenticação nas APIs do Bling
✅ **BLING_CLIENT_ID** - Necessária para OAuth (fallback se API Key não funcionar)
✅ **BLING_CLIENT_SECRET** - Necessária para OAuth (fallback se API Key não funcionar)

### 2. Variáveis do Supabase

✅ **NEXT_PUBLIC_SUPABASE_URL** - Necessária para acessar o banco
✅ **SUPABASE_SERVICE_ROLE_KEY** - Necessária para o webhook acessar o banco (server-side)

### 3. URL do Webhook

✅ **Caminho correto:** `/api/bling/webhook` (conforme seu `.env.local`)
✅ **URL completa:** `https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook`

## 🔧 Como o Webhook Funciona

1. **Bling envia notificação** → `POST /api/webhooks/bling`
2. **Código processa evento** → Verifica tipo de evento (produto, pedido, estoque)
3. **Atualiza banco de dados** → Usa `SUPABASE_SERVICE_ROLE_KEY` para acessar Supabase
4. **Retorna sucesso** → `200 OK` para o Bling

## 📝 Configuração no Bling

Ao configurar no painel do Bling, use:

```
URL: https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook
```

⚠️ **ATENÇÃO:** Seu `.env.local` já tem a URL correta: `BLING_WEBHOOK_URL=https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook`

**Eventos para configurar:**
- ✅ produto.criado
- ✅ produto.alterado
- ✅ produto.excluido
- ✅ pedidoVenda.criado
- ✅ pedidoVenda.alterado
- ✅ pedidoVenda.excluido
- ✅ estoqueProduto.alterado

## ⚠️ Checklist

- [ ] `BLING_API_KEY` está no `.env.local`
- [ ] `BLING_CLIENT_ID` está no `.env.local`
- [ ] `BLING_CLIENT_SECRET` está no `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está no `.env.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
- [ ] `BLING_WEBHOOK_URL` está no `.env.local` (apenas para referência)
- [ ] URL do webhook configurada no painel do Bling
- [ ] Eventos selecionados no painel do Bling

## 🧪 Testando

1. **Crie um produto no Bling** → Deve aparecer automaticamente no site
2. **Altere estoque no Bling** → Deve atualizar no site automaticamente
3. **Crie um pedido no Bling** → Evento será registrado nos logs

Verifique os logs do servidor (Vercel logs ou terminal local) para ver as mensagens:
```
Produto 12345 criado via webhook
Estoque do produto 12345 atualizado via webhook
```

