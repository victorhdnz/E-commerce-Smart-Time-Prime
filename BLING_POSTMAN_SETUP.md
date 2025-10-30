# Configurar Bling via Postman

## Passo a Passo para Obter Token OAuth

### 1. No Postman - Obter Access Token

**Método:** `POST`  
**URL:** `https://developer.bling.com.br/api/bling/oauth/token`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
grant_type: authorization_code
client_id: 405e0fa8e3996b81f9e14d9b00521c548cbde104
client_secret: ec5f42e35eec0721fb8fc2b1cc54af374fb1491cab35d3a76259e1923ffc
code: [CODIGO_OBTIDO_DO_BLING]
redirect_uri: [URL_CADASTRADA_NO_BLING]
```

**Para obter o `code`:**
1. Acesse manualmente: `https://bling.com.br/Api/v3/oauth/authorize?client_id=405e0fa8e3996b81f9e14d9b00521c548cbde104&redirect_uri=[SEU_REDIRECT_URI]&response_type=code`
2. Autorize no Bling
3. Copie o `code` da URL de retorno (parâmetro `?code=...`)

### 2. Resposta do Postman

Você receberá algo como:
```json
{
  "access_token": "abc123...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "xyz789..."
}
```

### 3. Inserir no Supabase

Vá no Supabase → Table Editor → `site_settings` e insira:

**Key:** `bling_tokens`  
**Value (JSONB):**
```json
{
  "access_token": "abc123...",
  "refresh_token": "xyz789...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "expires_at": "2025-10-30T22:12:00.000Z"
}
```

**Calcular `expires_at`:**
- `expires_at` = Agora + `expires_in` segundos
- Exemplo: Se `expires_in` = 3600, `expires_at` = Data atual + 1 hora

### 4. Verificar

Após inserir no Supabase:
1. Acesse `/dashboard/configuracoes`
2. Deve mostrar "✓ Conectado"
3. Acesse `/dashboard` - os dados do Bling aparecerão

## Renovar Token (Refresh)

Quando o token expirar, use no Postman:

**Método:** `POST`  
**URL:** `https://developer.bling.com.br/api/bling/oauth/token`

**Body (x-www-form-urlencoded):**
```
grant_type: refresh_token
client_id: 405e0fa8e3996b81f9e14d9b00521c548cbde104
client_secret: ec5f42e35eec0721fb8fc2b1cc54af374fb1491cab35d3a76259e1923ffc
refresh_token: [REFRESH_TOKEN_ANTERIOR]
```

Atualize os tokens no Supabase com a nova resposta.

