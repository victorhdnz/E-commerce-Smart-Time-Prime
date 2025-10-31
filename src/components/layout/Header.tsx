'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'

export const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, profile, loading } = useAuth()
  const { getItemCount } = useCart()
  const itemCount = getItemCount()



  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Sobre', href: '#sobre' },
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
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold">Smart Time Prime</span>
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
            {loading ? (
              <div className="w-10 h-10 animate-pulse bg-gray-200 rounded-full"></div>
            ) : isAuthenticated && profile ? (
              <Link
                href="/minha-conta"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Minha Conta"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm">Entrar</Button>
              </Link>
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

