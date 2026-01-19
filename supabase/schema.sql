-- ファミリーチャット データベーススキーマ
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. families テーブル
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  pin_code VARCHAR(6) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. members テーブル
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar_emoji VARCHAR(10) DEFAULT '😊',
  role VARCHAR(10) CHECK (role IN ('parent', 'child')) DEFAULT 'child',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. messages テーブル
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_members_family_id ON members(family_id);
CREATE INDEX idx_messages_family_id ON messages(family_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_families_pin_code ON families(pin_code);

-- Row Level Security (RLS) を有効化
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "families_select" ON families FOR SELECT USING (true);
CREATE POLICY "families_insert" ON families FOR INSERT WITH CHECK (true);
CREATE POLICY "members_select" ON members FOR SELECT USING (true);
CREATE POLICY "members_insert" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);

-- Realtime を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
