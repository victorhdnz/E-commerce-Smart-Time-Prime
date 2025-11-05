'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, GitCompare } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useProductComparison } from '@/hooks/useProductComparison'
import { Button } from '@/components/ui/Button'
import { UserMenu } from './UserMenu'
import { AuthDebug } from './AuthDebug'
import { createClient } from '@/lib/supabase/client'

export const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<{ site_logo?: string; site_name?: string } | null>(null)
  const { isAuthenticated, profile, loading } = useAuth()
  const { getItemCount } = useCart()
  const { products } = useProductComparison()
  const itemCount = getItemCount()
  const comparisonCount = products.length

  // Carregar logo do site
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'general')
          .single()

        if (error) {
          console.error('Erro ao carregar logo:', error)
          return
        }

        if (data?.value) {
          // Se value é uma string JSON, fazer parse
          let parsedValue = data.value
          if (typeof data.value === 'string') {
            try {
              parsedValue = JSON.parse(data.value)
            } catch (e) {
              // Se não for JSON válido, usar como objeto vazio
              parsedValue = {}
            }
          }
          
          if (parsedValue && typeof parsedValue === 'object') {
            setSiteSettings(parsedValue as { site_logo?: string })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar logo:', error)
      }
    }
    loadLogo()

    // Recarregar logo a cada 5 segundos (para atualizar após mudanças no dashboard)
    const interval = setInterval(loadLogo, 5000)
    return () => clearInterval(interval)
  }, [])



  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Sobre', href: '#about-us' },
    { name: 'Termos', href: '/termos' },
    { name: 'Contato', href: '#contato' },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const id = href.substring(1)
      
      // Se não estiver na home, vai pra home primeiro
      if (pathname !== '/') {
        // Salva o ID para rolar depois
        sessionStorage.setItem('scrollToSection', id)
        router.push('/')
      } else {
        // Se já está na home, só rola
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
      setMobileMenuOpen(false)
    }
  }

  // Efeito para rolar após navegação
  useEffect(() => {
    const scrollToSection = sessionStorage.getItem('scrollToSection')
    if (scrollToSection && pathname === '/') {
      setTimeout(() => {
        const element = document.getElementById(scrollToSection)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        sessionStorage.removeItem('scrollToSection')
      }, 500)
    }
  }, [pathname])



  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <AuthDebug />
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 h-16">
            {siteSettings?.site_logo && (
              <Image
                src={siteSettings.site_logo}
                alt="Smart Time Prime"
                width={60}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            )}
            <span className="text-2xl font-bold">{siteSettings?.site_name || 'Smart Time Prime'}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-gray-700 hover:text-black font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Comparison Icon */}
            <Link
              href="/comparar"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <GitCompare size={24} />
              {comparisonCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {comparisonCount}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link
              href="/carrinho"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {!loading && !isAuthenticated ? (
              <Link href="/login">
                <Button size="sm">Entrar</Button>
              </Link>
            ) : (
              <UserMenu />
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

