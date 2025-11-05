-- Tabela para armazenar termos e políticas do site

CREATE TABLE IF NOT EXISTS site_terms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT DEFAULT 'file-text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_site_terms_key ON site_terms(key);

-- RLS Policies
ALTER TABLE site_terms ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos
CREATE POLICY "Allow read access for all users" ON site_terms
  FOR SELECT USING (true);

-- Permitir inserção/atualização apenas para admins e editors
CREATE POLICY "Allow insert for authenticated users with editor or admin role" ON site_terms
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin')
  );

CREATE POLICY "Allow update for authenticated users with editor or admin role" ON site_terms
  FOR UPDATE USING (
    auth.role() = 'authenticated' 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor', 'admin')
  );

CREATE POLICY "Allow delete for authenticated users with admin role" ON site_terms
  FOR DELETE USING (
    auth.role() = 'authenticated' 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_site_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_terms_updated_at
  BEFORE UPDATE ON site_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_site_terms_updated_at();

