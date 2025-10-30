'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
import { FAQ } from '@/types'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation'

export default function DashboardFAQPage() {
  const router = useRouter()
  const { isAuthenticated, isEditor, loading: authLoading } = useAuth()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  })

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isEditor)) {
      router.push('/')
    } else if (isAuthenticated && isEditor) {
      loadFaqs()
    }
  }, [isAuthenticated, isEditor, authLoading])

  const loadFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_position', { ascending: true })

      if (error) throw error
      setFaqs(data as FAQ[])
    } catch (error) {
      toast.error('Erro ao carregar FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq)
      setFormData({
        question: faq.question,
        answer: faq.answer,
      })
    } else {
      setEditingFaq(null)
      setFormData({
        question: '',
        answer: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveFaq = async () => {
    if (!formData.question || !formData.answer) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      if (editingFaq) {
        // Atualizar FAQ existente
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', editingFaq.id)

        if (error) throw error
        toast.success('FAQ atualizada')
      } else {
        // Criar nova FAQ
        const { error } = await supabase.from('faqs').insert({
          ...formData,
          order_position: faqs.length,
        })

        if (error) throw error
        toast.success('FAQ criada')
      }

      setIsModalOpen(false)
      loadFaqs()
    } catch (error) {
      toast.error('Erro ao salvar FAQ')
    }
  }

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta FAQ?')) return

    try {
      const { error } = await supabase.from('faqs').delete().eq('id', faqId)

      if (error) throw error
      toast.success('FAQ excluída')
      loadFaqs()
    } catch (error) {
      toast.error('Erro ao excluir FAQ')
    }
  }

  const toggleFaqStatus = async (faqId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !currentStatus })
        .eq('id', faqId)

      if (error) throw error
      toast.success('Status atualizado')
      loadFaqs()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <DashboardNavigation
          title="Perguntas Frequentes"
          subtitle={`${faqs.length} FAQs cadastradas`}
          backUrl="/dashboard"
          backLabel="Voltar ao Dashboard"
        />

        <div className="flex justify-end mb-8">
          <Button size="lg" onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" />
            Nova FAQ
          </Button>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <button className="cursor-move text-gray-400 hover:text-gray-600 mt-1">
                  <GripVertical size={20} />
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={faq.is_active}
                          onChange={() =>
                            toggleFaqStatus(faq.id, faq.is_active)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                      <button
                        onClick={() => handleOpenModal(faq)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-2xl font-semibold mb-2">Nenhuma FAQ cadastrada</h3>
              <p className="text-gray-600 mb-6">
                Comece adicionando sua primeira pergunta frequente
              </p>
              <Button onClick={() => handleOpenModal()}>
                <Plus size={20} className="mr-2" />
                Adicionar FAQ
              </Button>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingFaq ? 'Editar FAQ' : 'Nova FAQ'}
        >
          <div className="space-y-4">
            <Input
              label="Pergunta"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Ex: Como funciona a garantia?"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resposta
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Digite a resposta..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveFaq} className="flex-1">
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

