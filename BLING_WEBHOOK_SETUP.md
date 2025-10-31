# 🔗 Configuração do Webhook do Bling

## 📋 Visão Geral

O webhook do Bling permite que o sistema receba notificações em tempo real sobre mudanças nos produtos e pedidos, mantendo os dados sempre sincronizados.

## ⚠️ IMPORTANTE: Callback vs Webhook

**NÃO confunda as duas URLs!** Elas têm funções completamente diferentes:

| Tipo | URL | Função | Quando é Usado |
|------|-----|--------|----------------|
| **Callback** | `/api/bling/callback` | OAuth - Autorização | Durante login/configuração inicial |
| **Webhook** | `/api/bling/webhook` | Notificações automáticas | Quando algo muda no Bling |

### 🔄 Callback (OAuth)
- **Onde configurar**: Aba "Dados Básicos" → Link de Redirecionamento
- **Função**: Recebe o código de autorização após o usuário autorizar o app
- **Quando é usado**: Apenas durante o processo de autorização OAuth

### 📡 Webhook (Notificações)
- **Onde configurar**: Aba "Webhooks" → URL do Webhook
- **Função**: Recebe notificações automáticas quando algo muda no Bling
- **Quando é usado**: Sempre que um produto é criado/atualizado/excluído

## 🛠️ Configuração no Painel do Bling

### Passo 1: Acessar o Aplicativo
1. Acesse o [painel de desenvolvedores do Bling](https://developer.bling.com.br/)
2. Faça login com suas credenciais
3. Navegue até o aplicativo já cadastrado

### Passo 2: Configurar URLs (IMPORTANTE - São Diferentes!)

#### 🔄 Na Aba "Dados Básicos":
**Link de Redirecionamento** (para OAuth):
```
https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/callback
```

#### 📡 Na Aba "Webhooks":
**URL do Webhook** (para notificações automáticas):
```
https://e-commerce-smart-time-prime-ef8c.vercel.app/api/bling/webhook
```

### Passo 3: Configurar Webhook
1. Certifique-se que o aplicativo possui os escopos necessários:
   - `produtos` (para notificações de produtos)
   - `pedidos` (para notificações de pedidos)

2. Navegue até a aba **"Webhooks"**

3. Configure o servidor que receberá os eventos com a URL do webhook (não a do callback!)

### Passo 3: Selecionar Recursos
Configure os recursos que deseja receber notificações:

#### Para Produtos:
- ✅ `produto.criado` - Quando um produto é criado
- ✅ `produto.atualizado` - Quando um produto é atualizado
- ✅ `produto.excluido` - Quando um produto é excluído

#### Para Pedidos:
- ✅ `pedido.criado` - Quando um pedido é criado
- ✅ `pedido.atualizado` - Quando um pedido é atualizado

### Passo 4: Configurações Avançadas
- **Versão do Payload**: Selecione a versão mais recente
- **Autenticação**: O webhook usa HMAC SHA-256 com o `client_secret`

## 🔐 Segurança

O webhook implementa verificação de assinatura usando HMAC SHA-256:

```typescript
// Verificação automática da assinatura
const signature = request.headers.get('X-Bling-Signature-256')
const isValid = verifyWebhookSignature(payload, signature)
```

## 📦 Eventos Processados

### Produtos
- **Criação/Atualização**: Sincroniza automaticamente com o banco local
- **Exclusão**: Marca o produto como inativo (não remove do banco)

### Pedidos
- **Criação/Atualização**: Registra logs para auditoria
- Pode ser expandido para enviar emails, atualizar status, etc.

## 🧪 Teste do Webhook

Para testar se o webhook está funcionando:

1. **Criar um produto no Bling**
2. **Verificar os logs do servidor**:
   ```bash
   # Logs aparecerão no terminal do servidor
   📥 Webhook recebido: { event: 'produto.criado', data: {...} }
   ✅ Produto criado via webhook: Nome do Produto
   ```

3. **Verificar no banco de dados**:
   - O produto deve aparecer automaticamente na página de produtos
   - Não é necessário sincronização manual

## 🔧 Troubleshooting

### Webhook não está sendo chamado
1. Verifique se a URL está correta no painel do Bling
2. Confirme que o aplicativo tem os escopos necessários
3. Verifique se o token OAuth está válido

### Erro de autenticação
1. Confirme que `BLING_CLIENT_SECRET` está correto no `.env.local`
2. Verifique se a assinatura está sendo enviada no header `X-Bling-Signature-256`

### Produtos não aparecem após webhook
1. Verifique os logs do servidor para erros
2. Confirme que o produto tem `is_active: true`
3. Verifique se não há erros na conexão com o Supabase

## 📚 Documentação Oficial

- [Webhooks do Bling](https://developer.bling.com.br/webhooks)
- [Autenticação HMAC](https://developer.bling.com.br/webhooks#autenticacao)

## 🎯 Próximos Passos

Após configurar o webhook:

1. ✅ Teste criando um produto no Bling
2. ✅ Verifique se aparece automaticamente no site
3. ✅ Configure notificações por email (opcional)
4. ✅ Implemente lógica adicional para pedidos (opcional)

---

**⚠️ Importante**: Lembre-se de atualizar a URL do webhook quando fizer deploy em produção!