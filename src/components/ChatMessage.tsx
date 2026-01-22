'use client'

import Image from 'next/image'
import { Message, Member } from '@/lib/types'

interface ChatMessageProps {
  message: Message
  isOwn: boolean
  showDate?: boolean
  currentMemberId?: string
}

function formatDateTime(dateStr: string): { time: string; date?: string } {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const time = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (messageDate >= today) {
    return { time }
  } else if (messageDate >= yesterday) {
    return { time, date: '昨日' }
  } else {
    const dateStr = date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
    return { time, date: dateStr }
  }
}

export default function ChatMessage({ message, isOwn, showDate, currentMemberId }: ChatMessageProps) {
  const sender = message.sender as Member | undefined
  const { time, date } = formatDateTime(message.created_at)
  const hasContent = message.content && message.content.trim().length > 0

  // 自分以外の既読者を取得
  const readers = (message.reads || []).filter(
    (r) => r.member_id !== message.sender_id && r.member_id !== currentMemberId
  )

  return (
    <>
      {showDate && date && (
        <div className="flex justify-center my-3">
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {date}
          </span>
        </div>
      )}
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

          {hasContent && (
            <div
              className={`rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm
                ${isOwn
                  ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm'
                  : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                }`}
            >
              {message.content}
            </div>
          )}

          {message.image_url && (
            <div className={`${hasContent ? 'mt-1' : ''} rounded-xl overflow-hidden shadow-sm`}>
              <Image
                src={message.image_url}
                alt=""
                width={240}
                height={240}
                className="object-cover"
              />
            </div>
          )}

          <div className={`flex items-center gap-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[10px] text-slate-300">{time}</span>
            {/* 既読アイコン（自分のメッセージのみ表示） */}
            {isOwn && readers.length > 0 && (
              <div className="flex -space-x-1">
                {readers.slice(0, 5).map((read) => (
                  <span
                    key={read.member_id}
                    className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] border border-white"
                    title={read.member?.name || ''}
                  >
                    {read.member?.avatar_emoji || '👤'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
