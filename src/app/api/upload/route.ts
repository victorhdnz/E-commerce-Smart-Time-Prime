import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verificar configuração do Cloudinary
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary não configurado' }, { status: 500 })
    }

    // Converter File para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Detectar tipo de arquivo
    const isVideo = file.type.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'
    
    // Upload para Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder: folder,
        resource_type: resourceType,
      }

      // Aplicar transformações apenas para imagens
      if (!isVideo) {
        uploadOptions.transformation = [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      } else {
        // Para vídeos, usar configurações otimizadas
        uploadOptions.resource_type = 'video'
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    const uploadResult = result as any

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID não fornecido' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar' },
      { status: 500 }
    )
  }
}

