'use client'

import { useState, useRef } from 'react'
import EmojiPicker from './EmojiPicker'
import ImageUpload from './ImageUpload'

interface MessageInputProps {
  onSend: (content: string, imageUrl?: string) => void
  familyId: string
  disabled?: boolean
}

export default function MessageInput({ onSend, familyId, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() || pendingImage) {
      onSend(message.trim(), pendingImage || undefined)
      setMessage('')
      setPendingImage(null)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  return (
    <>
      <div className="bg-white border-t border-gray-200 p-2 safe-area-bottom">
        {/* 画像プレビュー */}
        {pendingImage && (
          <div className="mb-2 relative inline-block">
            <img src={pendingImage} alt="" className="h-16 rounded-lg" />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* ツールボタン */}
          <button
            onClick={() => setShowImageUpload(true)}
            className="p-2 text-2xl hover:bg-gray-100 rounded-full"
            disabled={disabled}
          >
            📷
          </button>
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="p-2 text-2xl hover:bg-gray-100 rounded-full"
            disabled={disabled}
          >
            😊
          </button>

          {/* テキスト入力 */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージ..."
            disabled={disabled}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-lg
                       focus:border-primary focus:outline-none"
          />

          {/* 送信ボタン */}
          <button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !pendingImage)}
            className="p-2 text-2xl bg-primary text-white rounded-full
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <EmojiPicker
          onSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {showImageUpload && (
        <ImageUpload
          familyId={familyId}
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
