'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Message, Member, Reaction } from '@/lib/types'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

interface ChatMessageProps {
  message: Message
  isOwn: boolean
  showDate?: boolean
  currentMemberId?: string
  onReaction?: (messageId: string, emoji: string) => void
}

// URLを検出してリンクに変換
function renderContentWithLinks(content: string, isOwn: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = content.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // URLをリセットしてから再テスト
      urlRegex.lastIndex = 0
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${isOwn ? 'text-white/90 hover:text-white' : 'text-blue-500 hover:text-blue-600'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return part
  })
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

export default function ChatMessage({ message, isOwn, showDate, currentMemberId, onReaction }: ChatMessageProps) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const sender = message.sender as Member | undefined
  const { time, date } = formatDateTime(message.created_at)
  const hasContent = message.content && message.content.trim().length > 0

  // 自分以外の既読者を取得
  const readers = (message.reads || []).filter(
    (r) => r.member_id !== message.sender_id && r.member_id !== currentMemberId
  )

  // リアクションを絵文字ごとにグループ化
  const groupedReactions = (message.reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {} as Record<string, Reaction[]>)

  // 長押し開始
  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowReactionPicker(true)
    }, 500)
  }, [])

  // 長押し終了
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // リアクション選択
  const handleReaction = useCallback((emoji: string) => {
    onReaction?.(message.id, emoji)
    setShowReactionPicker(false)
  }, [message.id, onReaction])

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

          {/* メッセージと時刻を同じ行に */}
          <div className={`flex items-end gap-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="relative">
              {hasContent && (
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  onContextMenu={(e) => { e.preventDefault(); setShowReactionPicker(true) }}
                  className={`rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm select-none
                    ${isOwn
                      ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                    }`}
                >
                  {renderContentWithLinks(message.content, isOwn)}
                </div>
              )}

              {/* リアクションピッカー */}
              {showReactionPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowReactionPicker(false)}
                  />
                  <div className={`absolute z-50 ${isOwn ? 'right-0' : 'left-0'} -top-12 bg-white rounded-full shadow-lg px-2 py-1 flex gap-1`}>
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 時刻と既読アイコン */}
            <div className={`flex items-center gap-1 flex-shrink-0 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-[10px] text-slate-300">{time}</span>
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

          {message.image_url && (
            <button
              onClick={() => setShowImageModal(true)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={`${hasContent ? 'mt-1' : ''} rounded-xl overflow-hidden shadow-sm cursor-zoom-in`}
            >
              <Image
                src={message.image_url}
                alt=""
                width={240}
                height={240}
                className="object-cover"
              />
            </button>
          )}

          {/* リアクション表示 */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className={`flex flex-wrap gap-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                const hasMyReaction = reactions.some((r) => r.member_id === currentMemberId)
                return (
                  <button
                    key={emoji}
                    onClick={() => onReaction?.(message.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors
                      ${hasMyReaction
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    <span>{emoji}</span>
                    <span>{reactions.length}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 画像モーダル */}
      {showImageModal && message.image_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <Image
            src={message.image_url}
            alt=""
            width={1200}
            height={1200}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
