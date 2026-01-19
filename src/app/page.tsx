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
    loadMembers,
    clearError,
  } = useFamily()

  const [screen, setScreen] = useState<Screen>('pin')
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmoji, setNewMemberEmoji] = useState('😊')
  const [newMemberRole, setNewMemberRole] = useState<'parent' | 'child'>('child')
  const [newFamilyName, setNewFamilyName] = useState('')
  const [newFamilyPin, setNewFamilyPin] = useState('')

  // セッションがあればチャットへ
  useEffect(() => {
    if (session) {
      router.push('/chat')
    }
  }, [session, router])

  // PIN入力時
  const handlePinSubmit = async (pin: string) => {
    const id = await joinWithPin(pin)
    if (id) {
      setFamilyId(id)
      setScreen('select-member')
    }
  }

  // メンバー選択時
  const handleSelectMember = (member: Member) => {
    selectMember(member)
  }

  // メンバー追加完了
  const handleAddMember = async () => {
    if (!familyId || !newMemberName.trim()) return
    const member = await addMember(familyId, newMemberName, newMemberEmoji, newMemberRole)
    if (member) {
      setNewMemberName('')
      setNewMemberEmoji('😊')
      setScreen('select-member')
    }
  }

  // 家族作成完了
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-500">よみこみちゅう...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
            🏠 ファミリーチャット
          </h1>
          <p className="text-xl text-gray-600">かぞくでおはなし</p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-2xl text-center text-lg">
            {error}
            <button onClick={clearError} className="ml-2 underline">
              とじる
            </button>
          </div>
        )}

        {/* PIN入力画面 */}
        {screen === 'pin' && (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-700">
              PINコードをいれてね
            </h2>
            <PinInput onSubmit={handlePinSubmit} />
            <button
              onClick={() => setScreen('create-family')}
              className="mt-4 text-lg text-primary underline"
            >
              あたらしいかぞくをつくる
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
          <div className="flex flex-col items-center gap-6 bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700">
              メンバーをついか
            </h2>

            {/* 絵文字選択 */}
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">アイコンをえらぶ</p>
              <div className="grid grid-cols-6 gap-2">
                {['😊', '😎', '🥰', '🤗', '👨', '👩', '👦', '👧', '🧒', '👶', '🐶', '🐱'].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewMemberEmoji(emoji)}
                      className={`text-3xl p-2 rounded-xl ${
                        newMemberEmoji === emoji
                          ? 'bg-primary/20 ring-2 ring-primary'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 名前入力 */}
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="なまえ"
              className="w-full text-2xl text-center py-4 px-6 border-2 border-gray-200 rounded-2xl
                         focus:border-primary focus:outline-none"
            />

            {/* 役割選択 */}
            <div className="flex gap-4">
              <button
                onClick={() => setNewMemberRole('child')}
                className={`px-6 py-3 rounded-2xl text-xl font-bold ${
                  newMemberRole === 'child'
                    ? 'bg-secondary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                こども
              </button>
              <button
                onClick={() => setNewMemberRole('parent')}
                className={`px-6 py-3 rounded-2xl text-xl font-bold ${
                  newMemberRole === 'parent'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                おとな
              </button>
            </div>

            <button
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              ついか
            </button>

            {familyId && members.length > 0 && (
              <button
                onClick={() => setScreen('select-member')}
                className="text-lg text-gray-500 underline"
              >
                もどる
              </button>
            )}
          </div>
        )}

        {/* 家族作成画面 */}
        {screen === 'create-family' && (
          <div className="flex flex-col items-center gap-6 bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700">
              あたらしいかぞく
            </h2>

            <input
              type="text"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              placeholder="かぞくのなまえ"
              className="w-full text-2xl text-center py-4 px-6 border-2 border-gray-200 rounded-2xl
                         focus:border-primary focus:outline-none"
            />

            <div className="w-full">
              <p className="text-lg text-gray-600 mb-2 text-center">
                6けたのPINコード
              </p>
              <input
                type="text"
                value={newFamilyPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                  setNewFamilyPin(val)
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full text-3xl text-center py-4 px-6 border-2 border-gray-200 rounded-2xl
                           focus:border-primary focus:outline-none tracking-widest"
              />
            </div>

            <button
              onClick={handleCreateFamily}
              disabled={!newFamilyName.trim() || newFamilyPin.length !== 6}
              className="btn-primary w-full disabled:opacity-50"
            >
              つくる
            </button>

            <button
              onClick={() => setScreen('pin')}
              className="text-lg text-gray-500 underline"
            >
              もどる
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
