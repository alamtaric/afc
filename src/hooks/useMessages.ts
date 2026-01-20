'use client'

import { useState, useEffect, useCallback } from 'react'
import { Message, Member } from '@/lib/types'
import { getMessages, getOlderMessages, sendMessage as sendMessageApi, subscribeToMessages, getMembers } from '@/lib/supabase'

export function useMessages(familyId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<Record<string, Member>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // メンバー情報をマップ形式で取得
  useEffect(() => {
    if (!familyId) return

    const loadMembers = async () => {
      try {
        const data = await getMembers(familyId)
        const memberMap: Record<string, Member> = {}
        data.forEach((m: Member) => {
          memberMap[m.id] = m
        })
        setMembers(memberMap)
      } catch {
        console.error('メンバー取得失敗')
      }
    }

    loadMembers()
  }, [familyId])

  // メッセージ取得
  useEffect(() => {
    if (!familyId) return

    const loadMessages = async () => {
      setLoading(true)
      try {
        const data = await getMessages(familyId)
        setMessages(data)
        setHasMore(data.length >= 50)
      } catch {
        setError('メッセージの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()

    // リアルタイム購読
    const subscription = subscribeToMessages(familyId, (newMessage) => {
      setMessages((prev) => {
        // 重複チェック
        if (prev.some((m) => m.id === newMessage.id)) return prev
        // senderを追加
        const messageWithSender = {
          ...newMessage,
          sender: members[newMessage.sender_id],
        }
        return [...prev, messageWithSender]
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [familyId, members])

  // 過去のメッセージを読み込む
  const loadMoreMessages = useCallback(async () => {
    if (!familyId || loadingMore || !hasMore || messages.length === 0) return

    setLoadingMore(true)
    try {
      const oldestMessage = messages[0]
      const olderMessages = await getOlderMessages(familyId, oldestMessage.created_at)

      if (olderMessages.length === 0) {
        setHasMore(false)
      } else {
        setMessages((prev) => [...olderMessages, ...prev])
        setHasMore(olderMessages.length >= 30)
      }
    } catch {
      console.error('過去メッセージの取得に失敗')
    } finally {
      setLoadingMore(false)
    }
  }, [familyId, loadingMore, hasMore, messages])

  // メッセージ送信
  const sendMessage = useCallback(async (
    senderId: string,
    content: string,
    imageUrl?: string
  ) => {
    if (!familyId) return null

    try {
      const message = await sendMessageApi(familyId, senderId, content, imageUrl)
      // ローカルで即座に追加（リアルタイムでも来るが、UXのため先に追加）
      const messageWithSender: Message = {
        ...message,
        sender: members[senderId],
      }
      setMessages((prev) => [...prev, messageWithSender])
      return message
    } catch {
      setError('メッセージの送信に失敗しました')
      return null
    }
  }, [familyId, members])

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    error,
    sendMessage,
    loadMoreMessages,
    clearError: () => setError(null),
  }
}
