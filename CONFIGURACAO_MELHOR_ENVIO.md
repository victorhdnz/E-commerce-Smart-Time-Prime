# Configuração do Melhor Envio

Este documento explica como configurar a integração com o Melhor Envio para cálculo de frete no carrinho.

## Configuração do Ambiente (.env)

Adicione a seguinte variável de ambiente no arquivo `.env.local` (local) e nas variáveis de ambiente do Vercel (produção):

```env
MELHOR_ENVIO_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjFjZDhiNDg1NWIzMWQ0N2ZiOTk4MzRiYWQ5ZTJiMmQ2MTc1NjIyMWE3NTg4OGZhOGE4ZGY0ZTNhOTVjMzMzYjI0YzZlZGUxNTVlMDQ2OWYiLCJpYXQiOjE3NjIwMjY4MjIuNTIyODA2LCJuYmYiOjE3NjIwMjY4MjIuNTIyODA3LCJleHAiOjE3OTM1NjI4MjIuNTEyMjIyLCJzdWIiOiI5ZWJjZDY4Ni0yMzE4LTQ0N2ItYWJmZi00NTk1OGMyNzY3NzAiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.yPThPNu9467XHPodEanSTIw4fzYLCFwc8rDzGC2M5Z8a-HaDtyXtFYYtZApwgA9Gy3_eOCtZhZquXQWanAbqnP7PGYAlXHYQVtk4QBe92WppT6-N4DDuxcbjGTbSBkC6c3gw9LcD0WCRQf995ncqfDFksYlYm9s1sn0RhE2Gsm9vJ5ufNUWRMIZqmwSTGym1p8G4swZs5hVXPtGNrlzzfzriBoGn1KAPlD2oXPURXMx-xjl8bvL8Gry_iAwOpJjalw6H8jeEGO39_iuwF4DndGw0JYeYekB_NKZEGa9fbMx-w0AJekroErLTTUq7ZOSuXQtcEzQq-gdkMRfWGn4_K8Llxb8fmURSBOH2AFmSaW_oMwACRb018HUyjZfV__b9Y7LiyXBbIWVZunLENfhPCapwi7Y9WX0ZUL_tPsPZHSC5FTIHw3sX0oD0N6CFkfbt-haB23NB04jime0uMDdRl30aHIdDMJxiQ67mFo5472kyo0T0ZThI8nJUc29IuKIUdL83krPWAK6udeoLb04s6be7NHbg6b5VTG-F8voxgSUChjI9GZscOOkJNvSx7jZJ4aAVsE4Ft4Y_r5Etuw1hmSyEf_H-UtfGsXrazS2kEt1NB63Z-9yWwDv3J9n-dXC_dVF076W1jgf3ofNG-4bqs7GFiftPifbwDD1d78Fa2aE
```

## Configuração no Vercel

1. Acesse o painel do Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione a variável:
   - **Key**: `MELHOR_ENVIO_TOKEN`
   - **Value**: (cole o token completo fornecido)
   - **Environment**: Production, Preview, Development (ou apenas Production)
4. Clique em **Save**
5. Faça um redeploy da aplicação para as variáveis serem aplicadas

## Configuração no Supabase

**Nenhuma configuração adicional é necessária no Supabase** para o cálculo de frete básico. A integração usa apenas:

- **Produtos**: Para obter dimensões e peso (campos `width`, `height`, `length`, `weight`)
- **Carrinho**: Itens do carrinho para calcular o frete

### Campos de Produtos Recomendados

Para um cálculo de frete mais preciso, certifique-se de que os produtos tenham:

- `weight` (peso em kg) - ex: 0.3
- `width` (largura em cm) - ex: 15
- `height` (altura em cm) - ex: 5
- `length` (comprimento em cm) - ex: 20

Se esses campos não existirem no produto, o sistema usa valores padrão:
- Peso: 0.3 kg
- Dimensões: 15cm x 5cm x 20cm

## Como Funciona

1. **No Carrinho**: O cliente digita o CEP para calcular o frete
2. **Cálculo Automático**: Ao digitar um CEP válido (8 dígitos), o sistema calcula automaticamente após 500ms
3. **Opções de Frete**: O sistema exibe todas as opções disponíveis do Melhor Envio
4. **Seleção**: O cliente seleciona a opção de frete desejada
5. **Atualização do Total**: O total do pedido é atualizado incluindo o frete selecionado

## CEP de Origem

O CEP de origem está configurado como `38413-108` (Shopping Planalto, Uberlândia/MG). Para alterar:

1. Edite o arquivo `src/app/api/shipping/calculate/route.ts`
2. Altere a linha que contém `const originCep = '38413-108'`

## Solução de Problemas

### Erro: "Token do Melhor Envio não configurado"
- Verifique se a variável `MELHOR_ENVIO_TOKEN` está configurada no `.env.local` (local) ou nas variáveis de ambiente do Vercel (produção)
- Certifique-se de que fez um redeploy após adicionar a variável

### Erro: "Erro ao calcular frete"
- Verifique se o token está válido e não expirou
- Verifique os logs do servidor para mais detalhes
- Certifique-se de que os produtos têm dimensões e peso configurados

### Nenhuma opção de frete aparece
- Verifique se o CEP de destino está correto
- Alguns CEPs podem não ter opções de frete disponíveis
- Verifique se o CEP de origem está correto

## Documentação da API Melhor Envio

Para mais informações sobre a API do Melhor Envio:
- Documentação: https://melhorenvio.com.br/api-docs

