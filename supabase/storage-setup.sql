-- 画像ストレージ設定
-- SQL Editorで実行してください

-- 1. ストレージバケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 誰でもアップロード可能
CREATE POLICY "allow_upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-images');

-- 3. 誰でも閲覧可能
CREATE POLICY "allow_read" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');
