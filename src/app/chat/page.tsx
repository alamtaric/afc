'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage from '@/components/ChatMessage'
import MessageInput from '@/components/MessageInput'
import NotificationPermission from '@/components/NotificationPermission'
import { useFamily } from '@/hooks/useFamily'
import { useMessages } from '@/hooks/useMessages'

export default function ChatPage() {
  const router = useRouter()
  const { session, logout, loading: familyLoading } = useFamily()
  const { messages, loading: messagesLoading, sendMessage } = useMessages(
    session?.familyId || null
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!familyLoading && !session) {
      router.push('/')
    }
  }, [session, familyLoading, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content: string, imageUrl?: string) => {
    if (!session) return
    await sendMessage(session.memberId, content, imageUrl)
  }

  if (familyLoading || !session) {
    return (
      <div className="h-dvh flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{session.memberEmoji}</span>
          <span className="font-semibold text-slate-700">{session.memberName}</span>
        </div>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ログアウト
        </button>
      </header>

      {/* 通知許可バナー */}
      <NotificationPermission />

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messagesLoading ? (
          <div className="text-center text-slate-400 py-8">読み込み中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-80">💬</div>
            <p className="text-slate-400">メッセージを送ろう</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.sender_id === session.memberId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <MessageInput
        onSend={handleSend}
        familyId={session.familyId}
      />
    </div>
  )
}
