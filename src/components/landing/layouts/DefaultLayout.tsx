'use client'

import { LandingLayout, LandingVersion } from '@/types'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Importar componentes da landing page
import { HeroSection } from '@/components/landing/HeroSection'
import { MediaShowcase } from '@/components/landing/MediaShowcase'
import { ValuePackage } from '@/components/landing/ValuePackage'
import { SocialProof } from '@/components/landing/SocialProof'
import { StorySection } from '@/components/landing/StorySection'
import { WhatsAppVipRegistration } from '@/components/landing/WhatsAppVipRegistration'
import { AboutUsSection } from '@/components/landing/AboutUsSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { ContactSection } from '@/components/landing/ContactSection'
import { FixedTimer } from '@/components/landing/FixedTimer'
import { ExitPopup } from '@/components/landing/ExitPopup'

interface DefaultLayoutProps {
  layout: LandingLayout
  version: LandingVersion | null
  sectionsConfig: Record<string, any>
  landingSettings?: any
}

export function DefaultLayout({ 
  layout, 
  version, 
  sectionsConfig,
  landingSettings 
}: DefaultLayoutProps) {
  const [settings, setSettings] = useState<any>(null)
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'hero',
    'media_showcase',
    'value_package',
    'social_proof',
    'story',
    'whatsapp_vip',
    'about_us',
    'contact',
    'faq'
  ])
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [version?.id, landingSettings])

  const loadData = async () => {
    try {
      // Usar o conteúdo da versão se existir, senão usar landingSettings
      if (version?.sections_config && Object.keys(version.sections_config as any).length > 0) {
        const versionSettings = version.sections_config as any
        setSettings(versionSettings)
        if (versionSettings.section_order) {
          setSectionOrder(versionSettings.section_order)
        }
      } else if (landingSettings?.value) {
        setSettings(landingSettings.value)
        if (landingSettings.value.section_order) {
          setSectionOrder(landingSettings.value.section_order)
        }
      } else {
        // Fallback: buscar do site_settings
        const { data: siteSettings } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'general')
          .maybeSingle()
        
        if (siteSettings?.value) {
          setSettings(siteSettings.value)
        }

        // Carregar ordem das seções
        const { data: orderData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'landing_section_order')
          .maybeSingle()
        
        if (orderData?.value && Array.isArray(orderData.value)) {
          setSectionOrder(orderData.value)
        }
      }

      // Carregar FAQs
      const { data: faqsData } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true })
      
      if (faqsData) {
        setFaqs(faqsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // Se não tiver settings, mostrar mensagem de configuração
  if (!settings) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {layout.name}
          </h1>
          {layout.description && (
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {layout.description}
            </p>
          )}
          {version && (
            <div className="mb-8">
              <span className="px-4 py-2 bg-black text-white rounded-full text-sm">
                Versão: {version.name}
              </span>
            </div>
          )}
          
          <div className="mt-12 p-8 bg-gray-50 rounded-2xl max-w-xl mx-auto">
            <p className="text-gray-600 mb-4">
              Configure o conteúdo desta versão no dashboard.
            </p>
            <p className="text-sm text-gray-500">
              URL: /lp/{layout.slug}{version ? `/${version.slug}` : ''}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar seções na ordem configurada
  const renderSection = (sectionKey: string) => {
    const isVisible = settings[`section_${sectionKey}_visible`] !== false

    if (!isVisible) return null

    switch (sectionKey) {
      case 'hero':
        return (
          <HeroSection
            key="hero"
            title={settings.hero_title}
            subtitle={settings.hero_subtitle}
            badgeText={settings.hero_badge_text}
            ctaText={settings.hero_cta_text}
            heroButtonText={settings.hero_button_text}
            heroButtonLink={settings.hero_button_link}
            backgroundColor={settings.hero_bg_color}
            textColor={settings.hero_text_color}
            heroImages={settings.hero_images || []}
            heroBanners={settings.hero_banners || []}
            timerEndDate={settings.timer_end_date ? new Date(settings.timer_end_date) : undefined}
            viewerCountEnabled={settings.hero_viewer_count_enabled}
            viewerCountText={settings.hero_viewer_count_text}
          />
        )
      
      case 'media_showcase':
        return (
          <MediaShowcase
            key="media_showcase"
            title={settings.media_showcase_title}
            features={settings.media_showcase_features}
            images={settings.showcase_images || []}
            videoUrl={settings.showcase_video_url}
            videoCaption={settings.showcase_video_caption}
          />
        )
      
      case 'value_package':
        return (
          <ValuePackage
            key="value_package"
            title={settings.value_package_title}
            image={settings.value_package_image}
            items={settings.value_package_items}
            totalPrice={settings.value_package_total_price}
            salePrice={settings.value_package_sale_price}
            deliveryText={settings.value_package_delivery_text}
            buttonText={settings.value_package_button_text}
            buttonLink={settings.value_package_button_link}
            whatsappNumber={settings.value_package_whatsapp_number}
            discountText={settings.value_package_discount_text}
            promotionText={settings.value_package_promotion_text}
            endDate={settings.timer_end_date ? new Date(settings.timer_end_date) : undefined}
          />
        )
      
      case 'social_proof':
        return (
          <SocialProof
            key="social_proof"
            title={settings.social_proof_title}
            reviews={settings.social_proof_reviews || []}
            testimonialCount={settings.social_proof_testimonial_count}
            googleIcon={settings.social_proof_google_icon}
            allowPhotos={settings.social_proof_allow_photos}
          />
        )
      
      case 'story':
        return (
          <StorySection
            key="story"
            title={settings.story_title}
            content={settings.story_content}
            images={settings.story_images || []}
            foundersNames={settings.story_founders_names}
          />
        )
      
      case 'whatsapp_vip':
        return <WhatsAppVipRegistration key="whatsapp_vip" />
      
      case 'about_us':
        return (
          <AboutUsSection
            key="about_us"
            title={settings.about_us_title}
            description={settings.about_us_description}
            storeImages={settings.about_us_store_images || []}
            location={settings.about_us_location}
          />
        )
      
      case 'contact':
        return (
          <ContactSection
            key="contact"
            title={settings.contact_title}
            description={settings.contact_description}
            email={settings.contact_email}
            whatsapp={settings.contact_whatsapp}
            mapsLink={settings.contact_maps_link}
            scheduleWeekdays={settings.contact_schedule_weekdays}
            scheduleSaturday={settings.contact_schedule_saturday}
            scheduleSunday={settings.contact_schedule_sunday}
            locationStreet={settings.contact_location_street}
            locationNeighborhood={settings.contact_location_neighborhood}
            locationCityState={settings.contact_location_city_state}
            locationZip={settings.contact_location_zip}
          />
        )
      
      case 'faq':
        return (
          <FAQSection
            key="faq"
            title={settings.faq_title}
            faqs={faqs}
            backgroundColor={settings.faq_bg_color}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Timer */}
      {settings.timer_enabled && settings.timer_end_date && (
        <FixedTimer
          endDate={new Date(settings.timer_end_date)}
          backgroundColor={settings.fixed_timer_bg_color}
          textColor={settings.fixed_timer_text_color}
        />
      )}

      {/* Renderizar seções na ordem configurada */}
      {sectionOrder.map(sectionKey => renderSection(sectionKey))}

      {/* Exit Popup */}
      {settings.exit_popup_enabled && settings.timer_end_date && (
        <ExitPopup
          endDate={new Date(settings.timer_end_date)}
          title={settings.exit_popup_title}
          message={settings.exit_popup_message}
          buttonText={settings.exit_popup_button_text}
          whatsappNumber={settings.exit_popup_whatsapp_number}
        />
      )}
    </div>
  )
}
