import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { messagesService } from '@/services/messages.service'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/utils/format'

interface MessageItem {
  id: string
  from_user_id: string | null
  to_user_id: string
  subject: string
  body: string
  read: boolean
  created_at: string
}

interface UserOption {
  value: string
  label: string
}

export function AdminMessages() {
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null)
  const [replyText, setReplyText] = useState('')

  // Form
  const [toUserId, setToUserId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isBroadcast, setIsBroadcast] = useState(false)

  // Messages
  const [messages, setMessages] = useState<MessageItem[]>([])

  const loadData = async () => {
    const { data: userData } = await supabase.rpc('admin_get_users')
    if (userData) {
      const { data: { session } } = await supabase.auth.getSession()
      const opts = (userData as Array<{ user_id: string; email: string; full_name: string }>)
        .filter(u => u.user_id !== session?.user?.id)
        .map(u => ({ value: u.user_id, label: `${u.full_name || 'Sin nombre'} (${u.email})` }))
      setUsers(opts)
    }

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    setMessages((msgs || []) as MessageItem[])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { setError('Completa asunto y mensaje'); return }
    setSending(true)
    setError(null)

    if (isBroadcast) {
      const { error: err } = await messagesService.sendBroadcast(subject, body)
      if (err) { setError(err); setSending(false); return }
      setSuccess('Mensaje enviado a todos')
    } else {
      if (!toUserId) { setError('Selecciona un destinatario'); setSending(false); return }
      const { error: err } = await messagesService.sendMessage(toUserId, subject, body)
      if (err) { setError(err); setSending(false); return }
      setSuccess('Mensaje enviado')
    }

    setSending(false)
    setShowCompose(false)
    setSubject('')
    setBody('')
    setToUserId('')
    setTimeout(() => setSuccess(null), 3000)
    loadData()
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) return
    setSending(true)

    await messagesService.sendMessage(
      selectedMessage.from_user_id || selectedMessage.to_user_id,
      `Re: ${selectedMessage.subject}`,
      replyText
    )

    setSending(false)
    setReplyText('')
    setSelectedMessage(null)
    setSuccess('Respuesta enviada')
    setTimeout(() => setSuccess(null), 3000)
    loadData()
  }

  const handleOpenMessage = async (msg: MessageItem) => {
    setSelectedMessage(msg)
    if (!msg.read) {
      await supabase.from('messages').update({ read: true }).eq('id', msg.id)
      loadData()
    }
  }

  if (loading) return <LoadingSpinner className="py-12" />

  // Separar mensajes recibidos y enviados

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Mensajes</h1>
        <Button onClick={() => setShowCompose(true)}>✉️ Nuevo mensaje</Button>
      </div>

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {/* Lista de mensajes */}
      <Card>
        <h3 className="font-semibold text-secondary-900 mb-3">Todos los mensajes ({messages.length})</h3>
        {messages.length === 0 ? (
          <p className="text-sm text-secondary-500">No hay mensajes.</p>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${!msg.read ? 'bg-primary-50 border border-primary-200' : 'hover:bg-secondary-50'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!msg.read ? 'font-bold text-secondary-900' : 'font-medium text-secondary-700'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-secondary-500 truncate">{msg.body.slice(0, 80)}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-secondary-400">{formatDateTime(msg.created_at)}</p>
                  <p className="text-xs text-secondary-500">{msg.read ? '✓ Leído' : '• Nuevo'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal ver mensaje + responder */}
      {selectedMessage && (
        <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} title={selectedMessage.subject} size="lg">
          <div className="space-y-4">
            <p className="text-xs text-secondary-500">{formatDateTime(selectedMessage.created_at)}</p>
            <div className="bg-secondary-50 rounded-lg p-4 text-sm text-secondary-700 whitespace-pre-line">
              {selectedMessage.body}
            </div>

            {/* Responder */}
            <div className="border-t border-secondary-200 pt-4">
              <p className="text-sm font-medium text-secondary-900 mb-2">Responder:</p>
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px]"
              />
              <Button className="mt-2" onClick={handleReply} isLoading={sending} disabled={!replyText.trim()}>
                Enviar respuesta
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal componer nuevo */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Nuevo mensaje" size="lg">
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isBroadcast} onChange={(e) => setIsBroadcast(e.target.checked)} className="h-4 w-4 rounded border-secondary-300 text-primary-600" />
            <span className="text-sm text-secondary-700">Enviar a todos los usuarios</span>
          </label>

          {!isBroadcast && (
            <Select label="Destinatario" options={users} placeholder="Selecciona un usuario" value={toUserId} onChange={(e) => setToUserId(e.target.value)} />
          )}

          <Input label="Asunto" placeholder="Asunto del mensaje" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea label="Mensaje" placeholder="Escribe tu mensaje..." value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[120px]" />

          <div className="flex gap-3">
            <Button onClick={handleSend} isLoading={sending}>{isBroadcast ? '📢 Enviar a todos' : '✉️ Enviar'}</Button>
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
