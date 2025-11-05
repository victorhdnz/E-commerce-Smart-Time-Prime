-- Adicionar colunas de configuração do rodapé à tabela site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS copyright_text TEXT;

-- Atualizar valores padrão se necessário
UPDATE site_settings
SET 
  footer_text = COALESCE(footer_text, 'Produtos de qualidade com design moderno e elegante.'),
  copyright_text = COALESCE(copyright_text, 'Todos os direitos reservados.')
WHERE footer_text IS NULL OR copyright_text IS NULL;

