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
    <div className="flex flex-col items-center gap-5">
      <h2 className="text-lg font-semibold text-slate-600">
        あなたは誰？
      </h2>

      <div className="grid grid-cols-2 gap-3 w-full">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl
                       border border-slate-100 shadow-sm
                       hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all"
          >
            <span className="text-4xl">{member.avatar_emoji}</span>
            <span className="text-base font-medium text-slate-700">
              {member.name}
            </span>
            <span className="text-xs text-slate-400">
              {member.role === 'parent' ? 'おとな' : 'こども'}
            </span>
          </button>
        ))}

        <button
          onClick={onAddMember}
          className="flex flex-col items-center justify-center gap-2 p-5
                     bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200
                     hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98] transition-all"
        >
          <span className="text-3xl text-slate-300">＋</span>
          <span className="text-sm font-medium text-slate-400">追加</span>
        </button>
      </div>
    </div>
  )
}
