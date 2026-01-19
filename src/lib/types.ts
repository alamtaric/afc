export interface Family {
  id: string
  name: string
  pin_code: string
  created_at: string
}

export interface Member {
  id: string
  family_id: string
  name: string
  avatar_emoji: string
  role: 'parent' | 'child'
  created_at: string
}

export interface Message {
  id: string
  family_id: string
  sender_id: string
  content: string
  image_url: string | null
  created_at: string
  sender?: Member
}

export interface FamilySession {
  familyId: string
  memberId: string
  memberName: string
  memberEmoji: string
}
