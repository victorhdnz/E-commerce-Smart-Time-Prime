'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

interface UserAddress {
  cep: string
  city: string
  state: string
}

export const useUserLocation = () => {
  const { isAuthenticated, profile } = useAuth()
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsAddress, setNeedsAddress] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      setLoading(false)
      setNeedsAddress(true)
      return
    }

    const loadUserAddress = async () => {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('cep, city, state')
          .eq('user_id', profile.id)
          .eq('is_default', true)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar endereço:', error)
        }

        if (data) {
          setUserAddress(data)
          setNeedsAddress(false)
        } else {
          setNeedsAddress(true)
        }
      } catch (error) {
        console.error('Erro ao carregar endereço:', error)
        setNeedsAddress(true)
      } finally {
        setLoading(false)
      }
    }

    loadUserAddress()
  }, [isAuthenticated, profile, supabase])

  const isUberlandia = useMemo(() => {
    if (!userAddress) return false
    const cepNum = parseInt(userAddress.cep.replace(/\D/g, ''))
    return cepNum >= 38400000 && cepNum <= 38419999
  }, [userAddress])

  return {
    userAddress,
    isUberlandia,
    needsAddress,
    loading,
  }
}

