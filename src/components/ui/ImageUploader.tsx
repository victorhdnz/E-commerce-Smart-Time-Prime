'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FolderOpen } from 'lucide-react'
import { Button } from './Button'
import { MediaManager } from '@/components/dashboard/MediaManager'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  showMediaManager?: boolean
}

export function ImageUploader({ 
  value, 
  onChange, 
  placeholder = "Clique para fazer upload de uma imagem",
  className = "",
  showMediaManager = true
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setUploading(true)
    
    try {
      // Aqui você faria o upload real para Cloudinary ou outro serviço
      // Por enquanto, vamos simular com um URL local
      const imageUrl = URL.createObjectURL(file)
      setPreview(imageUrl)
      onChange(imageUrl)
      toast.success('Imagem carregada com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleMediaSelect = (url: string) => {
    setPreview(url)
    onChange(url)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="bg-white text-black hover:bg-gray-100"
              >
                <X size={16} className="mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">{placeholder}</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
                disabled={uploading}
              >
                <Upload size={16} className="mr-2" />
                {uploading ? 'Carregando...' : 'Upload'}
              </Button>
              {showMediaManager && (
                <MediaManager
                  onSelectMedia={handleMediaSelect}
                  acceptedTypes={['image/*']}
                  maxSizeMB={5}
                  folder="images"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

