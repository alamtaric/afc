'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage from '@/components/ChatMessage'
import MessageInput from '@/components/MessageInput'
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
      <div className="h-dvh flex items-center justify-center">
        <div className="text-xl text-gray-500">よみこみちゅう...</div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{session.memberEmoji}</span>
          <span className="font-bold text-gray-800">{session.memberName}</span>
        </div>
        <button
          onClick={() => { logout(); router.push('/') }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ログアウト
        </button>
      </header>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messagesLoading ? (
          <div className="text-center text-gray-500 py-8">読み込み中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500">メッセージを送ろう！</p>
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
