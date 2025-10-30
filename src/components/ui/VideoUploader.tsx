'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './Button'
import { Upload, Video, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface VideoUploaderProps {
  currentVideo?: string
  onVideoUploaded: (url: string) => void
  folder?: string
  maxSizeMB?: number
}

export const VideoUploader = ({
  currentVideo,
  onVideoUploaded,
  folder = 'videos',
  maxSizeMB = 50, // Vídeos podem ser maiores
}: VideoUploaderProps) => {
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Dropzone para vídeo
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Verificar tamanho
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      toast.error(`O vídeo deve ter no máximo ${maxSizeMB}MB`)
      return
    }

    // Verificar tipo
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um vídeo')
      return
    }

    // Upload do vídeo
    setUploading(true)
    setUploadProgress(0)
    
    const uploadToast = toast.loading('Fazendo upload do vídeo...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      console.log('📤 Iniciando upload de vídeo:', {
        name: file.name,
        size: fileSizeMB.toFixed(2) + 'MB',
        type: file.type
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await response.json()
      
      console.log('✅ Vídeo enviado com sucesso:', data.url)
      
      toast.dismiss(uploadToast)
      toast.success('Vídeo enviado com sucesso!')
      onVideoUploaded(data.url)
      setUploadProgress(100)
    } catch (error: any) {
      toast.dismiss(uploadToast)
      console.error('Erro no upload de vídeo:', error)
      toast.error(error.message || 'Erro ao fazer upload do vídeo')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }, [maxSizeMB, folder, onVideoUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: false,
    disabled: uploading,
  })

  const handleRemoveVideo = () => {
    if (confirm('Deseja remover este vídeo?')) {
      onVideoUploaded('')
      toast.success('Vídeo removido')
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview do vídeo atual */}
      {currentVideo && currentVideo.trim() !== '' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vídeo Atual
          </label>
          <div className="relative inline-block">
            <video
              src={currentVideo}
              controls
              className="w-48 h-64 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              onClick={handleRemoveVideo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Remover vídeo"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          uploading
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : isDragActive
            ? 'border-black bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Fazendo upload do vídeo...</p>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-black h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </>
        ) : (
          <>
            <Video className="mx-auto mb-4 text-gray-400" size={48} />
            {isDragActive ? (
              <p className="text-gray-600">Solte o vídeo aqui...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Arraste um vídeo ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">
                  MP4, MOV, WEBM até {maxSizeMB}MB
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Recomendado: formato vertical 9:16 (Reels/Stories)
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

