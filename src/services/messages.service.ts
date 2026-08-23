import { supabase } from '@/lib/supabase'

export interface Message {
  id: string
  fromUserId: string | null
  toUserId: string
  subject: string
  body: string
  read: boolean
  createdAt: string
}

export const messagesService = {
  /**
   * Obtener mensajes recibidos por el usuario actual.
   */
  async getMyMessages(): Promise<{ messages: Message[]; error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { messages: [], error: null }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('to_user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) return { messages: [], error: error.message }

    return {
      messages: (data || []).map(mapMessage),
      error: null,
    }
  },

  /**
   * Contar mensajes no leídos.
   */
  async getUnreadCount(): Promise<number> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return 0

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', session.user.id)
      .eq('read', false)

    return count || 0
  },

  /**
   * Marcar mensaje como leído.
   */
  async markAsRead(messageId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
  },

  /**
   * Enviar mensaje (solo admin/CEO).
   */
  async sendMessage(toUserId: string, subject: string, body: string): Promise<{ error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { error: 'No autorizado' }

    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: session.user.id,
        to_user_id: toUserId,
        subject,
        body,
      })

    if (error) return { error: error.message }
    return { error: null }
  },

  /**
   * Enviar mensaje a todos los usuarios (broadcast).
   */
  async sendBroadcast(subject: string, body: string): Promise<{ error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { error: 'No autorizado' }

    // Obtener todos los usuarios excepto el admin
    const { data: users } = await supabase
      .from('user_roles')
      .select('user_id')
      .neq('user_id', session.user.id)

    if (!users || users.length === 0) return { error: 'No hay usuarios' }

    const messages = users.map((u) => ({
      from_user_id: session.user.id,
      to_user_id: u.user_id,
      subject,
      body,
    }))

    const { error } = await supabase.from('messages').insert(messages)
    if (error) return { error: error.message }
    return { error: null }
  },

  /**
   * Obtener todos los mensajes (admin).
   */
  async getAllMessages(): Promise<{ messages: Message[]; error: string | null }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return { messages: [], error: error.message }
    return { messages: (data || []).map(mapMessage), error: null }
  },
}

function mapMessage(data: Record<string, unknown>): Message {
  return {
    id: data.id as string,
    fromUserId: (data.from_user_id as string) || null,
    toUserId: data.to_user_id as string,
    subject: data.subject as string,
    body: data.body as string,
    read: data.read as boolean,
    createdAt: data.created_at as string,
  }
}
