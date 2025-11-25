'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Plasma = dynamic(() => import('@/components/ui/Plasma/Plasma'), {
  ssr: false,
  loading: () => null
})

export const GlobalBackground = () => {
  const [height, setHeight] = useState('100vh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Aguardar o DOM estar pronto e garantir que o container tenha dimensões
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setMounted(true)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Calcular altura até o footer (excluindo o footer)
    const updateHeight = () => {
      const footer = document.querySelector('footer')
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top + window.scrollY
        // Usar a posição do footer como altura máxima
        setHeight(`${footerTop}px`)
      } else {
        // Se não encontrar o footer, usar altura da viewport
        setHeight('100vh')
      }
    }

    // Aguardar o DOM estar pronto
    const timeoutId = setTimeout(updateHeight, 500)
    updateHeight()
    
    window.addEventListener('resize', updateHeight)
    window.addEventListener('scroll', updateHeight)

    // Observar mudanças no DOM
    const observer = new MutationObserver(() => {
      setTimeout(updateHeight, 100)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('scroll', updateHeight)
      observer.disconnect()
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ 
        width: '100vw',
        height: height,
        zIndex: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: '100vh',
          minWidth: '100vw'
        }}
      >
        <Plasma 
          color="#ff6b35"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.8}
          mouseInteractive={true}
        />
      </div>
    </div>
  )
}

