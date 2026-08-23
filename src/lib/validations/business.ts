import { z } from 'zod'

export const createBusinessSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre es demasiado largo'),
  slug: z
    .string()
    .min(3, 'La URL debe tener al menos 3 caracteres')
    .max(50, 'La URL es demasiado larga')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Solo letras minúsculas, números y guiones. Debe empezar y terminar con letra o número.'
    ),
  description: z
    .string()
    .max(300, 'La descripción es demasiado larga')
    .optional()
    .or(z.literal('')),
  whatsappNumber: z
    .string()
    .regex(/^0[2-9][0-9]{8}$/, 'Ingresa un número válido de 10 dígitos (ej: 0991234567)')
    .optional()
    .or(z.literal('')),
})

export type CreateBusinessFormData = z.infer<typeof createBusinessSchema>

export const updateBusinessSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre es demasiado largo'),
  slug: z
    .string()
    .min(3, 'La URL debe tener al menos 3 caracteres')
    .max(50, 'La URL es demasiado larga')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Solo letras minúsculas, números y guiones. Debe empezar y terminar con letra o número.'
    ),
  description: z
    .string()
    .max(300, 'La descripción es demasiado larga')
    .optional()
    .or(z.literal('')),
  whatsappNumber: z
    .string()
    .regex(/^0[2-9][0-9]{8}$/, 'Ingresa un número válido de 10 dígitos (ej: 0991234567)')
    .optional()
    .or(z.literal('')),
})

export type UpdateBusinessFormData = z.infer<typeof updateBusinessSchema>
