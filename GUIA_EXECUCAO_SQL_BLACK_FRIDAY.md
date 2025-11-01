# Guia de Execução SQL - Landing Page Black Friday

## 📋 Resumo

Este script SQL adiciona **TODOS** os campos editáveis necessários para a nova landing page Black Friday Uberlândia no banco de dados Supabase.

## ✅ O que este script faz

1. **Preserva dados existentes** - Não apaga nada que já existe
2. **Adiciona apenas campos novos** - Usa `IF NOT EXISTS` logic para não sobrescrever
3. **Define valores padrão** - Para todos os novos campos necessários
4. **É seguro executar múltiplas vezes** - Pode ser executado várias vezes sem problemas

## 🚀 Como Executar

### Passo 1: Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)

### Passo 2: Executar o Script
1. Copie **TODO** o conteúdo do arquivo `supabase/add_black_friday_landing_fields.sql`
2. Cole no editor SQL do Supabase
3. Clique em **Run** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Passo 3: Verificar Execução
O script mostrará uma mensagem:
- `Site settings atualizado com sucesso!`
- E listará todos os campos adicionados

## 📦 Campos Adicionados

### Hero Section (Banner de Abertura)
- `hero_title` - Título principal
- `hero_subtitle` - Subtítulo/descrição
- `hero_badge_text` - Texto do badge (ex: "🚨 A BLACK FRIDAY CHEGOU!")
- `hero_cta_text` - Texto do botão principal
- `hero_cta_link` - Link do botão (pode ser WhatsApp ou grupo)
- `hero_bg_color` - Cor de fundo
- `hero_text_color` - Cor do texto
- `hero_images` - Array de até 4 imagens de fundo

### Timer Section (Cronômetro)
- `timer_title` - Título do cronômetro
- `timer_end_date` - Data/hora de término (ISO string)
- `timer_bg_color` - Cor de fundo
- `timer_text_color` - Cor do texto

### Fixed Timer (Cronômetro Fixo)
- `fixed_timer_bg_color` - Cor de fundo
- `fixed_timer_text_color` - Cor do texto

### Exit Popup (Pop-up de Saída)
- `exit_popup_title` - Título do pop-up
- `exit_popup_message` - Mensagem principal
- `exit_popup_button_text` - Texto do botão WhatsApp
- `exit_popup_whatsapp_number` - Número do WhatsApp

### Media Showcase (Fotos e Vídeo)
- `media_showcase_title` - Título da seção
- `media_showcase_features` - Array de recursos [{icon, text}, ...]
- `showcase_image_1` até `showcase_image_4` - Imagens do produto
- `showcase_video_url` - URL do vídeo vertical

### Value Package (Pacote de Valor)
- `value_package_title` - Título da seção
- `value_package_image` - Imagem do pacote completo
- `value_package_items` - Array de itens [{name, price}, ...]
- `value_package_total_price` - Preço total
- `value_package_sale_price` - Preço de venda
- `value_package_delivery_text` - Texto de entrega
- `value_package_button_text` - Texto do botão
- `value_package_whatsapp_group_link` - Link do grupo WhatsApp
- `value_package_whatsapp_number` - Número WhatsApp (fallback)
- `value_package_stock_text` - Texto de estoque
- `value_package_discount_text` - Texto de desconto
- `value_package_promotion_text` - Texto de promoção

### Story Section (História)
- `story_title` - Título da seção
- `story_content` - Conteúdo/texto da história
- `story_image` - Foto dos donos na loja

### About Us Section (Quem Somos)
- `about_us_title` - Título da seção
- `about_us_description` - Descrição da empresa
- `about_us_store_image` - Foto da loja
- `about_us_founders_image` - Foto dos fundadores
- `about_us_location` - Localização (ex: "Shopping Planalto, Uberlândia/MG")

### Social Proof (Avaliações Google)
- `social_proof_title` - Título da seção
- `social_proof_google_icon` - Boolean (mostrar ícone Google)
- `social_proof_allow_photos` - Boolean (permitir fotos nas avaliações)
- `social_proof_testimonial_count` - Texto de contagem (ex: "Mais de 1.000 smartwatches...")

## 🔍 Verificar Campos Adicionados

Após executar, você pode verificar se os campos foram adicionados com:

```sql
SELECT 
  jsonb_object_keys(value) as campo
FROM site_settings
WHERE key = 'general'
ORDER BY campo;
```

## ⚠️ Importante

- **Não apaga dados existentes** - O script preserva todos os valores atuais
- **Pode executar múltiplas vezes** - É seguro rodar várias vezes
- **Valores padrão** - Campos novos receberão valores padrão se não existirem
- **Não quebra nada** - Se um campo já existe, ele não será alterado

## 🐛 Troubleshooting

### Erro: "permission denied"
- Certifique-se de estar logado como admin no Supabase
- Verifique se as políticas RLS estão corretas

### Campos não aparecem
- Verifique se a query SELECT no final do script retornou os campos
- Tente executar o script novamente (é seguro)

### Dados perdidos (muito improvável)
- O script usa `jsonb_set` que preserva valores existentes
- Se algo der errado, você pode restaurar de um backup do Supabase

## 📝 Próximos Passos Após Executar

1. **Atualizar o Dashboard** - Os campos já estarão disponíveis no código
2. **Testar salvamento** - Ir em Dashboard > Editar Landing Page e salvar
3. **Preencher dados** - Editar cada seção no Dashboard
4. **Configurar data do cronômetro** - Definir `timer_end_date` no Dashboard

