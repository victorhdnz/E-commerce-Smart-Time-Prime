-- ==========================================
-- Criar tabela para registros WhatsApp VIP
-- ==========================================
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS whatsapp_vip_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_group_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_email ON whatsapp_vip_registrations(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_phone ON whatsapp_vip_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_vip_created_at ON whatsapp_vip_registrations(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE whatsapp_vip_registrations ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (para permitir registro público)
DROP POLICY IF EXISTS "Permitir inserção pública" ON whatsapp_vip_registrations;
CREATE POLICY "Permitir inserção pública"
ON whatsapp_vip_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Política: Apenas admins podem ler (para visualizar no dashboard)
DROP POLICY IF EXISTS "Apenas admins podem ler" ON whatsapp_vip_registrations;
CREATE POLICY "Apenas admins podem ler"
ON whatsapp_vip_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Comentários
COMMENT ON TABLE whatsapp_vip_registrations IS 'Registros para Grupo VIP do WhatsApp';
COMMENT ON COLUMN whatsapp_vip_registrations.name IS 'Nome completo do registrado';
COMMENT ON COLUMN whatsapp_vip_registrations.email IS 'E-mail do registrado';
COMMENT ON COLUMN whatsapp_vip_registrations.phone IS 'Telefone/WhatsApp do registrado';
COMMENT ON COLUMN whatsapp_vip_registrations.whatsapp_group_link IS 'Link do grupo WhatsApp (opcional, pode ser configurado depois)';

