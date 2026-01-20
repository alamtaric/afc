'use client'

import { useState, useEffect, useCallback } from 'react'
import { FamilySession, Member } from '@/lib/types'
import { joinFamily, createFamily, getMembers, createMember } from '@/lib/supabase'
import { loginOneSignal, logoutOneSignal } from '@/components/OneSignalProvider'

const SESSION_KEY = 'family-chat-session'

export function useFamily() {
  const [session, setSession] = useState<FamilySession | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // セッション読み込み
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FamilySession
        setSession(parsed)
        loginOneSignal(parsed.familyId, parsed.memberId)
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  // メンバー一覧取得
  const loadMembers = useCallback(async (familyId: string) => {
    try {
      const data = await getMembers(familyId)
      setMembers(data)
    } catch {
      setError('メンバーの取得に失敗しました')
    }
  }, [])

  // PINで家族に参加
  const joinWithPin = useCallback(async (pin: string) => {
    setLoading(true)
    setError(null)
    try {
      const family = await joinFamily(pin)
      await loadMembers(family.id)
      return family.id
    } catch {
      setError('PINコードがみつかりません')
      return null
    } finally {
      setLoading(false)
    }
  }, [loadMembers])

  // 新しい家族を作成
  const createNewFamily = useCallback(async (name: string, pin: string) => {
    setLoading(true)
    setError(null)
    try {
      const family = await createFamily(name, pin)
      return family.id
    } catch {
      setError('家族の作成に失敗しました')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // メンバーを追加
  const addMember = useCallback(async (
    familyId: string,
    name: string,
    emoji: string,
    role: 'parent' | 'child'
  ) => {
    setLoading(true)
    setError(null)
    try {
      const member = await createMember(familyId, name, emoji, role)
      setMembers((prev) => [...prev, member])
      return member
    } catch {
      setError('メンバーの追加に失敗しました')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // メンバーを選択してセッション開始
  const selectMember = useCallback(async (member: Member) => {
    const newSession: FamilySession = {
      familyId: member.family_id,
      memberId: member.id,
      memberName: member.name,
      memberEmoji: member.avatar_emoji,
    }
    setSession(newSession)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    await loginOneSignal(member.family_id, member.id)
  }, [])

  // ログアウト
  const logout = useCallback(async () => {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
    await logoutOneSignal()
  }, [])

  return {
    session,
    members,
    loading,
    error,
    joinWithPin,
    createNewFamily,
    addMember,
    selectMember,
    loadMembers,
    logout,
    clearError: () => setError(null),
  }
}
