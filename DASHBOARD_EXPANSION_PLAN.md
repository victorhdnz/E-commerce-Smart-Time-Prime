# Plano de Expansão do Dashboard - Landing Page Black Friday

## Campos a Adicionar no Dashboard

### 1. Hero Section (Expandir)
- ✅ hero_title (já existe)
- ✅ hero_subtitle (já existe)
- ✅ hero_cta_text (já existe)
- ➕ hero_badge_text (NOVO)
- ➕ hero_cta_link (NOVO)
- ➕ hero_bg_color (NOVO)
- ➕ hero_text_color (NOVO)
- ➕ hero_images (array de 4) (NOVO)

### 2. Timer Section (Expandir)
- ✅ timer_title (já existe)
- ✅ timer_end_date (já existe - corrigir bug de salvamento)
- ✅ timer_bg_color (já existe)
- ✅ timer_text_color (já existe)

### 3. Fixed Timer (NOVO)
- ➕ fixed_timer_bg_color
- ➕ fixed_timer_text_color

### 4. Exit Popup (NOVO)
- ➕ exit_popup_title
- ➕ exit_popup_message
- ➕ exit_popup_button_text
- ➕ exit_popup_whatsapp_number

### 5. Media Showcase (Expandir)
- ➕ media_showcase_title (NOVO)
- ➕ media_showcase_features (array de objetos) (NOVO)
- ✅ showcase_image_1 (já existe)
- ✅ showcase_image_2 (já existe)
- ✅ showcase_image_3 (já existe)
- ✅ showcase_image_4 (já existe)
- ✅ showcase_video_url (já existe)

### 6. Value Package (NOVO COMPLETO)
- ➕ value_package_title
- ➕ value_package_image
- ➕ value_package_items (array de objetos)
- ➕ value_package_total_price
- ➕ value_package_sale_price
- ➕ value_package_delivery_text
- ➕ value_package_button_text
- ➕ value_package_whatsapp_group_link
- ➕ value_package_whatsapp_number
- ➕ value_package_stock_text
- ➕ value_package_discount_text
- ➕ value_package_promotion_text

### 7. Story Section (NOVO COMPLETO)
- ➕ story_title
- ➕ story_content
- ➕ story_image

### 8. About Us Section (NOVO COMPLETO)
- ➕ about_us_title
- ➕ about_us_description
- ➕ about_us_store_image
- ➕ about_us_founders_image
- ➕ about_us_location

### 9. Social Proof (NOVO COMPLETO)
- ➕ social_proof_title
- ➕ social_proof_google_icon (boolean)
- ➕ social_proof_allow_photos (boolean)
- ➕ social_proof_testimonial_count

### 10. Contact Section (Manter)
- ✅ contact_title (já existe)
- ✅ contact_description (já existe)

## Estratégia de Implementação

1. Expandir interface `LandingSettings` com TODOS os campos
2. Atualizar `loadSettings` para carregar todos os campos do banco
3. Atualizar `handleSave` para salvar todos os campos
4. Adicionar seções no formulário para cada grupo de campos
5. Corrigir bug de salvamento do timer_end_date (timezone)

## Próximos Passos

- [x] Criar componentes visuais (FixedTimer, ExitPopup, ValuePackage, etc.)
- [x] Criar SQL com todos os campos
- [ ] Expandir Dashboard com todos os campos editáveis
- [ ] Atualizar página principal com nova ordem
- [ ] Testar salvamento e carregamento

