# Guia Completo: Como Obter API Key do Bling

## 📋 Passo a Passo para Gerar API Key

### 1. Acesse o Painel do Bling
- Faça login na sua conta do Bling em: https://www.bling.com.br

### 2. Navegue até Usuários API
- No canto superior direito, clique no **ícone de engrenagem** (⚙️)
- Selecione **"Preferências"**
- No menu lateral, clique em **"Sistema"**
- Depois clique em **"Usuários e usuário API"**

### 3. Criar Usuário API
- Clique no botão **"Incluir usuário"** ou **"+ Novo"**
- Selecione a opção **"Usuário API"** (não "Usuário normal")
- Preencha os campos:
  - **Nome**: Ex: "E-commerce Smart Time Prime"
  - **E-mail**: Um e-mail qualquer (não precisa ser válido, exemplo: api@smarttimeprime.com.br)

### 4. Gerar API Key
- No campo **"API Key"**, clique no botão **"Gerar"**
- **IMPORTANTE**: A API Key será exibida apenas UMA VEZ
- **COPIE IMEDIATAMENTE** e guarde em local seguro!

### 5. Configurar Permissões
Na seção de permissões, marque as seguintes opções:

**Aba "Cadastros":**
- ✅ Produtos
- ✅ Categorias
- ✅ Clientes
- ✅ Contatos
- ✅ Estoque

**Aba "Vendas":**
- ✅ Pedidos
- ✅ Notas Fiscais
- ✅ Vendas (todas as opções)
- ✅ Relatórios de Vendas

**Aba "Financeiro":**
- ✅ Faturamento (opcional, conforme necessidade)

**Aba "Relatórios":**
- ✅ Acesso aos relatórios (opcional)

### 6. Salvar
- Clique em **"Salvar"** para concluir

### 7. Adicionar no .env.local

Adicione a API Key gerada no arquivo `.env.local`:

```env
BLING_API_KEY=cole_a_api_key_gerada_aqui
```

**Exemplo:**
```env
BLING_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234
```

## 🔐 Segurança da API Key

⚠️ **IMPORTANTE:**
- A API Key é como uma senha - **NUNCA compartilhe publicamente**
- Não commite a API Key no Git (já está no `.gitignore`)
- Se alguém tiver acesso à sua API Key, poderá acessar seus dados do Bling
- Se suspeitar que a chave foi comprometida, gere uma nova e desative a antiga

## 🧪 Testar a Integração

Após adicionar a API Key, teste se está funcionando:

1. Acesse o Dashboard: `/dashboard`
2. Verifique se os indicadores mostram dados (ou zeros se não houver pedidos)
3. Veja a seção "Atividade Recente" - deve mostrar pedidos reais (se houver)

Se houver erro, verifique:
- Se a API Key está correta (sem espaços antes/depois)
- Se as permissões foram configuradas corretamente
- Se o Bling API está ativo na sua conta

## 📚 Documentação Oficial

- [Documentação Bling API v3](https://developer.bling.com.br/)
- [Como integrar via API no Bling](https://ajuda.bling.com.br/hc/pt-br/articles/360040637674-Como-integrar-via-API-no-Bling)

## 🆘 Problemas Comuns

### "Erro ao buscar pedidos do Bling"
- Verifique se a API Key está correta
- Confirme que as permissões de "Pedidos" estão marcadas
- Verifique se há pedidos no Bling para o período consultado

### "Bling não configurado"
- Verifique se a variável `BLING_API_KEY` está no `.env.local`
- Reinicie o servidor Next.js após adicionar a variável
- Confirme que não há espaços ou quebras de linha na API Key

### Dashboard mostra dados mockados
- Isso é normal se a API Key não estiver configurada
- Após configurar corretamente, os dados reais serão carregados
- Se ainda mostrar mockados, verifique os logs do servidor para erros

