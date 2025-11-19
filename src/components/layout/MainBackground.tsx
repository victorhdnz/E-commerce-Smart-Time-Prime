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

    // Se estiver na página inicial, tornar o main, body e html transparentes
    if (pathname === '/') {
      main.style.backgroundColor = 'transparent'
      if (body) body.style.backgroundColor = 'transparent'
      if (html) html.style.backgroundColor = 'transparent'
    } else {
      main.style.backgroundColor = '#ffffff'
      if (body) body.style.backgroundColor = '#ffffff'
      if (html) html.style.backgroundColor = '#ffffff'
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

