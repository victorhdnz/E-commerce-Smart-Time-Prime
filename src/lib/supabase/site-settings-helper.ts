/**
 * Helper centralizado para salvar configurações do site_settings
 * Garante que sempre faz merge correto preservando todos os dados existentes
 */

import { createClient } from '@/lib/supabase/client'

interface SaveSettingsOptions {
  /**
   * Campos a serem atualizados (apenas os campos que foram modificados)
   * Campos não incluídos aqui serão preservados do banco
   */
  fieldsToUpdate: Record<string, any>
  
  /**
   * Campos que são arrays/objetos e devem ser preservados do banco se existirem
   * mesmo se o valor local estiver vazio
   */
  arrayObjectFields?: string[]
  
  /**
   * Se true, força atualização mesmo se o valor local estiver vazio
   * (útil para limpar campos intencionalmente)
   */
  forceUpdate?: boolean
}

/**
 * Salva configurações no site_settings fazendo merge seguro
 * Preserva TODOS os dados existentes e atualiza apenas os campos especificados
 */
export async function saveSiteSettings({
  fieldsToUpdate,
  arrayObjectFields = [
    'hero_images', 'hero_banners', 'showcase_images', 'story_images', 
    'about_us_store_images', 'value_package_items', 'media_showcase_features',
    'hero_element_order', 'media_showcase_element_order', 'value_package_element_order',
    'social_proof_element_order', 'story_element_order', 'about_us_element_order',
    'contact_element_order', 'faq_element_order', 'social_proof_reviews'
  ],
  forceUpdate = false
}: SaveSettingsOptions): Promise<{ success: boolean; error?: any }> {
  try {
    const supabase = createClient()
    
    // 1. Buscar dados existentes do banco
    const { data: existing, error: fetchError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'general')
      .maybeSingle()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar dados existentes:', fetchError)
      return { success: false, error: fetchError }
    }

    // 2. Obter valor JSONB existente
    const existingValue: any = existing?.value || {}

    // 3. Criar objeto com merge inteligente
    const mergedValue: any = { ...existingValue } // Começar com TODOS os dados existentes

    // 4. Atualizar apenas os campos especificados, com lógica de preservação
    Object.keys(fieldsToUpdate).forEach(key => {
      const newValue = fieldsToUpdate[key]
      const existingValueForKey = existingValue[key]

      // Se forceUpdate está ativo, sempre atualizar
      if (forceUpdate) {
        mergedValue[key] = newValue
        return
      }

      // Se for um campo array/objeto que deve ser preservado
      if (arrayObjectFields.includes(key)) {
        // Se existe no banco e o valor local está vazio/null, preservar do banco
        if (existingValueForKey !== undefined && existingValueForKey !== null && 
            (newValue === undefined || newValue === null || 
             (Array.isArray(newValue) && newValue.length === 0) ||
             (typeof newValue === 'object' && newValue !== null && Object.keys(newValue).length === 0))) {
          // Preservar valor do banco
          mergedValue[key] = existingValueForKey
        } else {
          // Usar valor novo (pode ser array vazio se foi limpo intencionalmente)
          mergedValue[key] = newValue
        }
      }
      // Se for string vazia mas existe no banco, preservar do banco
      else if (newValue === '' && existingValueForKey !== undefined && existingValueForKey !== null && existingValueForKey !== '') {
        mergedValue[key] = existingValueForKey
      }
      // Se for um valor não vazio, usar o valor novo
      else if (newValue !== undefined && newValue !== null && newValue !== '') {
        mergedValue[key] = newValue
      }
      // Se for boolean (incluindo false), sempre atualizar
      else if (typeof newValue === 'boolean') {
        mergedValue[key] = newValue
      }
      // Se existe no banco e não foi definido no novo valor, preservar
      else if (existingValueForKey !== undefined && existingValueForKey !== null) {
        mergedValue[key] = existingValueForKey
      }
      // Se o novo valor não é undefined/null, usar ele
      else if (newValue !== undefined && newValue !== null) {
        mergedValue[key] = newValue
      }
    })

    // 5. Salvar no banco
    if (existing) {
      // Atualizar registro existente
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          value: mergedValue,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'general')

      if (updateError) {
        console.error('Erro ao atualizar site_settings:', updateError)
        return { success: false, error: updateError }
      }
    } else {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({
          key: 'general',
          value: mergedValue,
          description: 'Configurações gerais do site',
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Erro ao inserir site_settings:', insertError)
        return { success: false, error: insertError }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao salvar site_settings:', error)
    return { success: false, error }
  }
}

/**
 * Busca todas as configurações do site_settings
 */
export async function getSiteSettings(): Promise<{ data: any | null; error: any }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'general')
      .maybeSingle()

    return { data: data?.value || null, error }
  } catch (error: any) {
    console.error('Erro ao buscar site_settings:', error)
    return { data: null, error }
  }
}

