import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessagePayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    family_id: string
    sender_id: string
    content: string
    image_url: string | null
    created_at: string
  }
  schema: string
  old_record: null
}

interface MemberRecord {
  id: string
  name: string
  avatar_emoji: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: MessagePayload = await req.json()

    if (payload.type !== 'INSERT' || payload.table !== 'messages') {
      return new Response(JSON.stringify({ message: 'Not a message insert' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { record } = payload
    const { family_id, sender_id, content, image_url } = record

    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')
    const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error('OneSignal credentials not configured')
      return new Response(JSON.stringify({ error: 'OneSignal not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sender, error: senderError } = await supabase
      .from('members')
      .select('name, avatar_emoji')
      .eq('id', sender_id)
      .single()

    if (senderError || !sender) {
      console.error('Failed to get sender info:', senderError)
      return new Response(JSON.stringify({ error: 'Sender not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const notificationContent = image_url
      ? `${sender.avatar_emoji} ${sender.name}: 📷 写真を送信しました`
      : `${sender.avatar_emoji} ${sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        contents: { en: notificationContent, ja: notificationContent },
        headings: { en: 'ファミリーチャット', ja: 'ファミリーチャット' },
        filters: [
          { field: 'tag', key: 'familyId', relation: '=', value: family_id },
          { operator: 'AND' },
          { field: 'tag', key: 'memberId', relation: '!=', value: sender_id },
        ],
        url: '/chat',
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('OneSignal API error:', result)
      return new Response(JSON.stringify({ error: 'Failed to send notification', details: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing notification:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
