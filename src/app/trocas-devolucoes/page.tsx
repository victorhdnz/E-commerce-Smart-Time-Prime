import { FadeInSection } from '@/components/ui/FadeInSection'

export default function TrocasDevolucoes() {
  return (
    <FadeInSection>
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Trocas e Devoluções</h1>
          <div className="w-24 h-1 bg-black mb-12" />
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Prazo para Trocas e Devoluções</h2>
              <p className="mb-4">
                Você tem até <strong>7 (sete) dias corridos</strong>, a contar da data de recebimento do produto, 
                para solicitar troca ou devolução, conforme estabelecido pelo Código de Defesa do Consumidor (CDC).
              </p>
              <p>
                Para produtos com defeito ou que não correspondam às especificações do pedido, 
                o prazo é de <strong>90 dias</strong> a partir da data de recebimento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Condições para Trocas</h2>
              <p className="mb-4">Para que seja aceita a troca, o produto deve:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Estar em sua embalagem original</li>
                <li>Não ter sido utilizado ou apresentar sinais de uso</li>
                <li>Conter todos os acessórios e manuais que acompanham o produto</li>
                <li>Possuir todas as etiquetas originais</li>
                <li>Estar sem avarias ou danos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Produtos Não Elegíveis para Troca</h2>
              <p className="mb-4">Não aceitamos trocas ou devoluções de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Produtos personalizados ou sob medida</li>
                <li>Produtos usados ou sem embalagem original</li>
                <li>Produtos danificados por uso inadequado</li>
                <li>Produtos sem nota fiscal ou comprovante de compra</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Como Solicitar Troca ou Devolução</h2>
              <p className="mb-4">Para solicitar troca ou devolução, você pode:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Entrar em contato pelo WhatsApp: (34) 98413-6291</li>
                <li>Enviar um e-mail para: contato@smarttimeprime.com.br</li>
                <li>Acessar sua conta no site e abrir um chamado</li>
              </ul>
              <p className="mt-4">
                Em sua solicitação, informe o número do pedido, motivo da troca/devolução e, 
                se possível, envie fotos do produto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Processo de Troca</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Após aprovação da solicitação, enviaremos um código de postagem</li>
                <li>Você deve enviar o produto de volta em até 5 dias úteis</li>
                <li>O produto será inspecionado em até 5 dias úteis após o recebimento</li>
                <li>Após aprovação, enviaremos o produto de substituição ou o reembolso</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Custos de Frete</h2>
              <p className="mb-4">
                <strong>Caso de troca por arrependimento:</strong> Os custos de frete de retorno 
                são de responsabilidade do cliente. O frete do novo produto será por nossa conta.
              </p>
              <p>
                <strong>Caso de produto com defeito ou erro no pedido:</strong> Todos os custos 
                de frete são de nossa responsabilidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Reembolso</h2>
              <p className="mb-4">
                O reembolso será processado usando o mesmo método de pagamento utilizado na compra original.
              </p>
              <p className="mb-4">
                <strong>Cartão de Crédito:</strong> O crédito aparecerá na sua fatura em até 2 faturas.
              </p>
              <p>
                <strong>PIX ou Boleto:</strong> O reembolso será realizado em até 10 dias úteis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Produtos com Defeito</h2>
              <p className="mb-4">
                Se você receber um produto com defeito de fabricação ou que não corresponda à descrição:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Entre em contato conosco imediatamente</li>
                <li>Não utilize o produto para evitar maiores danos</li>
                <li>Envie fotos detalhadas do defeito</li>
                <li>Iremos trocar o produto ou realizar o reembolso completo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Garantia</h2>
              <p>
                Todos os produtos possuem garantia do fabricante conforme especificado em cada item. 
                A garantia cobre defeitos de fabricação e funciona independentemente da política de 
                trocas e devoluções.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Contato</h2>
              <p className="mb-2">
                Dúvidas sobre trocas e devoluções? Entre em contato:
              </p>
              <p className="mb-2">
                <strong>WhatsApp:</strong> (34) 98413-6291
              </p>
              <p className="mb-2">
                <strong>Email:</strong> contato@smarttimeprime.com.br
              </p>
              <p>
                <strong>Horário de Atendimento:</strong> Segunda a Sexta das 09:00 às 20:00, 
                Sábado das 09:00 às 19:00
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

