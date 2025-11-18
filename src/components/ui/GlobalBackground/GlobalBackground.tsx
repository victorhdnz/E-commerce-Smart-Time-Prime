'use client'

import dynamic from 'next/dynamic'

// Lazy load do Orb para melhor performance
const Orb = dynamic(() => import('@/components/ui/Orb/Orb'), {
  ssr: false,
  loading: () => null
})

export const GlobalBackground = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ 
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        minWidth: '100%',
        minHeight: '100%'
      }}>
        <Orb
          hue={0}
          hoverIntensity={0.5}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>
    </div>
  )
}

