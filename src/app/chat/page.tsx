'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ChatMessage from '@/components/ChatMessage'
import MessageInput from '@/components/MessageInput'
import NotificationPermission from '@/components/NotificationPermission'
import { useFamily } from '@/hooks/useFamily'
import { useMessages } from '@/hooks/useMessages'

function shouldShowDate(currentDate: string, prevDate: string | null): boolean {
  if (!prevDate) return true
  const current = new Date(currentDate)
  const prev = new Date(prevDate)
  return (
    current.getFullYear() !== prev.getFullYear() ||
    current.getMonth() !== prev.getMonth() ||
    current.getDate() !== prev.getDate()
  )
}

export default function ChatPage() {
  const router = useRouter()
  const { session, logout, loading: familyLoading } = useFamily()
  const {
    messages,
    loading: messagesLoading,
    loadingMore,
    hasMore,
    sendMessage,
    loadMoreMessages,
    markMessagesAsRead,
    toggleReaction,
  } = useMessages(session?.familyId || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const prevScrollHeight = useRef<number>(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const markedAsReadRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!familyLoading && !session) {
      router.push('/')
    }
  }, [session, familyLoading, router])

  useEffect(() => {
    if (messages.length > 0 && !loadingMore) {
      if (isInitialLoad) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
        setIsInitialLoad(false)
      } else if (prevScrollHeight.current === 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages, isInitialLoad, loadingMore])

  // 過去メッセージ読み込み後にスクロール位置を維持
  useEffect(() => {
    if (!loadingMore && prevScrollHeight.current > 0 && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      messagesContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight.current
      prevScrollHeight.current = 0
    }
  }, [loadingMore, messages])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || loadingMore || !hasMore) return

    if (container.scrollTop < 100) {
      prevScrollHeight.current = container.scrollHeight
      loadMoreMessages()
    }
  }, [loadingMore, hasMore, loadMoreMessages])

  // Intersection Observerで既読をマーク
  useEffect(() => {
    if (!session) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleMessageIds: string[] = []

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id')
            const senderId = entry.target.getAttribute('data-sender-id')

            // 自分のメッセージ以外で、まだ既読マークしていないもの
            if (messageId && senderId !== session.memberId && !markedAsReadRef.current.has(messageId)) {
              visibleMessageIds.push(messageId)
              markedAsReadRef.current.add(messageId)
            }
          }
        })

        if (visibleMessageIds.length > 0) {
          markMessagesAsRead(visibleMessageIds, session.memberId)
        }
      },
      { threshold: 0.5 }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [session, markMessagesAsRead])

  // メッセージが変わったら監視対象を更新
  useEffect(() => {
    if (!observerRef.current || !messagesContainerRef.current) return

    const messageElements = messagesContainerRef.current.querySelectorAll('[data-message-id]')
    messageElements.forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => {
      messageElements.forEach((el) => {
        observerRef.current?.unobserve(el)
      })
    }
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
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {loadingMore && (
          <div className="text-center text-slate-400 py-2 text-sm">
            読み込み中...
          </div>
        )}
        {hasMore && !loadingMore && messages.length > 0 && (
          <div className="text-center py-2">
            <button
              onClick={loadMoreMessages}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              ↑ 過去のメッセージを読み込む
            </button>
          </div>
        )}
        {messagesLoading ? (
          <div className="text-center text-slate-400 py-8">読み込み中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-80">💬</div>
            <p className="text-slate-400">メッセージを送ろう</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              data-message-id={message.id}
              data-sender-id={message.sender_id}
            >
              <ChatMessage
                message={message}
                isOwn={message.sender_id === session.memberId}
                showDate={shouldShowDate(
                  message.created_at,
                  index > 0 ? messages[index - 1].created_at : null
                )}
                currentMemberId={session.memberId}
                onReaction={(messageId, emoji) => toggleReaction(messageId, session.memberId, emoji)}
              />
            </div>
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
