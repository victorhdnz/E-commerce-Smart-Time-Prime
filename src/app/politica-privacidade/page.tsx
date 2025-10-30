import { FadeInSection } from '@/components/ui/FadeInSection'

export default function PoliticaPrivacidade() {
  return (
    <FadeInSection>
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Política de Privacidade</h1>
          <div className="w-24 h-1 bg-black mb-12" />
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Informações que Coletamos</h2>
              <p className="mb-4">
                Coletamos informações que você nos fornece diretamente, como quando cria uma conta, 
                faz uma compra, entra em contato conosco ou se inscreve em nossa newsletter.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone</li>
                <li>Endereço de entrega e faturamento</li>
                <li>Informações de pagamento (processadas de forma segura)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Como Utilizamos Suas Informações</h2>
              <p className="mb-4">Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processar e enviar seus pedidos</li>
                <li>Comunicar-nos com você sobre pedidos, produtos e promoções</li>
                <li>Melhorar nossos serviços e experiência do cliente</li>
                <li>Detectar e prevenir fraudes</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Compartilhamento de Informações</h2>
              <p className="mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto conforme descrito nesta política. Podemos compartilhar informações com:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provedores de serviços que nos ajudam a operar nosso site e processar pedidos</li>
                <li>Autoridades legais quando exigido por lei</li>
                <li>Empresas afiliadas com o mesmo controle acionário</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger 
                suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Seus Direitos</h2>
              <p className="mb-4">Você tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações imprecisas</li>
                <li>Solicitar a exclusão de suas informações</li>
                <li>Opor-se ao processamento de suas informações</li>
                <li>Solicitar a portabilidade de seus dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar 
                o tráfego do site e personalizar conteúdo. Você pode gerenciar suas preferências de 
                cookies nas configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta política de privacidade periodicamente. Notificaremos você 
                sobre mudanças significativas publicando a nova política nesta página e atualizando 
                a data de "Última atualização".
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Contato</h2>
              <p className="mb-2">
                Se você tiver dúvidas sobre esta política de privacidade, entre em contato conosco:
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

