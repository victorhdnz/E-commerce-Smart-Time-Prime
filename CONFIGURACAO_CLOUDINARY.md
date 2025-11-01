# Configuração do Cloudinary

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis de ambiente no seu `.env.local` (desenvolvimento) e no Vercel (produção):

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Opcional: Se preferir usar NEXT_PUBLIC_ (para acesso no client-side)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
```

**Nota:** O código já está preparado para aceitar ambos os formatos (`CLOUDINARY_CLOUD_NAME` ou `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).

## Configuração do Next.js

O arquivo `next.config.js` já está configurado para permitir imagens do Cloudinary:

```javascript
images: {
  domains: ['lh3.googleusercontent.com', 'images.unsplash.com', 'res.cloudinary.com'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      port: '',
      pathname: '/**',
    },
  ],
}
```

## Como Obter as Credenciais do Cloudinary

1. Acesse [https://cloudinary.com](https://cloudinary.com)
2. Faça login na sua conta (ou crie uma conta gratuita)
3. No Dashboard, vá em **Settings** (Configurações)
4. Na aba **Product Environment Credentials**, você encontrará:
   - **Cloud name**: Nome da sua nuvem
   - **API Key**: Chave de API
   - **API Secret**: Segredo da API

## Configuração da API de Upload

A API de upload (`/api/upload`) já está configurada para:

- Aceitar imagens nos formatos: JPG, JPEG, PNG, GIF, WEBP
- Tamanho máximo: 5MB para imagens
- Transformações automáticas:
  - Width: 800px
  - Height: 600px
  - Crop: limit (mantém proporção)
  - Quality: auto:good (otimização automática)

## Testando o Upload

1. Certifique-se de que as variáveis de ambiente estão configuradas
2. Acesse o Dashboard > Editar Landing Page
3. Tente fazer upload de uma imagem
4. Verifique no console do navegador e do servidor se há erros

## Solução de Problemas

### Erro: "Cloudinary não configurado corretamente"
- Verifique se todas as variáveis de ambiente estão definidas
- No Vercel, vá em Settings > Environment Variables e adicione as variáveis
- Reinicie o servidor após adicionar novas variáveis

### Erro: "Arquivo muito grande"
- O tamanho máximo é 5MB para imagens
- Comprima a imagem antes de fazer upload ou use uma ferramenta online

### Erro: "Apenas arquivos de imagem são permitidos"
- Verifique se o arquivo é realmente uma imagem
- Formatos aceitos: JPG, JPEG, PNG, GIF, WEBP
- A extensão do arquivo deve corresponder ao tipo MIME

### Imagens não aparecem após upload
- Verifique se o domínio `res.cloudinary.com` está configurado no `next.config.js`
- Verifique se a URL retornada pelo Cloudinary é válida
- No console do navegador, verifique se há erros de CORS ou carregamento

## Estrutura de Pastas no Cloudinary

As imagens são organizadas nas seguintes pastas:
- `smart-time-prime/`: Pasta principal (padrão)
- `images/`: Para uploads gerais
- Outras pastas podem ser especificadas via parâmetro `folder` no upload

