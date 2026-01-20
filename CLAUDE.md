# ファミリーチャット

家族向けのシンプルなチャットアプリ（PWA対応）

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Supabase (PostgreSQL + Realtime + Storage)
- **プッシュ通知**: OneSignal
- **PWA**: next-pwa
- **ホスティング**: Vercel

## プロジェクト構造

```
src/
├── app/
│   ├── layout.tsx      # ルートレイアウト (OneSignalProvider)
│   ├── page.tsx        # ホーム (PIN入力・家族作成)
│   ├── chat/
│   │   └── page.tsx    # チャット画面
│   └── globals.css     # グローバルスタイル
├── components/
│   ├── ChatMessage.tsx          # メッセージ表示
│   ├── MessageInput.tsx         # 入力欄
│   ├── EmojiPicker.tsx          # 絵文字選択
│   ├── ImageUpload.tsx          # 画像アップロード
│   ├── MemberSelector.tsx       # メンバー選択
│   ├── PinInput.tsx             # PIN入力
│   ├── OneSignalProvider.tsx    # プッシュ通知
│   └── NotificationPermission.tsx # 通知許可バナー
├── hooks/
│   ├── useFamily.ts    # 家族・セッション管理
│   └── useMessages.ts  # メッセージ取得・送信
└── lib/
    ├── supabase.ts     # Supabaseクライアント
    └── types.ts        # 型定義
```

## データベース構造

### families
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| name | VARCHAR(100) | 家族名 |
| pin_code | VARCHAR(6) | 参加用PINコード |
| created_at | TIMESTAMP | 作成日時 |

### members
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| family_id | UUID | 家族ID (FK) |
| name | VARCHAR(50) | メンバー名 |
| avatar_emoji | VARCHAR(10) | アバター絵文字 |
| role | 'parent' \| 'child' | 役割 |
| created_at | TIMESTAMP | 作成日時 |

### messages
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| family_id | UUID | 家族ID (FK) |
| sender_id | UUID | 送信者ID (FK) |
| content | TEXT | メッセージ本文 |
| image_url | TEXT | 画像URL (nullable) |
| created_at | TIMESTAMP | 作成日時 |

## 環境変数

### .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxx
```

### Supabase Edge Function Secrets
```
ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx
```

### Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_ONESIGNAL_APP_ID
```

## 主要機能

### 認証フロー
1. PINコードで家族に参加 or 新規作成
2. メンバーを選択してセッション開始
3. セッションは localStorage に保存

### メッセージ
- テキスト + 画像送信対応
- Supabase Realtime でリアルタイム受信
- 初回は1日前から読み込み、上スクロールで過去を取得
- 日付が変わると日付ラベルを表示

### プッシュ通知
- OneSignal を使用
- メッセージ送信時に Edge Function が発火
- 送信者以外の同じ家族メンバーに通知

### 画像
- Supabase Storage (`chat-images` バケット) に保存
- 5MB以下の画像のみ対応

## コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint
```

## 開発時の注意

### iOS対応
- 入力欄のフォントは16px以上（ズーム防止）
- 非PWAでは通知バナーを表示しない
- `autoComplete="off"` で自動入力ダイアログを抑制

### Supabase
- `supabase/` フォルダは tsconfig.json で除外済み
- Edge Function は Deno ランタイム

### ビルド
- `.next` フォルダがロックされる場合は dev サーバーを停止してから削除

## Supabase Edge Functions

### send-notification
- トリガー: Database Webhook (messages INSERT)
- 機能: OneSignal API で通知を送信
- フィルター: 同じ familyId かつ senderId 以外

## 定期タスク

### cleanup_old_messages
- 1年以上前のメッセージを削除
- pg_cron で毎日3時に実行
- `supabase/cleanup-old-messages.sql` 参照
