# Integração Bling - Configuração

## Método Recomendado: API Key

O método mais simples é usar uma **API Key** gerada diretamente no painel do Bling.

### Passo a Passo Rápido

1. **Gerar API Key no Bling:**
   - Login no Bling → Engrenagem (⚙️) → Preferências
   - Sistema → Usuários e usuário API
   - Incluir usuário → Usuário API
   - Gerar API Key e **copiar imediatamente**

2. **Adicionar no `.env.local`:**
   ```env
   BLING_API_KEY=sua_api_key_gerada_aqui
   ```

📖 **Guia Completo:** Veja o arquivo `BLING_API_KEY_GUIDE.md` para instruções detalhadas com imagens.

## Variáveis de Ambiente

Adicione no arquivo `.env.local`:

```env
# Opção 1: API Key (RECOMENDADO - Mais simples)
BLING_API_KEY=sua_api_key_aqui

# Opção 2: OAuth (Avançado - Se API Key não funcionar)
BLING_CLIENT_ID=405e0fa8e3996b81f9e14d9b00521c548cbde104
BLING_CLIENT_SECRET=ec5f42e35eec0721fb8fc2b1cc54af374fb1491cab35d3a76259e1923ffc
```

## Como Funciona

1. **Prioridade**: O sistema tenta usar `BLING_API_KEY` primeiro (método mais simples)
2. **Fallback**: Se não houver API Key, tenta OAuth (requer configuração adicional)
3. **Mock**: Se nenhum método funcionar, usa dados mockados para não quebrar o dashboard

## Testar

Após adicionar a API Key:
1. Reinicie o servidor Next.js
2. Acesse `/dashboard`
3. Verifique se os indicadores mostram dados reais do Bling

## Documentação

- 📖 [Guia Completo API Key](BLING_API_KEY_GUIDE.md)
- 🔗 [Documentação Bling API v3](https://developer.bling.com.br/)

