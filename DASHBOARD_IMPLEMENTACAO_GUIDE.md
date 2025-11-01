# Guia de Implementação do Dashboard Completo

## ✅ O que já foi criado

1. ✅ **SQL Script** - `supabase/add_black_friday_landing_fields.sql` - Adiciona todos os 70+ campos ao banco
2. ✅ **Componentes Visuais**:
   - FixedTimer.tsx
   - ExitPopup.tsx
   - ValuePackage.tsx
   - StorySection.tsx
   - AboutUsSection.tsx
   - HeroSection.tsx (atualizado)
   - MediaShowcase.tsx (atualizado com features)
   - SocialProof.tsx (atualizado com Google icon e fotos)

## 📝 O que precisa ser feito no Dashboard

O arquivo `src/app/dashboard/landing/page.tsx` precisa ser expandido para incluir TODOS os campos. Segue o exemplo de como adicionar cada seção:

### 1. Expandir Interface `LandingSettings`

```typescript
interface LandingSettings {
  // Hero (expandir)
  hero_title: string
  hero_subtitle: string
  hero_badge_text: string
  hero_cta_text: string
  hero_cta_link: string
  hero_bg_color: string
  hero_text_color: string
  hero_images: string[] // array de 4
  
  // Timer (já existe, corrigir bug)
  timer_title: string
  timer_end_date: string
  timer_bg_color: string
  timer_text_color: string
  
  // Fixed Timer (novo)
  fixed_timer_bg_color: string
  fixed_timer_text_color: string
  
  // Exit Popup (novo)
  exit_popup_title: string
  exit_popup_message: string
  exit_popup_button_text: string
  exit_popup_whatsapp_number: string
  
  // Media Showcase (expandir)
  media_showcase_title: string
  media_showcase_features: Array<{icon: string, text: string}>
  showcase_image_1: string
  showcase_image_2: string
  showcase_image_3: string
  showcase_image_4: string
  showcase_video_url: string
  
  // Value Package (novo completo)
  value_package_title: string
  value_package_image: string
  value_package_items: Array<{name: string, price: string}>
  value_package_total_price: string
  value_package_sale_price: string
  value_package_delivery_text: string
  value_package_button_text: string
  value_package_whatsapp_group_link: string
  value_package_whatsapp_number: string
  value_package_stock_text: string
  value_package_discount_text: string
  value_package_promotion_text: string
  
  // Story (novo)
  story_title: string
  story_content: string
  story_image: string
  
  // About Us (novo)
  about_us_title: string
  about_us_description: string
  about_us_store_image: string
  about_us_founders_image: string
  about_us_location: string
  
  // Social Proof (novo)
  social_proof_title: string
  social_proof_google_icon: boolean
  social_proof_allow_photos: boolean
  social_proof_testimonial_count: string
  
  // Contact (manter)
  contact_title: string
  contact_description: string
  
  // About antigo (manter compatibilidade)
  about_title: string
  about_description: string
  about_image: string
  
  // Theme (remover ou manter?)
  theme_colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
}
```

### 2. Atualizar `loadSettings` 

Adicionar todos os campos novos no `loadSettings`, com fallbacks para valores padrão do SQL.

### 3. Atualizar `handleSave`

O `handleSave` já está preparado para salvar tudo em JSONB, mas precisa garantir que todos os campos sejam incluídos.

### 4. Adicionar Seções no Formulário

Cada seção precisa ter seus inputs no formulário. Exemplo para Value Package:

```tsx
{/* Value Package Section */}
<motion.div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold mb-6">Pacote de Valor</h2>
  
  <Input
    label="Título"
    value={settings.value_package_title}
    onChange={(e) => setSettings({...settings, value_package_title: e.target.value})}
  />
  
  <ImageUploader
    value={settings.value_package_image}
    onChange={(url) => setSettings({...settings, value_package_image: url})}
  />
  
  {/* Items Array - precisa de componente para editar array */}
  <div>
    <label>Itens do Pacote</label>
    {settings.value_package_items?.map((item, idx) => (
      <div key={idx} className="flex gap-2">
        <Input
          value={item.name}
          onChange={(e) => {
            const items = [...settings.value_package_items]
            items[idx].name = e.target.value
            setSettings({...settings, value_package_items: items})
          }}
        />
        <Input
          value={item.price}
          onChange={(e) => {
            const items = [...settings.value_package_items]
            items[idx].price = e.target.value
            setSettings({...settings, value_package_items: items})
          }}
        />
      </div>
    ))}
  </div>
  
  {/* ... todos os outros campos ... */}
</motion.div>
```

### 5. Corrigir Bug do Timer

O bug de salvamento do `timer_end_date` já foi parcialmente corrigido (linhas 176-204), mas pode precisar de ajuste para timezone. O formato datetime-local retorna "YYYY-MM-DDTHH:mm" sem timezone, e precisa ser convertido para ISO.

## 📊 Estrutura do Formulário

Ordem sugerida no Dashboard:
1. Hero Section (expandida)
2. Timer Section
3. Fixed Timer
4. Exit Popup
5. Media Showcase (expandida)
6. Value Package
7. Story Section
8. About Us Section
9. Social Proof
10. Contact Section

## ⚠️ Importante

- **Arrays** (hero_images, media_showcase_features, value_package_items) precisam de componentes de edição de arrays
- **Booleanos** (social_proof_google_icon, social_proof_allow_photos) precisam de checkboxes
- **Imagens** já têm ImageUploader funcionando
- **Textos longos** precisam de textarea

## 🚀 Próximos Passos

1. Executar o SQL primeiro
2. Expandir a interface LandingSettings
3. Atualizar loadSettings
4. Adicionar seções no formulário uma por uma
5. Testar salvamento
6. Atualizar página principal (page.tsx) com nova ordem de seções

