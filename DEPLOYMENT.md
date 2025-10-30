# 🚀 Guia de Deploy - Hostinger

## Opções de Deploy

Você pode fazer deploy do Smart Time Prime de duas formas na Hostinger:

1. **Node.js App (Recomendado)** - Usando o gerenciador de aplicativos Node.js
2. **Build Estático** - Exportando e servindo como arquivos estáticos

---

## Método 1: Deploy como Node.js App (Recomendado)

### Requisitos
- Plano Hostinger Business ou superior
- Acesso SSH

### Passo 1: Preparar o Projeto

No seu computador local:

```bash
# Build do projeto
npm run build

# Criar arquivo .tar.gz
tar -czf smart-time-prime.tar.gz .next node_modules package.json package-lock.json next.config.js .env.local
```

### Passo 2: Upload via SSH

```bash
# Conectar via SSH
ssh usuario@seu-servidor.hostinger.com

# Navegar para o diretório
cd ~/public_html

# Upload do arquivo (ou use FTP)
# Extrair
tar -xzf smart-time-prime.tar.gz
```

### Passo 3: Configurar Node.js na Hostinger

1. Acesse o **hPanel** da Hostinger
2. Vá em **Advanced** > **Node.js**
3. Clique em **Create Application**
4. Configure:
   - **Application root**: `/public_html`
   - **Application URL**: seu domínio
   - **Application startup file**: `node_modules/next/dist/bin/next`
   - **Node.js version**: 18.x ou superior

### Passo 4: Configurar Variáveis de Ambiente

No hPanel, na seção de Node.js App, adicione as variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-secret
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
```

### Passo 5: Instalar Dependências

Via SSH:

```bash
cd ~/public_html
npm install --production
```

### Passo 6: Iniciar Aplicação

No hPanel, clique em **Start Application**

Ou via SSH:

```bash
npm run start
```

---

## Método 2: Deploy Estático (Alternativo)

### Passo 1: Modificar next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // ... resto da configuração
}
```

### Passo 2: Build Estático

```bash
npm run build
```

Isso criará a pasta `out/` com arquivos estáticos.

### Passo 3: Upload

Upload da pasta `out/` para `/public_html` via FTP.

**⚠️ Limitações:**
- Sem API routes
- Sem Server-Side Rendering
- Sem revalidação automática

---

## Configuração de Domínio

### SSL (HTTPS)

1. No hPanel, vá em **SSL**
2. Ative o **Let's Encrypt** gratuito
3. Force HTTPS em todas as páginas

### .htaccess (se necessário)

Crie `.htaccess` em `/public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Otimizações de Performance

### 1. Cache Headers

Adicione no `.htaccess`:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 2. Compressão Gzip

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### 3. Next.js Config

No `next.config.js`:

```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // ...
}
```

---

## Monitoramento

### Logs

Via SSH:

```bash
# Ver logs da aplicação
pm2 logs

# Ver logs do Nginx
tail -f /var/log/nginx/error.log
```

### Uptime

Configure monitoramento com:
- UptimeRobot (gratuito)
- Pingdom
- StatusCake

---

## Backup

### Automático via Script

Crie `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz /home/usuario/public_html
# Upload para storage externo (S3, Dropbox, etc)
```

Execute diariamente via cron:

```bash
0 3 * * * /home/usuario/backup.sh
```

---

## Troubleshooting

### App não inicia

1. Verifique logs: `pm2 logs`
2. Verifique porta: Node.js deve usar porta configurada
3. Verifique permissões: `chmod -R 755 /public_html`

### Erro 502 Bad Gateway

1. Reinicie a aplicação no hPanel
2. Verifique se Node.js está rodando
3. Aumente memória no plano

### Imagens não carregam

1. Verifique URLs no Supabase
2. Configure CORS no Supabase
3. Verifique permissões dos buckets

### Performance lenta

1. Ative cache
2. Otimize imagens (WebP)
3. Use CDN (Cloudflare)
4. Minimize JS/CSS

---

## CDN (Opcional)

### Cloudflare

1. Crie conta gratuita no Cloudflare
2. Adicione seu domínio
3. Atualize nameservers na Hostinger
4. Configure cache e otimizações

**Benefícios:**
- Cache global
- Proteção DDoS
- SSL gratuito
- Otimização automática

---

## Checklist Final

- [ ] Build realizado sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Node.js app iniciado na Hostinger
- [ ] SSL ativo (HTTPS)
- [ ] Domínio apontado corretamente
- [ ] Imagens carregando (Supabase)
- [ ] Google OAuth funcionando
- [ ] Dashboard acessível
- [ ] Performance testada (Google PageSpeed)
- [ ] Mobile responsivo testado
- [ ] Backup configurado

---

## Comandos Úteis

```bash
# Verificar versão do Node
node -v

# Verificar processos
ps aux | grep node

# Reiniciar aplicação
pm2 restart all

# Ver status
pm2 status

# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules
npm install
```

---

## Suporte Hostinger

- Chat ao vivo: 24/7
- Email: support@hostinger.com
- Base de conhecimento: hostinger.com.br/tutoriais

---

🎉 **Deploy concluído com sucesso!**

Seu e-commerce Smart Time Prime está online e pronto para vender!

