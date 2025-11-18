'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load do Prism para melhor performance
const Prism = dynamic(() => import('@/components/ui/Prism/Prism'), {
  ssr: false,
  loading: () => null
})

export const GlobalBackground = () => {
  const [height, setHeight] = useState('100vh')

  useEffect(() => {
    // Garantir que o background cubra toda a altura do documento
    const updateHeight = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )
      setHeight(`${docHeight}px`)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('scroll', updateHeight)
    
    // Observar mudanças no DOM
    const observer = new MutationObserver(updateHeight)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('scroll', updateHeight)
      observer.disconnect()
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none" 
      style={{ 
        backgroundColor: '#000000',
        width: '100vw',
        height: height,
        minHeight: '100vh',
        position: 'fixed'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.5}
          glow={1}
          transparent={true}
        />
      </div>
    </div>
  )
}

