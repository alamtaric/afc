'use client'

import { useState, useRef } from 'react'
import { uploadImage } from '@/lib/supabase'

interface ImageUploadProps {
  onUpload: (url: string) => void
  onClose: () => void
  familyId?: string
}

export default function ImageUpload({ onUpload, onClose, familyId }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルが大きすぎます（5MB以下）')
      return
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選んでください')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // ローカルプレビュー用のURLを作成（Supabaseなしでも動作）
      const localUrl = URL.createObjectURL(file)

      // Supabaseが設定されていれば実際にアップロード
      if (familyId && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const url = await uploadImage(file, familyId)
        onUpload(url)
      } else {
        // 開発用：ローカルURLを使用
        onUpload(localUrl)
      }
    } catch {
      setError('アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">しゃしんをえらぶ</h3>
          <button
            onClick={onClose}
            className="text-3xl p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary w-full"
          >
            {isUploading ? 'アップロードちゅう...' : '📁 ファイルをえらぶ'}
          </button>

          {/* カメラ入力（モバイル用） */}
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.capture = 'environment'
                fileInputRef.current.click()
              }
            }}
            disabled={isUploading}
            className="btn-secondary w-full"
          >
            📸 カメラでとる
          </button>
        </div>
      </div>
    </div>
  )
}
