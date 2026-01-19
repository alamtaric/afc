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
    <div className="flex flex-col items-center gap-6">
      {/* PIN表示 */}
      <div className="flex gap-3">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-bold
              ${pin[i] ? 'border-primary bg-primary/10' : 'border-gray-300 bg-white'}`}
          >
            {pin[i] ? '●' : ''}
          </div>
        ))}
      </div>

      {/* 数字パッド */}
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl text-3xl font-bold
                       shadow-md hover:bg-gray-50 active:bg-gray-100 active:scale-95
                       transition-all duration-150"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-2xl text-xl font-bold
                     shadow-md hover:bg-gray-300 active:scale-95 transition-all duration-150"
        >
          クリア
        </button>
        <button
          onClick={() => handleNumberClick('0')}
          className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl text-3xl font-bold
                     shadow-md hover:bg-gray-50 active:bg-gray-100 active:scale-95
                     transition-all duration-150"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-20 h-20 md:w-24 md:h-24 bg-red-100 rounded-2xl text-2xl
                     shadow-md hover:bg-red-200 active:scale-95 transition-all duration-150"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
