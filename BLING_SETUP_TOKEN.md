# Configuração do Token OAuth Bling

Você recebeu tokens OAuth do Bling:
- **access_token**: `f094aa6b71466caaea6d9a25fe748021ea9f8248`
- **refresh_token**: `fb93690cd2c27df636a8e20cdbf8ee500f6cd2ed`
- **Access Token URL**: `https://bling.com.br/Api/v3/oauth/token`

## ✅ Opção 1: Usar access_token como API Key (Simples)

**No `.env.local`:**
```env
BLING_API_KEY=f094aa6b71466caaea6d9a25fe748021ea9f8248
```

**Vantagens:**
- ✅ Configuração rápida
- ✅ Funciona imediatamente

**Desvantagens:**
- ⚠️ Se expirar (~1 hora), precisa gerar novo token manualmente
- ⚠️ Não usa refresh_token automaticamente

---

## ✅ Opção 2: Usar Tokens OAuth Completo (RECOMENDADO)

Esta opção permite **renovação automática** quando o token expira!

### Passo a Passo:

1. **Calcule `expires_at`:**
   - Tokens OAuth geralmente expiram em **1 hora (3600 segundos)**
   - `expires_at` = Data/Hora atual + 1 hora
   - Exemplo: Se agora é `2025-10-29T22:00:00`, então `expires_at` = `2025-10-29T23:00:00.000Z`

2. **Vá no Supabase:**
   - Table Editor → `site_settings`
   - Clique em "Insert row" ou edite se já existir

3. **Preencha:**
   - **key**: `bling_tokens`
   - **value** (JSONB):
   ```json
   {
     "access_token": "f094aa6b71466caaea6d9a25fe748021ea9f8248",
     "refresh_token": "fb93690cd2c27df636a8e20cdbf8ee500f6cd2ed",
     "expires_in": 3600,
     "token_type": "Bearer",
     "expires_at": "2025-10-29T23:00:00.000Z"
   }
   ```
   *(Substitua a data por: data atual + 1 hora)*

4. **Salve**

**Vantagens:**
- ✅ Renovação automática quando expira (usa refresh_token)
- ✅ Você não precisa se preocupar
- ✅ Mais seguro e robusto

**Como funciona:**
- Quando o token expirar, o sistema detecta automaticamente
- Usa o `refresh_token` para obter novo `access_token`
- Atualiza no Supabase automaticamente
- Continua funcionando sem intervenção

---

## 🔍 Qual Escolher?

**Se você quer simplicidade agora:**
→ Use **Opção 1** (`.env.local`)

**Se você quer funcionar a longo prazo sem preocupação:**
→ Use **Opção 2** (Supabase - RECOMENDADO)

## 📝 Importante

### Se usar Opção 1:
- Reinicie o servidor Next.js após atualizar `.env.local`

### Se usar Opção 2:
- Não precisa mexer no `.env.local` (pode remover `BLING_API_KEY`)
- O sistema detecta automaticamente quando você salvar no Supabase
- Renovação automática funciona sempre

## ✅ Verificar se Funcionou

Após configurar (qualquer opção):

1. Acesse: `/dashboard/configuracoes`
2. Veja seção "Integração Bling"
3. Deve mostrar: **"✓ Conectado"**
4. Acesse: `/dashboard`
5. Indicadores devem mostrar dados do Bling

---

## 🧪 Teste Rápido

Você pode testar se o token está funcionando no Postman:

**GET** `https://www.bling.com.br/Api/v3/pedidos/vendas?apikey=f094aa6b71466caaea6d9a25fe748021ea9f8248`

Ou com Bearer token:
**GET** `https://www.bling.com.br/Api/v3/pedidos/vendas`
**Header**: `Authorization: Bearer f094aa6b71466caaea6d9a25fe748021ea9f8248`

Se retornar seus pedidos, está funcionando! ✅

