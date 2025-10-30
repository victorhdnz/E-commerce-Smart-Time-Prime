import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Smart Time Prime - Relógios Premium',
  description: 'E-commerce moderno de relógios premium com design elegante e sofisticado.',
  keywords: ['relógios', 'premium', 'smart watch', 'acessórios', 'moda'],
  openGraph: {
    title: 'Smart Time Prime - Relógios Premium',
    description: 'E-commerce moderno de relógios premium com design elegante e sofisticado.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <PageTransition>
          <main className="min-h-screen">
            {children}
          </main>
        </PageTransition>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#000',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}

