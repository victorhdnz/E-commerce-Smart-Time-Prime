# Como Configurar Tokens OAuth no Supabase

## 📍 Onde Fazer (Interface Web do Supabase)

1. **Acesse:** https://app.supabase.com
2. **Selecione seu projeto** (Smart Time Prime)
3. **Vá em:** Table Editor (no menu lateral)
4. **Selecione a tabela:** `site_settings`
5. **Clique em:** "Insert row" (ou edite linha existente se já tiver `bling_tokens`)

## 📝 O Que Preencher

### Se NÃO existe linha com `bling_tokens`:
- Clique em **"Insert row"**
- Preencha:

**key:**
```
bling_tokens
```

**value:** (clique no campo e selecione tipo JSONB, depois cole):
```json
{
  "access_token": "f094aa6b71466caaea6d9a25fe748021ea9f8248",
  "refresh_token": "fb93690cd2c27df636a8e20cdbf8ee500f6cd2ed",
  "expires_in": 3600,
  "token_type": "Bearer",
  "expires_at": "2025-10-30T23:59:59.000Z"
}
```

**description:**
```
Tokens OAuth do Bling
```

⚠️ **IMPORTANTE:** Calcule `expires_at` = Data/Hora atual + 1 hora

**Exemplo:** Se agora é 29/10/2025 22:00, então:
- `expires_at` = `2025-10-29T23:00:00.000Z`

### Se JÁ existe linha com `bling_tokens`:
- Clique na linha para editar
- Edite o campo **value**
- Cole o novo JSON acima
- Salve

## ✅ Depois de Salvar

1. Volte para o dashboard: `/dashboard/configuracoes`
2. A seção "Integração Bling" deve mostrar **"✓ Conectado"**
3. Pronto! Renovação automática ativada

---

## 📸 Passo a Passo Visual

1. **Table Editor** → `site_settings`
2. Clique **"Insert row"** (ou edite existente)
3. Campo `key`: digite `bling_tokens`
4. Campo `value`: selecione tipo **JSONB** (não TEXT)
5. Cole o JSON com os tokens
6. Campo `description`: `Tokens OAuth do Bling`
7. Clique **"Save"** ou **"Insert"**

Pronto! 🎉

