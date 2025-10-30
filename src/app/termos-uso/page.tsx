import { FadeInSection } from '@/components/ui/FadeInSection'

export default function TermosUso() {
  return (
    <FadeInSection>
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Termos de Uso</h1>
          <div className="w-24 h-1 bg-black mb-12" />
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar este site, você concorda em cumprir e estar vinculado aos 
                seguintes termos e condições de uso. Se você não concorda com alguma parte destes 
                termos, não deve utilizar nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Uso do Site</h2>
              <p className="mb-4">Você concorda em usar este site apenas para fins legais e de acordo com estes termos:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Não utilizar o site de forma fraudulenta ou enganosa</li>
                <li>Não realizar atividades que possam danificar, desabilitar ou sobrecarregar o site</li>
                <li>Não tentar obter acesso não autorizado a áreas restritas do site</li>
                <li>Não usar o site para transmitir qualquer material malicioso ou prejudicial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Conta do Usuário</h2>
              <p className="mb-4">
                Ao criar uma conta, você é responsável por manter a segurança de sua senha e 
                por todas as atividades que ocorram sob sua conta. Você concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a confidencialidade de sua senha</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Produtos e Preços</h2>
              <p className="mb-4">
                Nos esforçamos para fornecer informações precisas sobre produtos e preços. No entanto:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reservamos o direito de corrigir erros de preços a qualquer momento</li>
                <li>Os preços estão sujeitos a alterações sem aviso prévio</li>
                <li>As imagens dos produtos são apenas ilustrativas</li>
                <li>Podemos limitar as quantidades de produtos por pessoa ou por pedido</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Pagamentos</h2>
              <p className="mb-4">
                Aceitamos diversos métodos de pagamento. Ao fazer um pedido, você concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações de pagamento precisas e atualizadas</li>
                <li>Autorizar o uso de seu método de pagamento selecionado</li>
                <li>Reconhecer que os pagamentos são processados por processadores terceirizados seguros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo deste site, incluindo textos, gráficos, logotipos, ícones, imagens, 
                clipes de áudio e software, é propriedade da Smart Time Prime ou de seus fornecedores 
                de conteúdo e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Limitação de Responsabilidade</h2>
              <p>
                Em nenhuma circunstância a Smart Time Prime será responsável por danos indiretos, 
                incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados, 
                uso ou outras perdas intangíveis, resultantes do uso ou incapacidade de usar o site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Alterações nos Termos</h2>
              <p>
                Reservamos o direito de modificar estes termos a qualquer momento. As alterações 
                entrarão em vigor imediatamente após sua publicação no site. É sua responsabilidade 
                revisar periodicamente estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Lei Aplicável</h2>
              <p>
                Estes termos são regidos e interpretados de acordo com as leis do Brasil. 
                Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Contato</h2>
              <p className="mb-2">
                Se você tiver dúvidas sobre estes termos de uso, entre em contato conosco:
              </p>
              <p className="mb-2">
                <strong>Email:</strong> contato@smarttimeprime.com.br
              </p>
              <p>
                <strong>Telefone:</strong> (34) 98413-6291
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeInSection>
  )
}

