'use client'

import { usePathname } from 'next/navigation'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'

/**
 * Renderiza o WhatsAppFloat apenas em páginas que não sejam landing pages
 * Landing pages têm seus próprios botões WhatsApp configuráveis
 */
export function ConditionalWhatsAppFloat() {
  const pathname = usePathname()
  
  // Não mostrar o botão global nas landing pages (/lp/*)
  const isLandingPage = pathname?.startsWith('/lp/')
  
  if (isLandingPage) {
    return null
  }
  
  return <WhatsAppFloat />
}

