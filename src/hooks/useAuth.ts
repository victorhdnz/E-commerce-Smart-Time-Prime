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
  // Rastrear se o useEffect já foi executado para evitar múltiplas execuções
  const hasInitializedRef = useRef(false)

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
    // Evitar múltiplas execuções do useEffect
    if (hasInitializedRef.current) {
      return
    }
    hasInitializedRef.current = true

    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let hasCompleted = false

    const getUser = async () => {
      if (!mounted || hasCompleted) return
      
      setLoading(true)
      
      try {
        // Verificar sessão de forma simples
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted || hasCompleted) return
        
        if (session?.user) {
          setUser(session.user)
          
          // Buscar perfil
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!mounted || hasCompleted) return

          if (profileError?.code === 'PGRST116') {
            // Profile não existe, criar (primeiro login)
            try {
              const newProfile = await ensureProfileExists(
                session.user.id,
                session.user.email || '',
                session.user.user_metadata
              )
              if (mounted && !hasCompleted) {
                setProfile(newProfile)
              }
            } catch (createError) {
              console.error('Erro ao criar profile:', createError)
              // Mesmo se falhar ao criar, continuar sem profile para não travar
              if (mounted && !hasCompleted) {
                setProfile(null)
              }
            }
          } else if (profileError) {
            console.error('Erro ao buscar perfil:', profileError)
            if (mounted && !hasCompleted) {
              setProfile(null)
            }
          } else {
            if (mounted && !hasCompleted) {
              setProfile(profile as AppUser || null)
            }
          }
        } else {
          // Não há sessão
          if (mounted && !hasCompleted) {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error: any) {
        console.error('Erro ao buscar sessão:', error)
        if (mounted && !hasCompleted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        // Sempre definir loading como false, mesmo em caso de erro
        if (mounted && !hasCompleted) {
          hasCompleted = true
          // Limpar timeout se ainda existir
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          setLoading(false)
        }
      }
    }

    // Timeout de segurança: se passar de 5 segundos, forçar loading = false
    timeoutId = setTimeout(() => {
      if (mounted && !hasCompleted) {
        hasCompleted = true
        console.warn('⚠️ Timeout de autenticação - forçando loading = false')
        setLoading(false)
      }
    }, 5000)

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || hasCompleted) return
        
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

            if (!mounted || hasCompleted) return
            
            if (profileError?.code === 'PGRST116') {
              const newProfile = await ensureProfileExists(
                session.user.id,
                session.user.email || '',
                session.user.user_metadata
              )
              if (mounted && !hasCompleted) {
                setProfile(newProfile)
              }
            } else if (profileError) {
              if (mounted && !hasCompleted) {
                setProfile(null)
              }
            } else {
              if (mounted && !hasCompleted) {
                setProfile(profile as AppUser || null)
              }
            }
          } catch (error) {
            if (mounted && !hasCompleted) {
              setProfile(null)
            }
          }
        } else {
          if (mounted && !hasCompleted) {
            setProfile(null)
          }
        }
      }
    )

    // Cleanup ao desmontar ou quando dependências mudarem
    return () => {
      mounted = false
      hasCompleted = true
      hasInitializedRef.current = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      subscription.unsubscribe()
    }
  }, [supabase, ensureProfileExists]) // Adicionar dependências

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

