'use client'

import { useState, useRef, useEffect } from 'react'
import { X, RotateCw, RotateCcw, Move, ZoomIn, ZoomOut, Upload, Check } from 'lucide-react'
import { Button } from './Button'
import toast from 'react-hot-toast'

interface ImageEditorProps {
  file: File
  onSave: (url: string) => void
  onCancel: () => void
}

export function ImageEditor({ file, onSave, onCancel }: ImageEditorProps) {
  const [image, setImage] = useState<string>('')
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [file])

  const handleRotate = (clockwise: boolean) => {
    setRotation((prev) => prev + (clockwise ? 90 : -90))
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setScale((prev) => {
      const newScale = direction === 'in' ? prev * 1.1 : prev * 0.9
      return Math.max(0.5, Math.min(3, newScale))
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = async () => {
    if (!canvasRef.current || !imgRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = async () => {
      // Limpar canvas
      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Aplicar transformações
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)
      ctx.drawImage(img, -img.width / 2 + position.x, -img.height / 2 + position.y, img.width, img.height)
      ctx.restore()

      // Converter para blob e fazer upload
      canvas.toBlob(async (blob) => {
        if (!blob) return

        try {
          const formData = new FormData()
          formData.append('file', blob, file.name)
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
      }, 'image/jpeg', 0.9)
    }
    img.src = image
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Editar Imagem</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Editor Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-6 bg-gray-100"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="flex items-center justify-center min-h-full">
            {image && (
              <div className="relative">
                <img
                  ref={imgRef}
                  src={image}
                  alt="Preview"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s',
                  }}
                  className="max-w-full max-h-[60vh] object-contain cursor-move"
                  onMouseDown={handleMouseDown}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="border-t p-4 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(false)}
                title="Rotacionar Esquerda"
              >
                <RotateCcw size={18} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(true)}
                title="Rotacionar Direita"
              >
                <RotateCw size={18} />
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('out')}
                title="Diminuir Zoom"
              >
                <ZoomOut size={18} />
              </Button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoom('in')}
                title="Aumentar Zoom"
              >
                <ZoomIn size={18} />
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="text-sm text-gray-600">
                Arraste para mover • Clique e arraste para reposicionar
              </div>
            </div>
            <div className="flex items-center gap-2">
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

