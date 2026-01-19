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
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* アバター */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-slate-100">
          {sender?.avatar_emoji || '👤'}
        </div>
      </div>

      {/* メッセージ本文 */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-slate-400 px-1">
          {sender?.name || ''}
        </span>

        <div
          className={`rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm
            ${isOwn
              ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm'
              : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
            }`}
        >
          {message.content}
        </div>

        {message.image_url && (
          <div className="mt-1 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={message.image_url}
              alt=""
              width={240}
              height={240}
              className="object-cover"
            />
          </div>
        )}

        <span className="text-[10px] text-slate-300 px-1">{time}</span>
      </div>
    </div>
  )
}
