'use client'

import { useState } from 'react'

const ANIMALS = ['🐶', '🐱', '🐰', '🐻', '🦁', '🐼', '🐨', '🐯', '🦊', '🐸', '🐷', '🐮']

interface AnimalCodeInputProps {
  onSubmit: (code: string) => void
  length?: number
}

export default function AnimalCodeInput({ onSubmit, length = 4 }: AnimalCodeInputProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleAnimalClick = (animal: string) => {
    if (selected.length < length) {
      const newSelected = [...selected, animal]
      setSelected(newSelected)
      if (newSelected.length === length) {
        onSubmit(newSelected.join(''))
      }
    }
  }

  const handleDelete = () => {
    setSelected(selected.slice(0, -1))
  }

  const handleClear = () => {
    setSelected([])
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* 選択済み表示 */}
      <div className="flex gap-2">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-colors
              ${selected[i] ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}
          >
            {selected[i] || ''}
          </div>
        ))}
      </div>

      {/* アニマル選択グリッド */}
      <div className="grid grid-cols-4 gap-2">
        {ANIMALS.map((animal) => (
          <button
            key={animal}
            onClick={() => handleAnimalClick(animal)}
            className="w-14 h-14 bg-white rounded-xl text-2xl
                       border border-slate-200 hover:bg-slate-50 active:bg-slate-100
                       active:scale-95 transition-all"
          >
            {animal}
          </button>
        ))}
      </div>

      {/* 操作ボタン */}
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="px-5 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-500
                     hover:bg-slate-200 active:scale-95 transition-all"
        >
          クリア
        </button>
        <button
          onClick={handleDelete}
          className="px-5 py-2 bg-slate-100 rounded-xl text-lg text-slate-500
                     hover:bg-slate-200 active:scale-95 transition-all"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
