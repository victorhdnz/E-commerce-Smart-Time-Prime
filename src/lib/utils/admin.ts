/**
 * Lista de emails admin
 */
const ADMIN_EMAILS = [
  'victorhugo10diniz@gmail.com',
  'contato@smarttimeprime.com.br',
]

/**
 * Verifica se um email é admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

