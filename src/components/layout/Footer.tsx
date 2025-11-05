'use client'

import Link from 'next/link'
import { Instagram, Facebook, Mail, Phone } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white mt-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Smart Time Prime</h3>
            <p className="text-gray-400 mb-4">
              Produtos de qualidade com design moderno e elegante.
            </p>
            <div className="text-gray-400 text-sm space-y-1">
              <p className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  Av. Imbaúba, 1676<br />
                  Chácaras Tubalina e Quartel<br />
                  Uberlândia - MG, 38413-108
                </span>
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/produtos"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="#sobre"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="#contato"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/minha-conta"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Minha Conta
                </Link>
              </li>
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Informações</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/termos"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Termos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} />
                <a href="https://wa.me/5534984136291" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  (34) 98413-6291
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} />
                <a href="mailto:contato@smarttimeprime.com.br" className="hover:text-white transition-colors">
                  contato@smarttimeprime.com.br
                </a>
              </li>
            </ul>

            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.instagram.com/smarttimeprime"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/smarttimeprime/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            © {currentYear} Smart Time Prime. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

