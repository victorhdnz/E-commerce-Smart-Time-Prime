'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import { Button } from './Button'
import { Modal } from './Modal'
import { Upload, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

type Point = { x: number; y: number }
type Area = { x: number; y: number; width: number; height: number }

interface ImageUploaderProps {
  currentImage?: string
  onImageUploaded: (url: string) => void
  folder?: string // Ex: 'products', 'banners', 'profiles/avatars'
  aspectRatio?: number // ex: 1 para quadrado, 16/9 para widescreen, 9/16 para vertical
  maxSizeMB?: number
}

export const ImageUploader = ({
  currentImage,
  onImageUploaded,
  folder = 'uploads',
  aspectRatio = 1,
  maxSizeMB = 5,
}: ImageUploaderProps) => {
  
  // Estados
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Estados do crop
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Dropzone - Abrir modal para edição
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Verificar tamanho
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      toast.error(`A imagem deve ter no máximo ${maxSizeMB}MB`)
      return
    }

    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    setSelectedFile(file)

    // Criar preview
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setIsModalOpen(true)
    }
    reader.readAsDataURL(file)
  }, [maxSizeMB])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    multiple: false,
  })

  // Função para criar imagem a partir do crop
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob | null> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) return

    setUploading(true)
    try {
      console.log('🎨 Processando imagem...')
      
      // Criar imagem cortada
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      if (!croppedBlob) throw new Error('Erro ao processar imagem')

      console.log('📤 Enviando para Cloudinary...')

      // Converter blob para File
      const timestamp = Date.now()
      const fileName = `${timestamp}-${selectedFile.name}`
      const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' })

      // Criar FormData
      const formData = new FormData()
      formData.append('file', croppedFile)
      formData.append('folder', folder)

      // Upload para Cloudinary via API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer upload')
      }

      console.log('✅ Upload concluído!')
      console.log('📁 Pasta:', folder)
      console.log('🔗 URL Cloudinary:', result.url)
      console.log('🆔 Public ID:', result.publicId)

      onImageUploaded(result.url)
      toast.success('Imagem enviada com sucesso!')
      
      // Resetar estados
      setIsModalOpen(false)
      setImageSrc(null)
      setSelectedFile(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
    } catch (error: any) {
      console.error('❌ Erro ao fazer upload:', error)
      toast.error(error.message || 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* Preview atual */}
      {currentImage && currentImage.trim() !== '' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem Atual
          </label>
          <img
            src={currentImage}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-black bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        {isDragActive ? (
          <p className="text-gray-600">Solte a imagem aqui...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Arraste uma imagem ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP até {maxSizeMB}MB
            </p>
          </>
        )}
      </div>

      {/* Modal de Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !uploading && setIsModalOpen(false)}
        title="Editar Imagem"
      >
        <div className="space-y-6">
          {/* Área do Crop */}
          <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden" style={{ touchAction: 'none' }}>
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid={true}
                objectFit="contain"
                style={{
                  containerStyle: {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#1a1a1a',
                  },
                  mediaStyle: {
                    maxHeight: '100%',
                  },
                  cropAreaStyle: {
                    border: '2px solid #fff',
                  },
                }}
              />
            )}
          </div>

          {/* Controles */}
          <div className="space-y-4">
            {/* Zoom */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Zoom</label>
                <span className="text-sm text-gray-600">{zoom.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut size={18} className="text-gray-400" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn size={18} className="text-gray-400" />
              </div>
            </div>

            {/* Rotação */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Rotação</label>
                <span className="text-sm text-gray-600">{rotation}°</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCw size={18} className="text-gray-400" />
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              isLoading={uploading}
              className="flex-1"
            >
              <Check size={18} className="mr-2" />
              Salvar Imagem
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={uploading}
              className="flex-1"
            >
              <X size={18} className="mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

