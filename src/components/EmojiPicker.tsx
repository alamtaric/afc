'use client'

const EMOJI_CATEGORIES = {
  かお: ['😀', '😊', '😍', '🥰', '😎', '🤗', '😴', '🤔', '😢', '😡', '🥺', '😱'],
  どうぶつ: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🦁', '🐸', '🐵', '🐷', '🐮', '🐔'],
  たべもの: ['🍎', '🍕', '🍔', '🍣', '🍦', '🍩', '🎂', '🍜', '🍙', '🥐', '🍿', '🧁'],
  こころ: ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '💝'],
  てんき: ['☀️', '🌙', '⭐', '🌈', '☁️', '🌧️', '⛈️', '❄️', '🌸', '🍀', '🌻', '🌺'],
  いろいろ: ['👍', '👏', '🙏', '✨', '🎉', '🎁', '🎈', '🎵', '💪', '🔥', '💯', '🏠'],
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">えもじをえらぶ</h3>
          <button
            onClick={onClose}
            className="text-3xl p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category} className="mb-4">
            <h4 className="text-lg font-bold text-gray-600 mb-2">{category}</h4>
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji)
                    onClose()
                  }}
                  className="btn-emoji"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
