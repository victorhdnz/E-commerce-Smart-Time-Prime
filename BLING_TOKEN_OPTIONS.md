# Opções para Usar Tokens OAuth do Bling

Você recebeu tokens OAuth do Bling:
- **access_token**: `f094aa6b71466caaea6d9a25fe748021ea9f8248`
- **refresh_token**: `fb93690cd2c27df636a8e20cdbf8ee500f6cd2ed`

## Opção 1: Usar access_token como API Key (Mais Simples)

**No `.env.local`:**
```env
BLING_API_KEY=f094aa6b71466caaea6d9a25fe748021ea9f8248
```

✅ **Vantagens:**
- Configuração simples (apenas uma variável)
- Funciona imediatamente
- Não precisa renovar (se não expirar)

⚠️ **Desvantagens:**
- Se expirar, você precisa gerar novo token manualmente
- Não usa refresh_token automaticamente

## Opção 2: Usar Tokens OAuth Completo (Recomendado)

**No Supabase → Table Editor → `site_settings`:**

Insira uma nova linha:
- **key**: `bling_tokens`
- **value** (JSONB):
```json
{
  "access_token": "f094aa6b71466caaea6d9a25fe748021ea9f8248",
  "refresh_token": "fb93690cd2c27df636a8e20cdbf8ee500f6cd2ed",
  "expires_in": 3600,
  "token_type": "Bearer",
  "expires_at": "2025-10-30T23:59:59.000Z"
}
```

✅ **Vantagens:**
- Renovação automática quando expira (usa refresh_token)
- Não precisa se preocupar com expiração
- Mais seguro e robusto

⚠️ **Desvantagens:**
- Precisa configurar no Supabase (mas só uma vez)

## Qual Usar?

**Se o access_token não expira ou expira muito raramente:**
→ Use **Opção 1** (mais simples)

**Se você quer renovação automática:**
→ Use **Opção 2** (recomendado)

## Como Saber se Token Expira?

Normalmente tokens OAuth expiram em 1 hora (3600 segundos).
Se você não especificar `expires_in`, use `3600` e calcule:
- `expires_at` = Data/Hora atual + 1 hora

## Recomendação

Como você tem `refresh_token`, recomendo a **Opção 2** para renovação automática!

