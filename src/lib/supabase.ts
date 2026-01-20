'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabaseクライアント（遅延初期化）
let supabaseInstance: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabaseが設定されていません。.env.localを確認してください。')
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// 家族関連の関数
export async function createFamily(name: string, pinCode: string, animalCode: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('families')
    .insert({ name, pin_code: pinCode, animal_code: animalCode })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinFamily(pinCode: string, animalCode: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('families')
    .select()
    .eq('pin_code', pinCode)
    .eq('animal_code', animalCode)
    .single()

  if (error) throw error
  return data
}

// メンバー関連の関数
export async function createMember(
  familyId: string,
  name: string,
  avatarEmoji: string,
  role: 'parent' | 'child'
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('members')
    .insert({ family_id: familyId, name, avatar_emoji: avatarEmoji, role })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMembers(familyId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('members')
    .select()
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// メッセージ関連の関数
export async function sendMessage(
  familyId: string,
  senderId: string,
  content: string,
  imageUrl?: string
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      family_id: familyId,
      sender_id: senderId,
      content,
      image_url: imageUrl || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMessages(
  familyId: string,
  options?: { before?: string; limit?: number }
) {
  const supabase = getSupabase()
  const limit = options?.limit || 50

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:members(*)
    `)
    .eq('family_id', familyId)

  if (options?.before) {
    query = query.lt('created_at', options.before)
  } else {
    // 初回は1日前から
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    query = query.gte('created_at', oneDayAgo.toISOString())
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  // 古い順に並び替えて返す
  return (data || []).reverse()
}

export async function getOlderMessages(
  familyId: string,
  beforeDate: string,
  limit: number = 30
) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:members(*)
    `)
    .eq('family_id', familyId)
    .lt('created_at', beforeDate)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse()
}

// 画像アップロード
export async function uploadImage(file: File, familyId: string) {
  const supabase = getSupabase()
  const fileExt = file.name.split('.').pop()
  const fileName = `${familyId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('chat-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}

// リアルタイム購読
export function subscribeToMessages(
  familyId: string,
  callback: (message: any) => void
) {
  const supabase = getSupabase()
  return supabase
    .channel(`messages:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}
