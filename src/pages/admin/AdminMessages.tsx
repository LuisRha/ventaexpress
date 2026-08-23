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

  // Form
  const [toUserId, setToUserId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isBroadcast, setIsBroadcast] = useState(false)

  // Sent messages
  const [sentMessages, setSentMessages] = useState<Array<{ id: string; subject: string; to_user_id: string; created_at: string; read: boolean }>>([])

  useEffect(() => {
    const load = async () => {
      // Cargar usuarios
      const { data } = await supabase.rpc('admin_get_users')
      if (data) {
        const { data: { session } } = await supabase.auth.getSession()
        const opts = (data as Array<{ user_id: string; email: string; full_name: string }>)
          .filter(u => u.user_id !== session?.user?.id)
          .map(u => ({ value: u.user_id, label: `${u.full_name || 'Sin nombre'} (${u.email})` }))
        setUsers(opts)
      }

      // Cargar mensajes enviados
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, subject, to_user_id, created_at, read')
        .order('created_at', { ascending: false })
        .limit(50)

      setSentMessages(msgs || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Completa asunto y mensaje')
      return
    }

    setSending(true)
    setError(null)

    if (isBroadcast) {
      const { error: err } = await messagesService.sendBroadcast(subject, body)
      if (err) { setError(err); setSending(false); return }
      setSuccess('Mensaje enviado a todos los usuarios')
    } else {
      if (!toUserId) { setError('Selecciona un destinatario'); setSending(false); return }
      const { error: err } = await messagesService.sendMessage(toUserId, subject, body)
      if (err) { setError(err); setSending(false); return }
      setSuccess('Mensaje enviado correctamente')
    }

    setSending(false)
    setShowCompose(false)
    setSubject('')
    setBody('')
    setToUserId('')
    setTimeout(() => setSuccess(null), 3000)

    // Recargar
    const { data: msgs } = await supabase
      .from('messages')
      .select('id, subject, to_user_id, created_at, read')
      .order('created_at', { ascending: false })
      .limit(50)
    setSentMessages(msgs || [])
  }

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Mensajes</h1>
        <Button onClick={() => setShowCompose(true)}>
          ✉️ Nuevo mensaje
        </Button>
      </div>

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {/* Mensajes enviados */}
      <Card>
        <h3 className="font-semibold text-secondary-900 mb-4">Mensajes enviados ({sentMessages.length})</h3>
        {sentMessages.length === 0 ? (
          <p className="text-sm text-secondary-500">No has enviado mensajes aún.</p>
        ) : (
          <div className="space-y-2">
            {sentMessages.map((msg) => {
              const recipient = users.find(u => u.value === msg.to_user_id)
              return (
                <div key={msg.id} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{msg.subject}</p>
                    <p className="text-xs text-secondary-500">Para: {recipient?.label || 'Usuario'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-secondary-400">{formatDateTime(msg.created_at)}</p>
                    <p className="text-xs text-secondary-500">{msg.read ? '✓ Leído' : '• No leído'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Modal componer */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Nuevo mensaje" size="lg">
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Toggle broadcast */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBroadcast}
                onChange={(e) => setIsBroadcast(e.target.checked)}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600"
              />
              <span className="text-sm text-secondary-700">Enviar a todos los usuarios</span>
            </label>
          </div>

          {/* Destinatario */}
          {!isBroadcast && (
            <Select
              label="Destinatario"
              options={users}
              placeholder="Selecciona un usuario"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
            />
          )}

          <Input
            label="Asunto"
            placeholder="Ej: Bienvenido a VentaExpress"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Textarea
            label="Mensaje"
            placeholder="Escribe tu mensaje aquí..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[150px]"
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSend} isLoading={sending}>
              {isBroadcast ? '📢 Enviar a todos' : '✉️ Enviar mensaje'}
            </Button>
            <Button variant="outline" onClick={() => setShowCompose(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
