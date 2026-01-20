# 実装メモ

## 2024年 OneSignal プッシュ通知 + チャット改善

---

## 1. OneSignal プッシュ通知

### 追加したファイル
- `public/OneSignalSDKWorker.js` - Service Worker
- `src/components/OneSignalProvider.tsx` - 初期化・ログイン/ログアウト処理
- `src/components/NotificationPermission.tsx` - 通知許可バナー
- `supabase/functions/send-notification/index.ts` - Edge Function

### 修正したファイル
- `src/app/layout.tsx` - OneSignalProvider でラップ
- `src/app/chat/page.tsx` - NotificationPermission 追加
- `src/hooks/useFamily.ts` - OneSignal ログイン/ログアウト処理追加
- `tsconfig.json` - supabase フォルダを除外
- `.env.local` - `NEXT_PUBLIC_ONESIGNAL_APP_ID` 追加

### パッケージ
```bash
npm install react-onesignal
```

### 環境変数
```
# .env.local
NEXT_PUBLIC_ONESIGNAL_APP_ID=04e35799-5e1e-4e89-a5a2-b93fa2188f27
```

### Supabase 設定

#### Secrets（ダッシュボード → Project Settings → Edge Functions）
| Name | Value |
|------|-------|
| `ONESIGNAL_APP_ID` | OneSignal App ID |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API Key |

#### Edge Function
ダッシュボードから `send-notification` を作成し、コードを貼り付け

#### Database Webhook
- テーブル: `messages`
- イベント: `INSERT`
- タイプ: Supabase Edge Functions
- 関数: `send-notification`

### Vercel 環境変数
| Name | Value |
|------|-------|
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | 04e35799-5e1e-4e89-a5a2-b93fa2188f27 |

---

## 2. チャット改善

### 画像投稿時の空吹き出し削除
- `src/components/ChatMessage.tsx`
- テキストがない場合は吹き出しを表示しない

### 日付表示（昨日以前）
- `src/components/ChatMessage.tsx`
- 日付が変わるタイミングで「昨日」「1月20日」などを表示
- `src/app/chat/page.tsx` - `shouldShowDate` 関数で判定

### 1日前まで読み込み + 無限スクロール
- `src/lib/supabase.ts` - `getMessages` と `getOlderMessages` を追加
- `src/hooks/useMessages.ts` - `loadMoreMessages`, `hasMore`, `loadingMore` を追加
- `src/app/chat/page.tsx` - スクロール検知で過去メッセージを読み込む

### 再読み込み時に最新位置までスクロール
- `src/app/chat/page.tsx`
- 初回は `behavior: 'instant'`、以降は `behavior: 'smooth'`

### iPhone入力フィールドの改善
- `src/components/MessageInput.tsx`
- `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`
- フォントサイズを16pxに（iOS ズーム防止）

### iOS非PWAで通知バナー非表示
- `src/components/NotificationPermission.tsx`
- iOSでスタンドアロンモード以外は通知バナーを表示しない

---

## 3. 1年以上前のメッセージ自動削除

### SQLファイル
`supabase/cleanup-old-messages.sql`

### Supabase での設定手順
1. SQL Editor で関数を作成
2. Database → Extensions → `pg_cron` を有効化
3. スケジュール登録:
```sql
SELECT cron.schedule(
  'cleanup-old-messages',
  '0 3 * * *',
  'SELECT cleanup_old_messages()'
);
```

---

## 動作確認

### 通知テスト
1. 2つの異なるブラウザでログイン
2. 両方で通知を許可
3. 片方からメッセージを送信
4. もう片方に通知が届くか確認

### OneSignal ダッシュボード
- Audience → Subscriptions で登録デバイス確認
- Delivery → Sent Messages で送信履歴確認

### Supabase ダッシュボード
- Edge Functions → Logs でエラー確認
- Database → Webhooks → Logs で発火確認
