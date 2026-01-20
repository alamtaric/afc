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
      <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200 p-3">
        {pendingImage && (
          <div className="mb-2 relative inline-block">
            <img src={pendingImage} alt="" className="h-14 rounded-lg" />
            <button
              onClick={() => setPendingImage(null)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-slate-500 text-white rounded-full text-xs leading-none"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImageUpload(true)}
            disabled={disabled}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="text-[20px] leading-none">📷</span>
          </button>
          <button
            onClick={() => setShowEmojiPicker(true)}
            disabled={disabled}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="text-[20px] leading-none">😊</span>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージ"
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 h-10 px-4 text-[16px] bg-slate-100 text-slate-700 placeholder-slate-400 rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />

          <button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !pendingImage)}
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white rounded-full disabled:opacity-30 shadow-sm transition-opacity"
          >
            <span className="text-lg leading-none translate-x-[1px]">➤</span>
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
