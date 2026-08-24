import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const asuntoOptions = [
  { value: 'Problema con mi cuenta', label: 'Problema con mi cuenta' },
  { value: 'No puedo subir imágenes', label: 'No puedo subir imágenes' },
  { value: 'Problema con un pedido', label: 'Problema con un pedido' },
  { value: 'Quiero cambiar de plan', label: 'Quiero cambiar de plan' },
  { value: 'Error en la página de producto', label: 'Error en la página de producto' },
  { value: 'Problema con el pago', label: 'Problema con el pago' },
  { value: 'Solicitar eliminación de cuenta', label: 'Solicitar eliminación de cuenta' },
  { value: 'Sugerencia o mejora', label: 'Sugerencia o mejora' },
  { value: 'Otro', label: 'Otro' },
]

export function SoportePage() {
  const { user, business } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message.trim()) {
      setError('Selecciona un asunto y escribe tu mensaje')
      return
    }

    setSending(true)
    setError(null)

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
          <Select
            label="Asunto"
            options={asuntoOptions}
            placeholder="Selecciona un asunto"
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
    </div>
  )
}
