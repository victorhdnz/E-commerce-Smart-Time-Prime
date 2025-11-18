'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load do Prism para melhor performance
const Prism = dynamic(() => import('@/components/ui/Prism/Prism'), {
  ssr: false,
  loading: () => null
})

export const GlobalBackground = () => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ 
        backgroundColor: '#000000',
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

