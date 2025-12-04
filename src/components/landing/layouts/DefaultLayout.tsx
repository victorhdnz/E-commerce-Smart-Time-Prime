'use client'

import { LandingLayout, LandingVersion } from '@/types'

interface DefaultLayoutProps {
  layout: LandingLayout
  version: LandingVersion | null
  sectionsConfig: Record<string, any>
  landingSettings?: any
}

export function DefaultLayout({ 
  layout, 
  version, 
  sectionsConfig,
  landingSettings 
}: DefaultLayoutProps) {
  // O layout padrão usa a página principal existente
  // Por enquanto, mostramos uma mensagem informativa
  // Em produção, isso redirecionaria para a home ou carregaria os componentes dinamicamente
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {layout.name}
        </h1>
        {layout.description && (
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {layout.description}
          </p>
        )}
        {version && (
          <div className="mb-8">
            <span className="px-4 py-2 bg-black text-white rounded-full text-sm">
              Versão: {version.name}
            </span>
          </div>
        )}
        
        <div className="mt-12 p-8 bg-gray-50 rounded-2xl max-w-xl mx-auto">
          <p className="text-gray-600 mb-4">
            Este é o Layout Padrão. Configure o conteúdo no dashboard.
          </p>
          <p className="text-sm text-gray-500">
            URL: /lp/{layout.slug}{version ? `/${version.slug}` : ''}
          </p>
        </div>

        {/* Mostrar cores do tema */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cores do Tema</h2>
          <div className="flex justify-center gap-4">
            {Object.entries((layout.theme_colors as any) || {}).map(([key, value]) => (
              <div key={key} className="text-center">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 mx-auto mb-2"
                  style={{ backgroundColor: value as string }}
                />
                <span className="text-xs text-gray-500 capitalize">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
