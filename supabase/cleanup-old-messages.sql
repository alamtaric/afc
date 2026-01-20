-- 1年以上前のメッセージを削除する関数
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- 1年以上前のメッセージを削除
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '1 year';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE 'Deleted % old messages', deleted_count;
END;
$$;

-- pg_cron拡張が有効な場合、毎日深夜3時に実行
-- Supabaseダッシュボードで有効化が必要
-- SELECT cron.schedule('cleanup-old-messages', '0 3 * * *', 'SELECT cleanup_old_messages()');

-- 手動で実行する場合
-- SELECT cleanup_old_messages();
