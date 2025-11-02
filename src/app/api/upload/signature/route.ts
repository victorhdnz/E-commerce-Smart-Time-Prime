import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Gerar assinatura para upload direto do cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { folder = 'smart-time-prime', resourceType = 'auto' } = body

    // Verificar configuração do Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ 
        error: 'Cloudinary não configurado corretamente' 
      }, { status: 500 })
    }

    // Gerar timestamp
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Parâmetros para assinatura (sem eager para evitar problemas de formato)
    const params: Record<string, string | number> = {
      folder: folder,
      timestamp: timestamp,
      resource_type: resourceType,
    }

    // Gerar assinatura
    const signature = cloudinary.utils.api_sign_request(
      params,
      apiSecret!
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
    })
  } catch (error: any) {
    console.error('Erro ao gerar assinatura:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar assinatura de upload' },
      { status: 500 }
    )
  }
}

