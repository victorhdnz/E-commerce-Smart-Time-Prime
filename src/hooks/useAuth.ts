'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { getSiteUrl } from '@/lib/utils/siteUrl'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { User as AppUser } from '@/types'
import { isAdminEmail } from '@/lib/utils/admin'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  // Criar cliente Supabase uma vez usando useMemo para evitar recriações
  const supabase = useMemo(() => createClient(), [])

  // Função auxiliar para garantir que o profile existe (memoizada)
  const ensureProfileExists = useCallback(async (userId: string, userEmail: string, userMetadata: any) => {
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
  }, [supabase])

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const getUser = async () => {
      if (!mounted) return
      
      setLoading(true)
      
      try {
        // Verificar sessão de forma simples
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          // Atualizar user imediatamente
          setUser(session.user)
          
          // Buscar perfil de forma assíncrona (não bloqueia o loading)
          // Isso permite que a UI seja atualizada rapidamente
          ;(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (!mounted) return

              if (profileError?.code === 'PGRST116') {
                // Profile não existe, criar (primeiro login)
                try {
                  const newProfile = await ensureProfileExists(
                    session.user.id,
                    session.user.email || '',
                    session.user.user_metadata
                  )
                  if (mounted) {
                    setProfile(newProfile)
                  }
                } catch (createError) {
                  console.error('Erro ao criar profile:', createError)
                  // Mesmo se falhar ao criar, continuar sem profile para não travar
                  if (mounted) {
                    setProfile(null)
                  }
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
            } catch (error: any) {
              console.error('Erro ao buscar perfil:', error)
              if (mounted) {
                setProfile(null)
              }
            }
          })()
          
          // Finalizar loading imediatamente após obter a sessão
          // O profile será carregado em background
          if (mounted && timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          if (mounted) {
            setLoading(false)
          }
        } else {
          // Não há sessão
          if (mounted && timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar sessão:', error)
        if (mounted && timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    // Timeout de segurança: se passar de 10 segundos, forçar loading = false
    // Aumentado para 10 segundos para dar mais tempo em conexões lentas
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Timeout de autenticação - forçando loading = false')
        setLoading(false)
        timeoutId = null
      }
    }, 10000)

    getUser().then(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        // Não alterar loading aqui para evitar conflitos
        // Apenas atualizar user e profile
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
      }
    )

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      subscription.unsubscribe()
    }
  }, [supabase, ensureProfileExists]) // eslint-disable-line react-hooks/exhaustive-deps

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

