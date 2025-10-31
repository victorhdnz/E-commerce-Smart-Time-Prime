# 🔔 Configuração de WebHooks do Bling

## 📋 Visão Geral

Os webhooks do Bling permitem sincronização automática em tempo real de produtos, pedidos e estoque entre o Bling e o site.

## 🚀 Como Configurar

### 1. Obter URL do Webhook

A URL do webhook é:
```
https://seu-dominio.com/api/webhooks/bling
```

**Exemplo (conforme seu `.env.local`):**
- Vercel: `https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook`
- Produção: `https://smarttimeprime.com.br/api/bling/webhook` (quando tiver domínio próprio)
- Desenvolvimento: `http://localhost:3000/api/bling/webhook` (apenas para teste local)

⚠️ **IMPORTANTE:** 
- Use a URL completa do seu domínio hospedado (Vercel/Produção), não localhost!
- Seu `.env.local` já tem a URL correta: `BLING_WEBHOOK_URL=https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook`

### 2. Configurar no Bling

1. Acesse o painel do Bling: https://www.bling.com.br/home
2. Vá em **Configurações** > **Integrações** > **WebHooks**
3. Clique em **Adicionar WebHook**
4. Configure:
   - **URL**: Cole a URL do webhook acima
   - **Eventos**:
     - ✅ `produto.criado`
     - ✅ `produto.alterado`
     - ✅ `produto.excluido`
     - ✅ `pedidoVenda.criado`
     - ✅ `pedidoVenda.alterado`
     - ✅ `pedidoVenda.excluido`
     - ✅ `estoqueProduto.alterado`

### 3. Variáveis de Ambiente no `.env.local`

As variáveis necessárias para o funcionamento do webhook:

```env
# Bling API Configuration (já existem)
BLING_API_KEY=f094aa6b71466caaea6d9a25fe748021ea9f8248
BLING_CLIENT_ID=405e0fa8e3996b81f9e14d9b00521c548cbde104
BLING_CLIENT_SECRET=ec5f42e35eec0721fb8fc2b1cc54af374fb1491cab35d3a76259e1923ffc

# URLs de referência (não usadas no código, apenas para documentação)
BLING_REDIRECT_URI=https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/callback
BLING_WEBHOOK_URL=https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook
```

**Nota:** 
- `BLING_WEBHOOK_URL` e `BLING_REDIRECT_URI` são apenas para referência
- O código não usa essas variáveis diretamente
- Use essas URLs ao configurar no painel do Bling

### 4. (Opcional) Configurar Secret para Segurança

Para aumentar a segurança, você pode configurar um secret:

1. No arquivo `.env.local`, adicione:
```env
BLING_WEBHOOK_SECRET=seu_secret_aqui
```

2. No painel do Bling, configure o mesmo secret
3. No arquivo `src/app/api/webhooks/bling/route.ts`, descomente as linhas de verificação (linhas 27-33)

## 📥 Eventos Processados

### Produtos
- **produto.criado**: Cria novo produto no site
- **produto.alterado**: Atualiza produto existente
- **produto.excluido**: Desativa produto (não exclui)

### Pedidos
- **pedidoVenda.criado**: Registra evento (pedidos são buscados via API)
- **pedidoVenda.alterado**: Registra evento
- **pedidoVenda.excluido**: Registra evento

### Estoque
- **estoqueProduto.alterado**: Atualiza estoque do produto automaticamente

## ✅ Vantagens

- ✅ Sincronização automática em tempo real
- ✅ Não precisa executar sincronização manual
- ✅ Estoque sempre atualizado
- ✅ Novos produtos aparecem automaticamente

## 🔍 Testando

Após configurar, você pode testar:

1. Criar um produto no Bling → Deve aparecer no site automaticamente
2. Alterar estoque no Bling → Deve atualizar no site automaticamente
3. Criar um pedido no Bling → Evento será registrado

## 📝 Logs

Os logs aparecem no console do servidor (Vercel logs ou terminal local):

```
Produto 12345 criado via webhook
Estoque do produto 12345 atualizado via webhook
```

## ⚠️ Observações

- Os pedidos do Bling não são salvos no banco do site, apenas buscados via API quando necessário
- Produtos excluídos no Bling são desativados (não excluídos) no site
- A verificação de assinatura está ativa por padrão (usa `BLING_CLIENT_SECRET`)

## ❓ Pergunta Frequente

### Preciso usar Make.com ou Zapier?

**Não!** O webhook do Bling envia dados **diretamente** para o Next.js, sem necessidade de intermediários. O fluxo é:

```
Bling → Next.js → Supabase (automático)
```

Você só precisaria de Make.com se quisesse:
- Integrar com múltiplos serviços externos simultaneamente
- Processar/transformar dados antes de chegar no site
- Enviar para múltiplos destinos (ex: site + email + CRM)

Para sincronização simples Bling ↔ Site, o fluxo direto é mais rápido e confiável!

📖 Veja `COMO_FUNCIONA_WEBHOOK.md` para mais detalhes.
