'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSiteUrl } from '@/lib/utils/siteUrl'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { User as AppUser } from '@/types'
import { isAdminEmail } from '@/lib/utils/admin'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Função auxiliar para garantir que o profile existe
  const ensureProfileExists = async (userId: string, userEmail: string, userMetadata: any) => {
    try {
      // Verificar se o profile existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      // Se não existe, criar
      if (!existingProfile && checkError?.code === 'PGRST116') {
        console.log('Criando profile para usuário:', userId)
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: userMetadata?.full_name || userMetadata?.name || null,
            avatar_url: userMetadata?.avatar_url || userMetadata?.picture || null,
            role: 'customer'
          })
          .select()
          .single()

        if (insertError) {
          console.error('Erro ao criar profile:', insertError)
          return null
        }

        return newProfile as AppUser
      }

      return existingProfile as AppUser
    } catch (error) {
      console.error('Erro ao garantir profile:', error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    const getUser = async () => {
      if (!mounted) return
      
      setLoading(true)
      
      try {
        // Verificar sessão de forma simples
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          setUser(session.user)
          
          // Buscar perfil
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!mounted) return

          if (profileError?.code === 'PGRST116') {
            // Profile não existe, criar
            const newProfile = await ensureProfileExists(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata
            )
            if (mounted) {
              setProfile(newProfile)
            }
          } else if (profileError) {
            console.error('Erro ao buscar perfil:', profileError)
            if (mounted) {
              setProfile(null)
            }
          } else {
            if (mounted) {
              setProfile(profile as AppUser || null)
            }
          }
        } else {
          // Não há sessão
          setUser(null)
          setProfile(null)
        }
      } catch (error: any) {
        console.error('Erro ao buscar sessão:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      }

      if (mounted) {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        setUser(session?.user ?? null)

        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!mounted) return
            
            if (profileError?.code === 'PGRST116') {
              const newProfile = await ensureProfileExists(
                session.user.id,
                session.user.email || '',
                session.user.user_metadata
              )
              if (mounted) {
                setProfile(newProfile)
              }
            } else if (profileError) {
              if (mounted) {
                setProfile(null)
              }
            } else {
              if (mounted) {
                setProfile(profile as AppUser || null)
              }
            }
          } catch (error) {
            if (mounted) {
              setProfile(null)
            }
          }
        } else {
          if (mounted) {
            setProfile(null)
          }
        }

        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signInWithGoogle = async (returnUrl?: string) => {
    // Salvar returnUrl no localStorage para recuperar após login
    if (returnUrl && typeof window !== 'undefined') {
      localStorage.setItem('auth_return_url', returnUrl)
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    })

    if (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError)
        return
      }

      setProfile(profile as AppUser || null)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Erro ao fazer logout:', error)
        throw error
      }
      
      // Limpar estado local
      setUser(null)
      setProfile(null)
      
      // Recarregar a página para limpar qualquer cache
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setLoading(false)
      throw error
    }
  }

  // Verificar se é admin através do email
  const isAdmin = isAdminEmail(user?.email)
  const isEditor = isAdmin // Admin também é editor

  return {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
    isAdmin,
    isEditor,
    isAuthenticated: !!user,
  }
}

