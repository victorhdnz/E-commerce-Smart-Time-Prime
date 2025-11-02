# Configuração de Upload de Vídeos no Supabase Storage

## ✅ O que foi feito

O upload de vídeos foi migrado do Cloudinary para o **Supabase Storage**, que é mais adequado para este projeto e oferece suporte nativo para vídeos.

## 📋 Passos para Configuração

### 1. Criar o Bucket de Vídeos no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** → **New Bucket**
4. Configure:
   - **Nome do bucket**: `videos`
   - **Visibilidade**: `Public` (para que os vídeos possam ser acessados publicamente)
   - Clique em **Create bucket**

### 2. Configurar as Políticas de Segurança (RLS)

Execute o SQL no Supabase SQL Editor:

```sql
-- O arquivo completo está em: supabase/setup_videos_bucket.sql
```

Ou execute manualmente no SQL Editor do Supabase:

1. Vá em **SQL Editor** → **New Query**
2. Cole o conteúdo do arquivo `supabase/setup_videos_bucket.sql`
3. Execute a query

Isso criará as políticas necessárias para:
- ✅ Apenas admins/editors podem fazer upload de vídeos
- ✅ Todos podem ver os vídeos (bucket público)
- ✅ Apenas admins podem deletar/atualizar vídeos

## 🎯 Como funciona

### Upload de Vídeo
1. Usuário seleciona um arquivo de vídeo no componente `VideoUploader`
2. O arquivo é enviado para `/api/upload/video`
3. A API verifica autenticação e permissões
4. O vídeo é enviado para o bucket `videos` do Supabase Storage
5. A URL pública do vídeo é retornada e salva

### Vantagens do Supabase Storage
- ✅ Integração nativa com o projeto (já usa Supabase)
- ✅ Suporte completo para vídeos grandes (até 100MB configurado)
- ✅ URLs públicas geradas automaticamente
- ✅ Políticas de segurança (RLS) configuráveis
- ✅ Gratuito até certo limite de armazenamento

## ⚙️ Configurações Técnicas

### Limites Configurados
- **Tamanho máximo**: 100MB por vídeo
- **Tipos permitidos**: Arquivos com `video/*` MIME type
- **Bucket**: `videos`
- **Pasta**: `videos/` (dentro do bucket)

### Permissões
- **Upload**: Apenas usuários com role `admin` ou `editor`
- **Visualização**: Todos (bucket público)
- **Exclusão**: Apenas usuários com role `admin` ou `editor`

## 🔧 Arquivos Modificados/Criados

1. **`src/app/api/upload/video/route.ts`** (NOVO)
   - API route para upload de vídeos via Supabase Storage

2. **`src/components/ui/VideoUploader.tsx`** (MODIFICADO)
   - Agora usa Supabase Storage ao invés do Cloudinary

3. **`supabase/setup_videos_bucket.sql`** (NOVO)
   - Script SQL para configurar políticas RLS do bucket de vídeos

## 🚀 Próximos Passos

1. ✅ Criar o bucket `videos` no Supabase Dashboard
2. ✅ Executar o SQL de configuração das políticas
3. ✅ Testar o upload de um vídeo no dashboard

## 📝 Notas Importantes

- O bucket deve ser **público** para que os vídeos possam ser visualizados na landing page
- O limite de 100MB pode ser ajustado conforme necessário
- Os vídeos são armazenados com nomes únicos para evitar conflitos
- A URL pública gerada pode ser usada diretamente em tags `<video>`

