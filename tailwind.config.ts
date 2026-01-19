import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',    // インディゴ
        secondary: '#8B5CF6',  // パープル
        accent: '#EC4899',     // ピンク
        muted: '#94A3B8',      // スレートグレー
        surface: '#F8FAFC',    // 明るい背景
      },
    },
  },
  plugins: [],
}
export default config
