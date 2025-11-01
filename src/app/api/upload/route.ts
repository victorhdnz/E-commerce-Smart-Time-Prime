import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Formatos permitidos para imagens
const ALLOWED_IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (conforme exemplo fornecido)

// Validar tipo de arquivo (mais robusto)
function isValidImageFile(file: File): boolean {
  // Verificar MIME type
  const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!validMimeTypes.includes(file.type) && !file.type.startsWith('image/')) {
    return false
  }
  
  // Verificar extensão do arquivo também (para casos onde MIME type pode estar incorreto)
  const fileName = file.name.toLowerCase()
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
  
  return hasValidExtension
}

// Validar tamanho do arquivo
function isValidFileSize(size: number, isVideo: boolean = false): boolean {
  const maxSize = isVideo ? 50 * 1024 * 1024 : MAX_FILE_SIZE // 50MB para vídeos, 5MB para imagens
  return size <= maxSize
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'smart-time-prime'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verificar configuração do Cloudinary (tentar ambos nomes de variáveis)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary não configurado:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
        envVars: {
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
          CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        }
      })
      return NextResponse.json({ 
        error: 'Cloudinary não configurado corretamente. Verifique as variáveis de ambiente.' 
      }, { status: 500 })
    }

    // Detectar tipo de arquivo
    const isVideo = file.type.startsWith('video/')
    const resourceType = isVideo ? 'video' : 'image'

    // Validar tipo de arquivo
    if (!isVideo && !isValidImageFile(file)) {
      return NextResponse.json({ 
        error: `Apenas arquivos de imagem são permitidos. Formatos aceitos: ${ALLOWED_IMAGE_FORMATS.join(', ').toUpperCase()}. Tipo de arquivo recebido: ${file.type || 'desconhecido'}, Nome: ${file.name}` 
      }, { status: 400 })
    }

    // Validar tamanho
    if (!isValidFileSize(file.size, isVideo)) {
      const maxSizeMB = isVideo ? 50 : 5 // 5MB para imagens (conforme exemplo fornecido)
      return NextResponse.json({ 
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB` 
      }, { status: 400 })
    }

    // Converter File para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Configurar opções de upload (seguindo lógica do exemplo fornecido)
    const uploadOptions: any = {
      folder: folder || 'smart-time-prime',
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    }

    // Aplicar transformações para imagens (conforme exemplo: width: 800, height: 600, crop: 'limit')
    if (!isVideo) {
      uploadOptions.transformation = [
        { width: 800, height: 600, crop: 'limit' }, // Limitar tamanho mas manter proporção
        { quality: 'auto:good' } // Otimização automática de qualidade
      ]
      uploadOptions.allowed_formats = ALLOWED_IMAGE_FORMATS
    } else {
      // Para vídeos, usar formato Full HD (1920x1080)
      uploadOptions.resource_type = 'video'
      uploadOptions.transformation = [
        { width: 1920, height: 1080, crop: 'fill', gravity: 'center' }, // Formato Full HD (1920x1080)
      ]
      uploadOptions.eager = [
        { width: 1920, height: 1080, crop: 'fill', gravity: 'center' }
      ]
    }

    // Upload para Cloudinary usando upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Erro no upload do Cloudinary:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      uploadStream.end(buffer)
    })

    const uploadResult = result as any

    console.log('Upload realizado com sucesso:', {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      size: file.size,
      format: uploadResult.format,
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
    })
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao fazer upload',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
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

    // Verificar configuração do Cloudinary
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary não configurado' }, { status: 500 })
    }

    const result = await cloudinary.uploader.destroy(publicId)

    if (result.result === 'ok') {
      console.log('Imagem deletada com sucesso:', publicId)
      return NextResponse.json({ 
        success: true,
        message: 'Imagem deletada com sucesso!' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Erro ao deletar imagem',
        result: result.result 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Erro ao deletar:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar' },
      { status: 500 }
    )
  }
}

// Rota de teste para verificar se o serviço de upload está funcionando
export async function GET(request: NextRequest) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  return NextResponse.json({ 
    message: 'Serviço de upload funcionando!', 
    cloudinaryConfigured: !!cloudName && !!apiKey && !!apiSecret,
    cloudName: cloudName || 'não configurado',
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
  })
}

