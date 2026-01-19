'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/supabase'

interface ImageUploadProps {
  onUpload: (url: string) => void
  onClose: () => void
  familyId: string
}

export default function ImageUpload({ onUpload, onClose, familyId }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('5MB以下の画像を選んでください')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選んでください')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const url = await uploadImage(file, familyId)
      onUpload(url)
    } catch {
      setError('アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-slate-700">写真を送る</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium disabled:opacity-50"
          >
            {isUploading ? '送信中...' : '📷 写真を選ぶ'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-600"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
