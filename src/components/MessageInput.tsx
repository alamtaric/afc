'use client'

import { useState, useRef } from 'react'
import EmojiPicker from './EmojiPicker'
import ImageUpload from './ImageUpload'

interface MessageInputProps {
  onSend: (content: string, imageUrl?: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() || pendingImage) {
      onSend(message.trim(), pendingImage || undefined)
      setMessage('')
      setPendingImage(null)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div className="bg-white border-t-2 border-gray-100 p-4">
        {/* 画像プレビュー */}
        {pendingImage && (
          <div className="mb-3 relative inline-block">
            <img
              src={pendingImage}
              alt="送信する画像"
              className="h-20 rounded-lg"
            />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* 画像ボタン */}
          <button
            onClick={() => setShowImageUpload(true)}
            className="btn-emoji flex-shrink-0"
            disabled={disabled}
          >
            📷
          </button>

          {/* 絵文字ボタン */}
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="btn-emoji flex-shrink-0"
            disabled={disabled}
          >
            😊
          </button>

          {/* テキスト入力 */}
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージをかく..."
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none rounded-2xl border-2 border-gray-200 px-4 py-3
                       text-xl focus:border-primary focus:outline-none
                       disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {/* 送信ボタン */}
          <button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !pendingImage)}
            className="btn-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            おくる
          </button>
        </div>
      </div>

      {/* 絵文字ピッカー */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* 画像アップロード */}
      {showImageUpload && (
        <ImageUpload
          onUpload={(url) => {
            setPendingImage(url)
            setShowImageUpload(false)
          }}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </>
  )
}
