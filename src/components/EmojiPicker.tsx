'use client'

const EMOJI_CATEGORIES = {
  'よく使う': ['😀', '😊', '😍', '🥰', '😎', '🤗', '😴', '🤔', '😢', '😡', '🥺', '😱'],
  'どうぶつ': ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🦁', '🐸', '🐵', '🐷', '🐮', '🐔'],
  'たべもの': ['🍎', '🍕', '🍔', '🍣', '🍦', '🍩', '🎂', '🍜', '🍙', '🥐', '🍿', '🧁'],
  'ハート': ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '💝'],
  'その他': ['👍', '👏', '🙏', '✨', '🎉', '🎁', '🎈', '🎵', '💪', '🔥', '💯', '🏠'],
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-slate-700">絵文字</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-medium text-slate-400 mb-2">{category}</h4>
            <div className="grid grid-cols-6 gap-1">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji)
                    onClose()
                  }}
                  className="text-2xl p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
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
