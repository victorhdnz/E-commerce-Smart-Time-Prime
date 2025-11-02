'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Video as VideoIcon, Play } from 'lucide-react'
import { Button } from './Button'
import { MediaManager } from '@/components/dashboard/MediaManager'
import toast from 'react-hot-toast'

interface VideoUploaderProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  showMediaManager?: boolean
}

export function VideoUploader({ 
  value, 
  onChange, 
  placeholder = "Clique para fazer upload de um vídeo",
  className = "",
  showMediaManager = true
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atualizar preview quando value mudar externamente
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar se é um vídeo
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecione apenas arquivos de vídeo')
      return
    }

    // Validar tamanho (máximo 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('O vídeo deve ter no máximo 100MB')
      return
    }

    setUploading(true)
    
    try {
      // Fazer upload via Supabase Storage
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Erro ao fazer upload do vídeo')
      }

      const uploadData = await uploadResponse.json()

      if (uploadData.success && uploadData.url) {
        setPreview(uploadData.url)
        onChange(uploadData.url)
        toast.success('Vídeo carregado com sucesso!')
      } else {
        throw new Error('URL do vídeo não retornada')
      }
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast.error(error.message || 'Erro ao fazer upload do vídeo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
            <video
              src={preview}
              controls
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute top-2 right-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="bg-white text-black hover:bg-gray-100"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <VideoIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">{placeholder}</p>
            
            {/* Recomendação de Dimensões */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-blue-900 mb-1">
                📐 Dimensões Recomendadas
              </p>
              <p className="text-xs text-blue-700">
                <strong>Vídeos:</strong> 1920 x 1080px (Full HD)
              </p>
            </div>
            
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
                  acceptedTypes={['video/*']}
                  maxSizeMB={50}
                  folder="videos"
                />
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}

