// Tipos principais da aplicação

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  local_price: number
  national_price: number
  stock: number
  product_code: string | null
  is_featured: boolean
  is_active: boolean
  weight: number | null
  width: number | null
  height: number | null
  length: number | null
  category: string | null
  tags: string[] | null
  colors?: ProductColor[]
  gifts?: Product[]
  images?: string[]
  created_at: string
  updated_at: string
}

export interface ProductColor {
  id: string
  product_id: string
  color_name: string
  color_hex: string
  images: string[]
  stock: number
  is_active: boolean
}

export interface CartItem {
  product: Product
  color?: ProductColor
  quantity: number
  is_gift: boolean
  parent_product_id?: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'editor' | 'admin'
}

export interface Address {
  id: string
  user_id: string
  cep: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  is_default: boolean
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shipping_cost: number
  total: number
  payment_method: string | null
  payment_status: string
  shipping_address: Address
  tracking_code: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product: Product
  color?: ProductColor
  quantity: number
  unit_price: number
  subtotal: number
  is_gift: boolean
}

export interface Review {
  id: string
  product_id: string
  user_id: string | null
  customer_name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  order_position: number
  is_active: boolean
}

export interface SeasonalLayout {
  id: string
  name: string
  slug: string
  description: string | null
  theme_colors: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
  }
  is_active: boolean
  scheduled_start: string | null
  scheduled_end: string | null
  sections?: LandingSection[]
}

export interface LandingSection {
  id: string
  layout_id: string | null
  section_type: 'hero' | 'timer' | 'featured_products' | 'gifts' | 'social_proof' | 'about' | 'last_call' | 'faq' | 'custom'
  title: string | null
  content: Record<string, any>
  images: string[]
  videos: string[]
  cta_config: {
    text?: string
    link?: string
    type?: 'whatsapp' | 'checkout' | 'external'
  }
  order_position: number
  is_visible: boolean
  background_color: string | null
  text_color: string | null
}

export interface Timer {
  id: string
  section_id: string | null
  name: string
  start_date: string
  end_date: string
  is_active: boolean
}

export interface ShippingCalculation {
  cep: string
  city: string
  price: number
  days: number
  method: 'local' | 'national'
}

export interface SiteSettings {
  site_name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  frete_uberlandia: number
  cep_uberlandia: string
  whatsapp_number: string
  email_contact: string
  instagram_url: string
  facebook_url: string
}

