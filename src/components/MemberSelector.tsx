'use client'

import { Member } from '@/lib/types'

interface MemberSelectorProps {
  members: Member[]
  onSelect: (member: Member) => void
  onAddMember: () => void
}

export default function MemberSelector({
  members,
  onSelect,
  onAddMember,
}: MemberSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
        だれですか？
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="flex flex-col items-center gap-2 p-6 bg-white rounded-3xl
                       shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
          >
            <span className="text-6xl">{member.avatar_emoji}</span>
            <span className="text-xl md:text-2xl font-bold text-gray-700">
              {member.name}
            </span>
            <span className="text-sm text-gray-400">
              {member.role === 'parent' ? 'おとな' : 'こども'}
            </span>
          </button>
        ))}

        {/* メンバー追加ボタン */}
        <button
          onClick={onAddMember}
          className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-100
                     rounded-3xl border-4 border-dashed border-gray-300
                     hover:bg-gray-200 active:scale-95 transition-all duration-150"
        >
          <span className="text-5xl text-gray-400">➕</span>
          <span className="text-lg font-bold text-gray-500">ついか</span>
        </button>
      </div>
    </div>
  )
}
