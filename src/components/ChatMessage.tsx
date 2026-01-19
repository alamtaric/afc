'use client'

import Image from 'next/image'
import { Message, Member } from '@/lib/types'

interface ChatMessageProps {
  message: Message
  isOwn: boolean
}

export default function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const sender = message.sender as Member | undefined
  const time = new Date(message.created_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* アバター */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl md:text-3xl">
          {sender?.avatar_emoji || '👤'}
        </div>
      </div>

      {/* メッセージ本文 */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <span className="text-sm text-gray-500 px-2">
          {sender?.name || 'だれか'}
        </span>

        <div
          className={`rounded-3xl px-5 py-3 text-xl md:text-2xl
            ${isOwn
              ? 'bg-primary text-white rounded-tr-lg'
              : 'bg-white text-gray-800 rounded-tl-lg shadow-md'
            }`}
        >
          {message.content}
        </div>

        {/* 画像があれば表示 */}
        {message.image_url && (
          <div className="mt-2 rounded-2xl overflow-hidden shadow-md">
            <Image
              src={message.image_url}
              alt="送信画像"
              width={300}
              height={300}
              className="object-cover"
            />
          </div>
        )}

        <span className="text-xs text-gray-400 px-2">{time}</span>
      </div>
    </div>
  )
}
