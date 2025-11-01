'use client'

import { useState, useCallback, useRef } from 'react'
import { X, RotateCw, RotateCcw, Check } from 'lucide-react'
import { Button } from './Button'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop'

interface ImageEditorProps {
  file: File
  onSave: (url: string) => void
  onCancel: () => void
}

export function ImageEditor({ file, onSave, onCancel }: ImageEditorProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // Carregar imagem ao montar o componente
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [file])

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

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
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Erro ao criar contexto do canvas')
    }

    // Dimensão final recomendada (Instagram Post: 1080x1080)
    const targetSize = 1080

    // Tamanho da área de crop
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = targetSize
    canvas.height = targetSize

    ctx.translate(targetSize / 2, targetSize / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-targetSize / 2, -targetSize / 2)

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      targetSize,
      targetSize
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Erro ao processar imagem')
        }
        resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error('Por favor, ajuste o crop da imagem')
      return
    }

    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      )

      const formData = new FormData()
      formData.append('file', croppedImage, file.name)
      formData.append('folder', 'images')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      onSave(data.url)
      toast.success('Imagem editada e enviada com sucesso!')
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error(error.message || 'Erro ao fazer upload da imagem')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Editar e Recortar Imagem</h2>
            <p className="text-xs text-gray-500 mt-1">
              📐 Arraste a imagem para posicionar • Ajuste o zoom e rotação • Dimensão final: <strong>1080 x 1080px</strong>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Editor Area com React Easy Crop */}
        <div className="flex-1 relative bg-gray-900 min-h-[400px] max-h-[60vh]">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1} // Aspect ratio quadrado (1:1)
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                },
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="border-t p-4 bg-white">
          <div className="space-y-4">
            {/* Zoom Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => prev - 90)}
                title="Rotacionar Esquerda"
              >
                <RotateCcw size={18} className="mr-2" />
                -90°
              </Button>
              <div className="flex-1 text-center text-sm text-gray-600">
                Rotação: {rotation}°
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((prev) => prev + 90)}
                title="Rotacionar Direita"
              >
                <RotateCw size={18} className="mr-2" />
                +90°
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Check size={18} className="mr-2" />
                Salvar e Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
