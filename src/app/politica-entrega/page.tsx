import { FadeInSection } from '@/components/ui/FadeInSection'

export default function PoliticaEntrega() {
  return (
    <FadeInSection>
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Política de Entrega</h1>
          <div className="w-24 h-1 bg-black mb-12" />
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Prazos de Entrega</h2>
              <p className="mb-4">
                O prazo de entrega começa a contar a partir da confirmação do pagamento e 
                processamento do pedido. Os prazos estimados são:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Grandes Centros Urbanos:</strong> 3 a 7 dias úteis</li>
                <li><strong>Demais Regiões:</strong> 7 a 15 dias úteis</li>
                <li><strong>Regiões Remotas:</strong> 15 a 20 dias úteis</li>
              </ul>
              <p className="mt-4">
                Os prazos podem variar em períodos promocionais, datas comemorativas ou 
                situações de força maior.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Opções de Entrega</h2>
              <p className="mb-4">Oferecemos as seguintes modalidades de entrega:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>PAC:</strong> Entrega econômica para todo o Brasil</li>
                <li><strong>SEDEX:</strong> Entrega expressa com rastreamento detalhado</li>
                <li><strong>Entrega Local:</strong> Para clientes de Uberlândia e região</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Cálculo do Frete</h2>
              <p className="mb-4">
                O valor do frete é calculado com base em:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Peso do produto</li>
                <li>Dimensões da embalagem</li>
                <li>Local de entrega (CEP)</li>
                <li>Modalidade de entrega escolhida</li>
              </ul>
              <p className="mt-4">
                O frete é calculado automaticamente no momento da finalização do pedido, 
                antes do pagamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Rastreamento</h2>
              <p className="mb-4">
                Após a postagem, você receberá por e-mail:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Código de rastreamento</li>
                <li>Link para acompanhar o envio</li>
                <li>Previsão de entrega atualizada</li>
              </ul>
              <p className="mt-4">
                Você também pode acompanhar o status do pedido através da sua conta no site, 
                na seção "Meus Pedidos".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Confirmação de Entrega</h2>
              <p className="mb-4">
                Para garantir a segurança de sua compra, a entrega requer:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Assinatura de pessoa autorizada no endereço informado</li>
                <li>Apresentação de documento de identidade</li>
                <li>Verificação do CEP de entrega</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Tentativas de Entrega</h2>
              <p className="mb-4">
                A transportadora realizará até <strong>3 tentativas de entrega</strong> em dias úteis e horários comerciais.
              </p>
              <p>
                Se após as 3 tentativas o produto não for entregue, ele será devolvido ao centro 
                de distribuição e você será notificado. O pedido poderá ser reagendado ou 
                direcionado a outra localidade mediante contato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Endereço de Entrega</h2>
              <p className="mb-4">
                É de sua responsabilidade informar um endereço completo e correto. 
                Verifique cuidadosamente:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>CEP correto</li>
                <li>Rua, número e complemento</li>
                <li>Bairro e cidade</li>
                <li>Referências para facilitar a localização</li>
              </ul>
              <p className="mt-4">
                Caso o endereço esteja incorreto e o produto seja devolvido, 
                o reenvio terá custos adicionais de frete por conta do cliente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Atrasos na Entrega</h2>
              <p>
                Em caso de atraso na entrega além do prazo estimado, entre em contato conosco 
                imediatamente. Trabalhamos em parceria com as transportadoras para resolver 
                qualquer problema e garantir que seu pedido chegue em segurança.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Entrega para Terceiros</h2>
              <p>
                Caso autorize a entrega para um terceiro (porteiro, vizinho, etc.), 
                esta pessoa deve estar devidamente autorizada e apresentar documento de 
                identidade. A Smart Time Prime não se responsabiliza por problemas decorrentes 
                de entregas realizadas a terceiros não autorizados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Produtos Avariados na Entrega</h2>
              <p className="mb-4">
                Se o produto chegar avariado ou com embalagem comprometida:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Não aceite a entrega ou registre uma observação na nota de entrega</li>
                <li>Tire fotos da embalagem e do produto</li>
                <li>Entre em contato conosco imediatamente</li>
                <li>Enviaremos um produto novo sem custos adicionais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Frete Grátis</h2>
              <p>
                Oferecemos frete grátis para compras acima de determinado valor, 
                conforme as campanhas promocionais em vigor. O valor mínimo para frete grátis 
                e as condições específicas são informados na página do produto e no carrinho de compras.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Contato</h2>
              <p className="mb-2">
                Dúvidas sobre entregas? Entre em contato:
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

