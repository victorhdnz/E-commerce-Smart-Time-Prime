'use client'

import dynamic from 'next/dynamic'

// Lazy load do Prism para melhor performance
const Prism = dynamic(() => import('@/components/ui/Prism/Prism'), {
  ssr: false,
  loading: () => null
})

export const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none" style={{ backgroundColor: '#000000' }}>
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
  )
}

