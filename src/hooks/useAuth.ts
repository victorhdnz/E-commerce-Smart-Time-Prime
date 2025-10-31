'use client'

import { useEffect, useState, useMemo } from 'react'
import { getSiteUrl } from '@/lib/utils/siteUrl'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { User as AppUser } from '@/types'

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
        // Verificar se veio do callback de autenticação
        let authSuccess = false
        let returnUrl: string | null = null
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search)
          authSuccess = urlParams.get('auth') === 'success'
          
          // Recuperar returnUrl do localStorage se houver
          returnUrl = localStorage.getItem('auth_return_url')
          if (returnUrl) {
            localStorage.removeItem('auth_return_url')
          }
          
          // Remover parâmetro da URL se existir
          if (authSuccess) {
            const url = new URL(window.location.href)
            url.searchParams.delete('auth')
            window.history.replaceState({}, '', url.toString())
            // Aguardar mais tempo em produção para garantir que a sessão foi estabelecida
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        // Primeiro verificar se há uma sessão (isso não lança erro se não houver sessão)
        // Tentar múltiplas vezes em caso de problemas de sincronização
        let session = null
        let sessionError = null
        let attempts = 0
        const maxAttempts = 3
        
        while (attempts < maxAttempts && !session && mounted) {
          const { data, error } = await supabase.auth.getSession()
          session = data.session
          sessionError = error
          
          if (!session && attempts < maxAttempts - 1) {
            // Aguardar um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 300))
          }
          attempts++
        }
        
        if (!mounted) return
        
        // Não redirecionar aqui - deixar a página de login fazer isso
        // Isso evita loops de redirecionamento
        
        // Se veio do callback e não há sessão, tentar refresh
        if (authSuccess && (!session || sessionError)) {
          await supabase.auth.refreshSession()
          const { data: { session: newSession } } = await supabase.auth.getSession()
          if (newSession?.user) {
            setUser(newSession.user)
            
            // Buscar perfil (ou criar se não existir)
            let profile = null
            const { data: fetchedProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single()
            
            if (!mounted) return

            if (profileError?.code === 'PGRST116') {
              // Profile não existe, criar
              profile = await ensureProfileExists(
                newSession.user.id,
                newSession.user.email || '',
                newSession.user.user_metadata
              )
            } else if (fetchedProfile) {
              profile = fetchedProfile as AppUser
            }
            
            setProfile(profile)
            setLoading(false)
            return
          }
        }
        
        // Se há sessão, usar getUser (mais confiável quando há sessão)
        if (session?.user) {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (!mounted) return
          
          if (userError && userError.message !== 'Auth session missing!') {
            console.error('Erro ao buscar usuário:', userError)
          }
          
          setUser(user || session.user)

          if (user || session.user) {
            const currentUser = user || session.user
            const userId = currentUser.id
            // Buscar perfil sempre atualizado (sem cache)
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()

            if (!mounted) return
            
            if (profileError?.code === 'PGRST116') {
              // Profile não existe, criar
              const newProfile = await ensureProfileExists(
                userId,
                currentUser.email || '',
                currentUser.user_metadata
              )
              setProfile(newProfile)
            } else if (profileError) {
              console.error('Erro ao buscar perfil:', profileError)
              setProfile(null)
            } else {
              setProfile(profile as AppUser || null)
            }
          } else {
            setProfile(null)
          }
        } else {
          // Não há sessão - estado normal para usuário não logado
          setUser(null)
          setProfile(null)
        }
      } catch (error: any) {
        // Ignorar erros de sessão faltando (é normal quando não há sessão)
        if (error?.message?.includes('Auth session missing') || error?.message?.includes('Auth session missing!')) {
          setUser(null)
          setProfile(null)
        } else {
          console.error('Erro inesperado ao buscar usuário:', error)
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
        
        // Não logar eventos INITIAL_SESSION quando não há sessão (é normal)
        if (event !== 'INITIAL_SESSION' || session?.user) {
          // Log apenas eventos importantes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('Auth:', event)
        }
        }
        
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
              console.error('Erro ao buscar perfil no auth change:', profileError)
              if (mounted) {
                setProfile(null)
              }
            } else {
              if (mounted) {
                setProfile(profile as AppUser || null)
              }
            }
          } catch (error) {
            if (!mounted) return
            console.error('Erro ao buscar perfil:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
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

  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin'

  return {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    isAdmin,
    isEditor,
    isAuthenticated: !!user,
  }
}

