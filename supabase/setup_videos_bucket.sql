-- ==========================================
-- CONFIGURAR SUPABASE STORAGE BUCKET PARA VÍDEOS
-- ==========================================

-- Nota: O bucket "videos" deve ser criado manualmente no Supabase Dashboard
-- Storage → New Bucket → Nome: videos (PUBLIC)

-- RLS POLICIES PARA BUCKET: videos
-- Permitir upload de vídeos (apenas admins/editors)
DROP POLICY IF EXISTS "Admins podem fazer upload em videos" ON storage.objects;
CREATE POLICY "Admins podem fazer upload em videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);

-- Permitir que todos vejam os vídeos (bucket público)
DROP POLICY IF EXISTS "Todos podem ver vídeos" ON storage.objects;
CREATE POLICY "Todos podem ver vídeos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Permitir que admins deletem vídeos
DROP POLICY IF EXISTS "Admins podem deletar de videos" ON storage.objects;
CREATE POLICY "Admins podem deletar de videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' 
  AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);

-- Permitir que admins atualizem vídeos
DROP POLICY IF EXISTS "Admins podem atualizar videos" ON storage.objects;
CREATE POLICY "Admins podem atualizar videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' 
  AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor'))
);

