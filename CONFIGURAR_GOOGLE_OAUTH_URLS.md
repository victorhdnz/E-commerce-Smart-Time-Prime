# 🔐 Configurar URLs de Redirecionamento no Google OAuth

## 📋 URLs Necessárias para o Google Cloud Console

### 1. Seção: "Para usar com solicitações de um navegador"

**Adicionar:**
```
https://www.smarttimeprime.com.br
```

✅ **Status**: Já deve estar configurado (como mostrado na imagem)

---

### 2. Seção: "URIs de redirecionamento autorizados" 
#### (Para usar com solicitações de um servidor da Web)

**Você precisa ter EXATAMENTE estas URLs:**

#### ✅ **1. Callback do Supabase (OBRIGATÓRIO)**
```
https://vdznpevjomdnrocxyjjw.supabase.co/auth/v1/callback
```
**✅ Status**: Já está configurado (como mostrado na imagem)

**Por quê?** O Supabase gerencia o OAuth e redireciona para este endpoint.

---

#### ✅ **2. Callback do seu site (PRODUÇÃO)**
```
https://www.smarttimeprime.com.br/auth/callback
```

**Por quê?** Após o Supabase processar o OAuth, ele redireciona para esta URL do seu site.

---

#### ✅ **3. Callback para desenvolvimento local (OPCIONAL, mas recomendado)**
```
http://localhost:3000/auth/callback
```

**Por quê?** Para testar localmente durante o desenvolvimento.

---

## 📝 Resumo Completo das URLs para Adicionar

### Seção 1: "Para usar com solicitações de um navegador"
```
https://www.smarttimeprime.com.br
```

### Seção 2: "URIs de redirecionamento autorizados"
```
https://vdznpevjomdnrocxyjjw.supabase.co/auth/v1/callback
https://www.smarttimeprime.com.br/auth/callback
http://localhost:3000/auth/callback
```

---

## 🗑️ URLs ANTIGAS que podem ser REMOVIDAS (se não usar mais)

Se você não usa mais o domínio antigo da Vercel, pode remover:
```
https://e-commerce-smart-time-prime-ef8c.vercel.app
```

**⚠️ Atenção:** Remova apenas se tiver certeza de que não está mais usando!

---

## ✅ Como Adicionar no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione seu projeto
3. Vá em **APIs & Services** > **Credentials**
4. Clique no seu **OAuth 2.0 Client ID**
5. Role até a seção **"URIs de redirecionamento autorizados"**
6. Clique em **"Adicionar URI"** e adicione cada URL acima
7. Clique em **Salvar**

---

## 🔍 Como Funciona o Fluxo

```
1. Usuário clica em "Entrar com Google"
   ↓
2. Redireciona para → Google OAuth
   ↓
3. Usuário autoriza
   ↓
4. Google redireciona para → https://vdznpevjomdnrocxyjjw.supabase.co/auth/v1/callback
   ↓
5. Supabase processa e redireciona para → https://www.smarttimeprime.com.br/auth/callback
   ↓
6. Seu site recebe e redireciona para → https://www.smarttimeprime.com.br?auth=success
   ↓
7. Usuário está logado! ✅
```

---

## ⚠️ Importante

- **Não adicione** URLs que não existem (como `/api/bling/callback` nesta seção - isso é só para Bling)
- **Adicione APENAS** as URLs listadas acima
- O domínio deve ser **exatamente** `https://www.smarttimeprime.com.br` (com ou sem `www` depende do que você configurou)

---

## 🧪 Testar

Após adicionar as URLs:

1. Faça logout
2. Clique em "Entrar com Google"
3. Autorize
4. Deve redirecionar para `https://www.smarttimeprime.com.br` (não mais para o domínio antigo)

---

## 📚 Referências

- Arquivo de callback: `src/app/auth/callback/route.ts`
- Utilitário de URL: `src/lib/utils/siteUrl.ts`

