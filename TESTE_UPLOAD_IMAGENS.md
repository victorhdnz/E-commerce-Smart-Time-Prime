# 🧪 Teste de Upload de Imagens - Diagnóstico

## ⚠️ Problema Atual
- Modal não aparece ao clicar/arrastar imagem
- Imagens não aparecem na página inicial após upload

## 🔍 Passo a Passo para Diagnosticar

### 1. Verificar se as imagens foram limpas do banco de dados

1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute:
```sql
SELECT key, value FROM site_settings WHERE key = 'general';
```
4. **Verifique se os campos de imagem estão vazios (`""`):**
   - `showcase_image_1`
   - `showcase_image_2`
   - `showcase_image_3`
   - `showcase_image_4`

**✅ Se estiverem vazios, está correto!**

### 2. Testar Upload de Imagem no Dashboard

1. Vá em **Dashboard** > **Editar Landing Page**
2. Role até "Galeria de Destaques"
3. **Clique na área "Arraste uma imagem ou clique para selecionar"**
4. Selecione uma imagem do seu computador

**❓ O que acontece?**
- [ ] Modal de edição abre normalmente
- [ ] Nada acontece
- [ ] Erro no console

### 3. Verificar Console do Navegador

1. Abra o Console (F12 > Console)
2. Tente fazer upload de uma imagem
3. **Procure por erros em vermelho**
4. **Tire screenshot dos erros e me envie**

### 4. Testar Upload Completo

1. Faça upload de uma imagem
2. Edite (rotacione, zoom, corte)
3. Clique em "Confirmar e Upload"
4. **Aguarde a mensagem "Imagem enviada com sucesso!"**
5. Clique em "Salvar Alterações"
6. **Veja os logs no console:**
   - `💾 Salvando configurações:`
   - `🖼️ Imagens que serão salvas:`

### 5. Verificar se Salvou no Banco

1. Volte ao Supabase > SQL Editor
2. Execute novamente:
```sql
SELECT key, value FROM site_settings WHERE key = 'general';
```
3. **Verifique se agora há uma URL do Cloudinary em `showcase_image_1`**
   - Deve começar com `https://res.cloudinary.com/...`

### 6. Verificar Página Inicial

1. Abra a página inicial em uma **nova aba**
2. Pressione **Ctrl+Shift+R** (force reload sem cache)
3. **Abra o Console (F12)**
4. **Procure pelos logs:**
   - `🖼️ Settings carregados:`
   - `📸 Imagens para exibir:`
5. **Verifique se a seção "Destaques" aparece**

## 🐛 Possíveis Problemas e Soluções

### Problema: Modal não abre

**Causa:** Erro no ImageUploader ou no Modal component

**Solução:**
1. Verifique erros no console
2. Tente recarregar a página do Dashboard
3. Limpe o cache do navegador

### Problema: Upload falha

**Causa:** Erro na API do Cloudinary ou tamanho da imagem

**Solução:**
1. Verifique se a imagem tem menos de 5MB
2. Tente com uma imagem menor
3. Verifique se as credenciais do Cloudinary estão corretas no `.env.local`

### Problema: Imagem não aparece na página inicial

**Causa:** Cache ou seção oculta por não ter imagens

**Solução:**
1. Force reload (Ctrl+Shift+R)
2. Aguarde 30 segundos (cache do Next.js)
3. Verifique se salvou no banco de dados

## 📝 Me envie:

1. **Screenshot do console** quando tentar fazer upload
2. **Resultado da query SQL** do banco de dados
3. **Screenshot da página inicial** após o upload
4. **Em qual etapa o problema ocorre**

---

Com essas informações, vou conseguir identificar exatamente onde está o problema! 🚀

