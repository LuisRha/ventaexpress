import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { messagesService, type Message } from '@/services/messages.service'
import { formatDateTime } from '@/utils/format'

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const loadMessages = async () => {
    const { messages: data } = await messagesService.getMyMessages()
    setMessages(data)
    setLoading(false)
  }

  useEffect(() => { loadMessages() }, [])

  const handleOpen = async (msg: Message) => {
    setSelectedMessage(msg)
    if (!msg.read) {
      await messagesService.markAsRead(msg.id)
      loadMessages()
    }
  }

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Mensajes</h1>
        <p className="text-secondary-500 mt-1">Comunicaciones de la plataforma</p>
      </div>

      {messages.length === 0 ? (
        <EmptyState title="Sin mensajes" description="Cuando recibas un mensaje aparecerá aquí." />
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              padding="sm"
              className={`cursor-pointer hover:border-primary-200 transition-colors ${!msg.read ? 'bg-primary-50/50 border-primary-200' : ''}`}
              onClick={() => handleOpen(msg)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${!msg.read ? 'font-bold text-secondary-900' : 'font-medium text-secondary-700'}`}>
                      {msg.subject}
                    </p>
                    {!msg.read && <Badge variant="primary" size="sm">Nuevo</Badge>}
                  </div>
                  <p className="text-xs text-secondary-500 truncate mt-0.5">{msg.body}</p>
                </div>
                <span className="text-xs text-secondary-400 whitespace-nowrap">{formatDateTime(msg.createdAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de mensaje */}
      {selectedMessage && (
        <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} title={selectedMessage.subject} size="md">
          <div>
            <p className="text-xs text-secondary-500 mb-4">{formatDateTime(selectedMessage.createdAt)}</p>
            <div className="text-secondary-700 whitespace-pre-line leading-relaxed">
              {selectedMessage.body}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
