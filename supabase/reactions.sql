-- リアクション機能テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください

-- reactions テーブル
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, member_id, emoji)
);

-- インデックス
CREATE INDEX idx_reactions_message_id ON reactions(message_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "reactions_delete" ON reactions FOR DELETE USING (true);

-- Realtime を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- DELETEイベントを受け取るために必要
ALTER TABLE reactions REPLICA IDENTITY FULL;
