import { z } from 'zod'
import { PROVINCES_ECUADOR } from '@/utils/constants'

export const orderFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre es requerido')
    .max(50, 'Nombre demasiado largo'),
  secondName: z
    .string()
    .max(50)
    .optional()
    .or(z.literal('')),
  lastName: z
    .string()
    .min(2, 'El apellido es requerido')
    .max(50, 'Apellido demasiado largo'),
  secondLastName: z
    .string()
    .max(50)
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^0[2-9][0-9]{8}$/, 'Ingresa un número válido de 10 dígitos (ej: 0991234567)'),
  province: z
    .string()
    .min(1, 'Selecciona una provincia')
    .refine((val) => PROVINCES_ECUADOR.includes(val as typeof PROVINCES_ECUADOR[number]), 'Provincia no válida'),
  city: z
    .string()
    .min(2, 'La ciudad es requerida')
    .max(100, 'Ciudad demasiado larga'),
  address: z
    .string()
    .min(5, 'La dirección es requerida')
    .max(300, 'Dirección demasiado larga'),
  reference: z
    .string()
    .max(200, 'Referencia demasiado larga')
    .optional()
    .or(z.literal('')),
  quantity: z
    .number({ invalid_type_error: 'Ingresa una cantidad' })
    .int('La cantidad debe ser un número entero')
    .min(1, 'Mínimo 1 unidad')
    .max(100, 'Máximo 100 unidades'),
  customerNotes: z
    .string()
    .max(500, 'Observaciones demasiado largas')
    .optional()
    .or(z.literal('')),
})

export type OrderFormData = z.infer<typeof orderFormSchema>
