-- Inserir FAQs padrão no banco de dados

INSERT INTO faqs (question, answer, order_position, is_active) VALUES
('Como faço para comprar um produto?', 'Navegue por nossa página de produtos, escolha o item desejado e clique em "Adicionar ao Carrinho". Depois, finalize o pedido na página de checkout.', 1, true),
('Quais são as formas de pagamento aceitas?', 'Aceitamos cartões de crédito (em até 12x), débito, PIX e boleto bancário. Todos os pagamentos são processados de forma segura.', 2, true),
('Qual o prazo de entrega?', 'O prazo de entrega varia conforme sua localização. Para grandes centros urbanos, geralmente entre 3 a 7 dias úteis. Você receberá um código de rastreamento por e-mail após a postagem.', 3, true),
('Posso trocar ou devolver um produto?', 'Sim! Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução. O produto deve estar na embalagem original e sem uso. Consulte nossa política completa na página "Trocas e Devoluções".', 4, true),
('Os produtos têm garantia?', 'Sim, todos os nossos produtos possuem garantia do fabricante. O prazo e condições variam conforme o produto e estão especificados na descrição de cada item.', 5, true),
('Como entro em contato com o suporte?', 'Você pode entrar em contato conosco pelo WhatsApp (34) 98413-6291, pelo e-mail contato@smarttimeprime.com.br ou através da página de contato no site. Nossos horários de atendimento são: Segunda a Sexta das 09:00 às 20:00 e Sábado das 09:00 às 19:00.', 6, true)
ON CONFLICT DO NOTHING;

