-- ==========================================
-- ADICIONAR COLUNA CONTENT À LANDING_VERSIONS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- Adicionar a coluna content para armazenar o conteúdo completo da versão
ALTER TABLE landing_versions 
ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}';

-- Comentário explicativo
COMMENT ON COLUMN landing_versions.content IS 'Conteúdo completo da landing page (textos, imagens, configurações)';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'landing_versions' 
ORDER BY ordinal_position;

