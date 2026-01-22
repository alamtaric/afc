-- 既読管理テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください

-- message_reads テーブル
CREATE TABLE message_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, member_id)
);

-- インデックス
CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_member_id ON message_reads(member_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "message_reads_select" ON message_reads FOR SELECT USING (true);
CREATE POLICY "message_reads_insert" ON message_reads FOR INSERT WITH CHECK (true);

-- Realtime を有効化（既読状態をリアルタイム同期）
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;
