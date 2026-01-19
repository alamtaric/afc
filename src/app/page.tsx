'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PinInput from '@/components/PinInput'
import MemberSelector from '@/components/MemberSelector'
import { useFamily } from '@/hooks/useFamily'
import { Member } from '@/lib/types'

type Screen = 'pin' | 'select-member' | 'add-member' | 'create-family'

export default function HomePage() {
  const router = useRouter()
  const {
    session,
    members,
    loading,
    error,
    joinWithPin,
    createNewFamily,
    addMember,
    selectMember,
    clearError,
  } = useFamily()

  const [screen, setScreen] = useState<Screen>('pin')
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmoji, setNewMemberEmoji] = useState('😊')
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child')
  const [newFamilyName, setNewFamilyName] = useState('')
  const [newFamilyPin, setNewFamilyPin] = useState('')

  useEffect(() => {
    if (session) {
      router.push('/chat')
    }
  }, [session, router])

  const handlePinSubmit = async (pin: string) => {
    const id = await joinWithPin(pin)
    if (id) {
      setFamilyId(id)
      setScreen('select-member')
    }
  }

  const handleSelectMember = (member: Member) => {
    selectMember(member)
  }

  const handleAddMember = async () => {
    if (!familyId || !newMemberName.trim()) return
    const member = await addMember(familyId, newMemberName, newMemberEmoji, newMemberRole)
    if (member) {
      setNewMemberName('')
      setNewMemberEmoji('😊')
      setScreen('select-member')
    }
  }

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim() || newFamilyPin.length !== 6) return
    const id = await createNewFamily(newFamilyName, newFamilyPin)
    if (id) {
      setFamilyId(id)
      setScreen('add-member')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-lg text-slate-400">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-sm">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Family Chat
          </h1>
          <p className="text-slate-400 text-sm">家族のためのチャット</p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-xl text-center text-sm border border-red-100">
            {error}
            <button onClick={clearError} className="ml-2 underline">閉じる</button>
          </div>
        )}

        {/* PIN入力画面 */}
        {screen === 'pin' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-500">PINコードを入力</p>
            <PinInput onSubmit={handlePinSubmit} />
            <button
              onClick={() => setScreen('create-family')}
              className="text-sm text-primary hover:underline"
            >
              新しい家族を作成
            </button>
          </div>
        )}

        {/* メンバー選択画面 */}
        {screen === 'select-member' && (
          <MemberSelector
            members={members}
            onSelect={handleSelectMember}
            onAddMember={() => setScreen('add-member')}
          />
        )}

        {/* メンバー追加画面 */}
        {screen === 'add-member' && (
          <div className="flex flex-col gap-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 text-center">メンバーを追加</h2>

            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3">アイコン</p>
              <div className="grid grid-cols-6 gap-2">
                {['😊', '😎', '🥰', '🤗', '👨', '👩', '👦', '👧', '🧒', '👶', '🐶', '🐱'].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewMemberEmoji(emoji)}
                      className={`text-2xl p-2 rounded-lg transition-colors ${
                        newMemberEmoji === emoji
                          ? 'bg-primary/10 ring-2 ring-primary'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            </div>

            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="名前"
              className="text-center text-lg py-3 px-4 border border-slate-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setNewMemberRole('child')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  newMemberRole === 'child'
                    ? 'bg-secondary text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                こども
              </button>
              <button
                onClick={() => setNewMemberRole('parent')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                  newMemberRole === 'parent'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                おとな
              </button>
            </div>

            <button
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium disabled:opacity-40"
            >
              追加
            </button>

            {familyId && members.length > 0 && (
              <button
                onClick={() => setScreen('select-member')}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                戻る
              </button>
            )}
          </div>
        )}

        {/* 家族作成画面 */}
        {screen === 'create-family' && (
          <div className="flex flex-col gap-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700 text-center">新しい家族</h2>

            <input
              type="text"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              placeholder="家族の名前"
              className="text-center text-lg py-3 px-4 border border-slate-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div>
              <p className="text-sm text-slate-400 mb-2 text-center">6桁のPINコード</p>
              <input
                type="text"
                value={newFamilyPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                  setNewFamilyPin(val)
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full text-2xl text-center py-3 px-4 border border-slate-200 rounded-xl tracking-[0.5em] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={handleCreateFamily}
              disabled={!newFamilyName.trim() || newFamilyPin.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium disabled:opacity-40"
            >
              作成
            </button>

            <button
              onClick={() => setScreen('pin')}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              戻る
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
