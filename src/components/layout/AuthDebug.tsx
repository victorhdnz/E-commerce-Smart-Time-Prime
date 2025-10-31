'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export const AuthDebug = () => {
  const { isAuthenticated, profile, loading, user } = useAuth()

  useEffect(() => {
    console.log('🔍 Auth Debug Status:', {
      loading,
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email,
      profileId: profile?.id,
      profileName: profile?.full_name,
      profileRole: profile?.role,
      hasValidSession: !!user && !!profile
    })
  }, [loading, isAuthenticated, user, profile])

  return null // Componente invisível, apenas para debug
}