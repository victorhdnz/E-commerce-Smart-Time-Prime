-- ==========================================
-- Inserir Link do Grupo VIP do WhatsApp
-- ==========================================
-- Execute este script no SQL Editor do Supabase

INSERT INTO site_settings (key, value, description, updated_at)
VALUES (
  'whatsapp_vip_group_link',
  'https://chat.whatsapp.com/EVPNbUpwsjW7FMlerVRDqo?mode=wwt',
  'Link do Grupo VIP do WhatsApp',
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

