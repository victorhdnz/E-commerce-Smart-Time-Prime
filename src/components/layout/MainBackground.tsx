'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function MainBackground() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    const body = document.body
    const html = document.documentElement
    
    if (!main) return

    // Se estiver na página inicial, manter branco (cores são definidas por seção)
    if (pathname === '/') {
      main.style.backgroundColor = '#ffffff'
      main.style.background = '#ffffff'
      if (body) {
        body.style.backgroundColor = '#ffffff'
        body.style.background = '#ffffff'
      }
      if (html) {
        html.style.backgroundColor = '#ffffff'
        html.style.background = '#ffffff'
      }
    } else {
      main.style.backgroundColor = '#ffffff'
      main.style.background = '#ffffff'
      if (body) {
        body.style.backgroundColor = '#ffffff'
        body.style.background = '#ffffff'
      }
      if (html) {
        html.style.backgroundColor = '#ffffff'
        html.style.background = '#ffffff'
      }
    }

    return () => {
      // Limpar estilo ao desmontar
      if (main) {
        main.style.backgroundColor = ''
      }
      if (body) {
        body.style.backgroundColor = ''
      }
      if (html) {
        html.style.backgroundColor = ''
      }
    }
  }, [pathname])

  return null
}

