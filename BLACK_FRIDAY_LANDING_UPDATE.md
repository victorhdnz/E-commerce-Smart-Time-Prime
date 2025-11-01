# Atualização da Landing Page Black Friday Uberlândia

## Componentes Criados ✅

1. ✅ `FixedTimer.tsx` - Cronômetro fixo (canto inferior direito/central)
2. ✅ `ExitPopup.tsx` - Pop-up de saída com cronômetro sincronizado
3. ✅ `ValuePackage.tsx` - Seção de Pacote de Valor
4. ✅ `StorySection.tsx` - Seção de História
5. ✅ `AboutUsSection.tsx` - Seção Quem Somos (Fundadores)
6. ✅ `HeroSection.tsx` - Atualizado com Black Friday + contador de pessoas

## Próximos Passos Necessários

### 1. Atualizar Social Proof para Google Reviews
- Adicionar ícone do Google no título
- Permitir foto em cada avaliação
- Manter formato de imagem + texto

### 2. Atualizar MediaShowcase
- Atualizar título para "💡 TECNOLOGIA, ESTILO E PRATICIDADE — TUDO NO SEU PULSO"
- Adicionar lista de recursos com ícones editáveis
- Permitir upload de até 4 imagens e 1 vídeo

### 3. Atualizar Dashboard (`src/app/dashboard/landing/page.tsx`)
- Adicionar TODOS os campos editáveis para todas as seções
- Corrigir bug de salvamento do cronômetro (já existe lógica, verificar)
- Adicionar campos para:
  - Hero: badgeText, heroImages (4), viewerCountText
  - FixedTimer: backgroundColor, textColor
  - ExitPopup: title, message, buttonText, whatsappNumber
  - MediaShowcase: features (lista editável)
  - ValuePackage: todos os campos (items, prices, images, etc.)
  - StorySection: title, content, image
  - AboutUsSection: title, description, storeImage, foundersImage, location
  - SocialProof: googleIcon, allowPhotos

### 4. Atualizar Página Principal (`src/app/page.tsx`)
- Reordenar seções na ordem especificada:
  1. FixedTimer + ExitPopup
  2. HeroSection
  3. MediaShowcase
  4. ValuePackage
  5. SocialProof
  6. StorySection
  7. WhatsAppVipRegistration
  8. AboutUsSection
  9. Footer (já existe)

### 5. Sincronizar Cronômetros
- Todos os cronômetros devem usar `promo.ends_at` ou `timer_end_date`
- FixedTimer, ExitPopup, HeroSection, ValuePackage devem compartilhar a mesma data

## Campos do Dashboard Necessários

### Cronômetro
- `timer_end_date` ✅ (já existe)
- `timer_title`
- `timer_bg_color`
- `timer_text_color`

### Hero Section
- `hero_title`
- `hero_subtitle`
- `hero_badge_text`
- `hero_cta_text`
- `hero_cta_link`
- `hero_images` (array de 4)
- `hero_bg_color`
- `hero_text_color`

### Fixed Timer
- `fixed_timer_bg_color`
- `fixed_timer_text_color`

### Exit Popup
- `exit_popup_title`
- `exit_popup_message`
- `exit_popup_button_text`
- `exit_popup_whatsapp_number`

### Media Showcase
- `media_showcase_title`
- `media_showcase_features` (array de objetos: {icon, text})
- `media_showcase_images` (array de 4)
- `media_showcase_video_url`

### Value Package
- `value_package_title`
- `value_package_image`
- `value_package_items` (array de objetos: {name, price})
- `value_package_total_price`
- `value_package_sale_price`
- `value_package_delivery_text`
- `value_package_button_text`
- `value_package_stock_text`
- `value_package_discount_text`
- `value_package_promotion_text`
- `value_package_whatsapp_number`

### Story Section
- `story_title`
- `story_content`
- `story_image`

### About Us Section
- `about_us_title`
- `about_us_description`
- `about_us_store_image`
- `about_us_founders_image`
- `about_us_location`

### Social Proof
- `social_proof_title`
- `social_proof_google_icon` (boolean)
- `social_proof_allow_photos` (boolean)
- `social_proof_testimonial_count` (texto como "Mais de 1.000 smartwatches...")

## Nota sobre Bug de Salvamento
O bug de salvamento do cronômetro já foi tratado no código atual (`src/app/dashboard/landing/page.tsx` linhas 176-204). A conversão de datetime-local para ISO está implementada. Se ainda não funcionar, pode ser problema de:
1. Timezone ao converter
2. Formato de retorno do input
3. Validação da data

Solução sugerida: usar `new Date(settings.timer_end_date + ':00')` ou ajustar para o timezone correto.

