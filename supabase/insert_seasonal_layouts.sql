-- Inserir Layouts Sazonais pré-configurados para datas comemorativas

-- Limpar layouts existentes (se quiser resetar)
-- DELETE FROM seasonal_layouts;

INSERT INTO seasonal_layouts (
  name,
  slug,
  hero_title,
  hero_subtitle,
  hero_cta_text,
  hero_bg_color,
  hero_text_color,
  start_date,
  end_date,
  is_active
) VALUES

-- 1. Pré Black Friday (1-20 de Novembro)
(
  'Pré Black Friday',
  'pre-black-friday',
  '⚡ Esquenta Black Friday',
  'Ofertas especiais já começaram! Não perca as melhores condições do ano',
  'Ver Ofertas Antecipadas',
  '#1a1a1a',
  '#FFD700',
  '2025-11-01',
  '2025-11-20',
  false
),

-- 2. Black Friday (21-30 de Novembro)
(
  'Black Friday',
  'black-friday',
  '🔥 BLACK FRIDAY CHEGOU!',
  'Descontos imperdíveis em produtos selecionados. Aproveite antes que acabe!',
  'Aproveitar Descontos',
  '#000000',
  '#FFD700',
  '2025-11-21',
  '2025-11-30',
  false
),

-- 3. Natal (1-25 de Dezembro)
(
  'Natal',
  'natal',
  '🎄 Especial de Natal',
  'Presenteie com elegância! Ofertas especiais para você celebrar com estilo',
  'Ver Presentes de Natal',
  '#0f4c2c',
  '#ffffff',
  '2025-12-01',
  '2025-12-25',
  false
),

-- 4. Ano Novo (26 Dez - 5 Jan)
(
  'Ano Novo',
  'ano-novo',
  '✨ Comece 2025 com Estilo',
  'Renove seu visual para o novo ano com nossas ofertas especiais',
  'Começar o Ano Novo',
  '#1a237e',
  '#FFD700',
  '2025-12-26',
  '2026-01-05',
  false
),

-- 5. Dia dos Namorados (1-14 de Junho)
(
  'Dia dos Namorados',
  'dia-dos-namorados',
  '💕 Presentes Que Marcam',
  'Surpreenda quem você ama com um presente inesquecível',
  'Presentear Meu Amor',
  '#E91E63',
  '#ffffff',
  '2025-06-01',
  '2025-06-14',
  false
),

-- 6. Páscoa (variável - exemplo Abril)
(
  'Páscoa',
  'pascoa',
  '🐰 Especial de Páscoa',
  'Renove sua coleção nesta Páscoa com ofertas exclusivas',
  'Ver Ofertas de Páscoa',
  '#9C27B0',
  '#FFE082',
  '2025-04-10',
  '2025-04-20',
  false
),

-- 7. Carnaval (Fevereiro/Março)
(
  'Carnaval',
  'carnaval',
  '🎭 Especial de Carnaval',
  'Entre no ritmo da festa com estilo e elegância!',
  'Cair na Folia',
  '#FF6F00',
  '#ffffff',
  '2025-02-20',
  '2025-03-05',
  false
),

-- 8. Dia da Mulher (1-8 de Março)
(
  'Dia da Mulher',
  'dia-da-mulher',
  '👑 Dia da Mulher',
  'Celebre a força e elegância feminina com presentes especiais',
  'Homenagear Mulheres',
  '#E91E63',
  '#ffffff',
  '2025-03-01',
  '2025-03-08',
  false
),

-- 9. Outubro Rosa (Outubro)
(
  'Outubro Rosa',
  'outubro-rosa',
  '🎗️ Outubro Rosa',
  'Juntos na conscientização! Parte das vendas será revertida para a causa',
  'Apoiar a Causa',
  '#E91E63',
  '#ffffff',
  '2025-10-01',
  '2025-10-31',
  false
),

-- 10. Dia das Mães (1-10 de Maio)
(
  'Dia das Mães',
  'dia-das-maes',
  '💐 Dia das Mães',
  'Presentes especiais para quem merece todo o nosso amor e carinho',
  'Presentear Minha Mãe',
  '#FF4081',
  '#ffffff',
  '2025-05-01',
  '2025-05-11',
  false
),

-- 11. Dia dos Pais (1-9 de Agosto)
(
  'Dia dos Pais',
  'dia-dos-pais',
  '👔 Dia dos Pais',
  'Presentes com elegância e sofisticação para o super-herói da família',
  'Presentear Meu Pai',
  '#1565C0',
  '#ffffff',
  '2025-08-01',
  '2025-08-10',
  false
),

-- 12. Dia das Crianças (1-12 de Outubro)
(
  'Dia das Crianças',
  'dia-das-criancas',
  '🎈 Dia das Crianças',
  'Presenteie as crianças com produtos incríveis e especiais',
  'Ver Presentes',
  '#FF6F00',
  '#ffffff',
  '2025-10-01',
  '2025-10-12',
  false
),

-- 13. Aniversário da Loja (ajuste a data conforme necessário)
(
  'Aniversário da Loja',
  'aniversario-loja',
  '🎉 Aniversário Smart Time Prime!',
  'Comemorando junto com você! Ofertas especiais de aniversário',
  'Comemorar Conosco',
  '#FFD700',
  '#000000',
  '2025-01-15',
  '2025-01-31',
  false
)

ON CONFLICT (slug) DO UPDATE SET
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  hero_cta_text = EXCLUDED.hero_cta_text,
  hero_bg_color = EXCLUDED.hero_bg_color,
  hero_text_color = EXCLUDED.hero_text_color,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date;

