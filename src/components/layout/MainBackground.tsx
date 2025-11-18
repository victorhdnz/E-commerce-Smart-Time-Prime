'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function MainBackground() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    // Se estiver na página inicial, tornar o main transparente
    if (pathname === '/') {
      main.style.backgroundColor = 'transparent'
    } else {
      main.style.backgroundColor = '#ffffff'
    }

    return () => {
      // Limpar estilo ao desmontar
      if (main) {
        main.style.backgroundColor = ''
      }
    }
  }, [pathname])

  return null
}

