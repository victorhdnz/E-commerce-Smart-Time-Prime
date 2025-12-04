import { createServerClient } from '@/lib/supabase/server'
import { ProductSupportPage } from '@/types'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 10

interface PageProps {
  params: {
    'modelo-slug': string
  }
}

async function getSupportPage(slug: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from('product_support_pages')
      .select(`
        *,
        product:products(*)
      `)
      .eq('model_slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return data as ProductSupportPage & { product: any }
  } catch (error) {
    console.error('Erro ao buscar página de suporte:', error)
    return null
  }
}

export default async function SupportPage({ params }: PageProps) {
  const supportPage = await getSupportPage(params['modelo-slug'])

  if (!supportPage) {
    notFound()
  }

  const content = supportPage.content as any
  const sections = content.sections || []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{supportPage.title}</h1>
          {supportPage.product && (
            <p className="text-lg text-gray-600">{supportPage.product.name}</p>
          )}
        </div>

        <div className="space-y-12">
          {sections.map((section: any, index: number) => (
            <div key={section.id || index} className="border-b pb-8 last:border-b-0">
              {section.type === 'text' && (
                <div>
                  {section.title && (
                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  )}
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content || '' }}
                  />
                </div>
              )}

              {section.type === 'image' && section.image && (
                <div>
                  {section.title && (
                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  )}
                  <img
                    src={section.image}
                    alt={section.title || 'Imagem'}
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {section.type === 'video' && section.video && (
                <div>
                  {section.title && (
                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  )}
                  <div className="aspect-video">
                    <iframe
                      src={section.video}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {section.type === 'list' && section.items && (
                <div>
                  {section.title && (
                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  )}
                  <ul className="space-y-4">
                    {section.items.map((item: any, itemIndex: number) => (
                      <li key={itemIndex} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                          {itemIndex + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.type === 'accordion' && section.items && (
                <div>
                  {section.title && (
                    <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                  )}
                  <div className="space-y-2">
                    {section.items.map((item: any, itemIndex: number) => (
                      <details key={itemIndex} className="border rounded-lg">
                        <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-50">
                          {item.title}
                        </summary>
                        <div className="p-4 pt-0 text-gray-600">
                          {item.description}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Conteúdo em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  )
}

