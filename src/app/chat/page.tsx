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

  // セッションがなければログインへ
  useEffect(() => {
    if (!familyLoading && !session) {
      router.push('/')
    }
  }, [session, familyLoading, router])

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (content: string, imageUrl?: string) => {
    if (!session) return
    await sendMessage(session.memberId, content, imageUrl)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (familyLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-500">よみこみちゅう...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{session.memberEmoji}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {session.memberName}
            </h1>
            <p className="text-sm text-gray-500">ファミリーチャット</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-lg bg-gray-100 rounded-xl hover:bg-gray-200
                     active:scale-95 transition-all"
        >
          かえる
        </button>
      </header>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="text-center text-xl text-gray-500 py-8">
            メッセージをよみこみちゅう...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-xl text-gray-500">
              まだメッセージがないよ
              <br />
              さいしょのメッセージをおくろう！
            </p>
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
      <MessageInput onSend={handleSend} />
    </div>
  )
}
