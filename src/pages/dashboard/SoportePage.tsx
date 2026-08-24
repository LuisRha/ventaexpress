import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function SoportePage() {
  const { user, business } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      setError('Completa el asunto y el mensaje')
      return
    }

    setSending(true)
    setError(null)

    // Enviar mensaje al admin (buscar admin user_id)
    const { data: admin } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (admin) {
      await supabase.from('messages').insert({
        from_user_id: user?.id,
        to_user_id: admin.user_id,
        subject: `[Soporte] ${subject}`,
        body: `De: ${user?.email}\nNegocio: ${business?.name || 'Sin negocio'}\n\n${message}`,
      })
    }

    setSending(false)
    setSuccess(true)
    setSubject('')
    setMessage('')
    setTimeout(() => setSuccess(false), 5000)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-secondary-900">Soporte</h1>
        <p className="text-sm text-secondary-500">¿Necesitas ayuda? Envíanos un mensaje</p>
      </div>

      {success && <Alert variant="success" className="mb-4">Mensaje enviado. Te responderemos pronto.</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Asunto"
            placeholder="¿En qué podemos ayudarte?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            label="Mensaje"
            placeholder="Describe tu problema o consulta..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px]"
          />
          <Button type="submit" isLoading={sending}>
            Enviar mensaje
          </Button>
        </form>
      </Card>

      <Card className="mt-4 max-w-lg">
        <h3 className="font-semibold text-secondary-900 mb-2">Otros canales</h3>
        <div className="space-y-2 text-sm text-secondary-600">
          <p>📧 soporte@ventaexpress.com</p>
          <p>📱 WhatsApp: 0988271324</p>
          <p>⏰ Horario: Lunes a Viernes, 9am - 6pm</p>
        </div>
      </Card>
    </div>
  )
}
