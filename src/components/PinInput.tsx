'use client'

import { useState } from 'react'

interface PinInputProps {
  onSubmit: (pin: string) => void
  length?: number
}

export default function PinInput({ onSubmit, length = 6 }: PinInputProps) {
  const [pin, setPin] = useState('')

  const handleNumberClick = (num: string) => {
    if (pin.length < length) {
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === length) {
        onSubmit(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* PIN表示 */}
      <div className="flex gap-2">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors
              ${pin[i] ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-white'}`}
          >
            {pin[i] ? '●' : ''}
          </div>
        ))}
      </div>

      {/* 数字パッド */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="w-16 h-16 bg-white rounded-xl text-xl font-semibold text-slate-700
                       border border-slate-200 hover:bg-slate-50 active:bg-slate-100
                       active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="w-16 h-16 bg-slate-100 rounded-xl text-sm font-medium text-slate-500
                     hover:bg-slate-200 active:scale-95 transition-all"
        >
          クリア
        </button>
        <button
          onClick={() => handleNumberClick('0')}
          className="w-16 h-16 bg-white rounded-xl text-xl font-semibold text-slate-700
                     border border-slate-200 hover:bg-slate-50 active:bg-slate-100
                     active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 bg-slate-100 rounded-xl text-lg text-slate-500
                     hover:bg-slate-200 active:scale-95 transition-all"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
