'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FAQ } from '@/types'
import SpotlightCard from '@/components/ui/SpotlightCard/SpotlightCard'

interface FAQSectionProps {
  faqs: FAQ[]
  title?: string
  backgroundColor?: string
  elementVisibility?: {
    title?: boolean
  }
}

export const FAQSection = ({
  faqs,
  title = 'Perguntas Frequentes',
  backgroundColor = '#ffffff',
  elementVisibility = {
    title: true,
  },
}: FAQSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20" style={{ backgroundColor: 'transparent' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {elementVisibility.title !== false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">{title}</h2>
            <div className="w-24 h-1 bg-white mx-auto" />
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <SpotlightCard
                className="border-white/20 bg-white/10 backdrop-blur-sm p-0 overflow-visible"
                spotlightColor="rgba(255, 255, 255, 0.15)"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-left text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-white"
                  >
                    <ChevronDown size={24} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-white/5 backdrop-blur-sm text-white/90 border-t border-white/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

