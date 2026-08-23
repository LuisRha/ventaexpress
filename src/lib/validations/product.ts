import { z } from 'zod'

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre es demasiado largo'),
  slug: z
    .string()
    .min(2, 'La URL debe tener al menos 2 caracteres')
    .max(100, 'La URL es demasiado larga')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'Solo letras minúsculas, números y guiones. Debe empezar y terminar con letra o número.'
    ),
  description: z
    .string()
    .max(2000, 'La descripción es demasiado larga')
    .optional()
    .or(z.literal('')),
  benefits: z
    .string()
    .max(1000, 'Los beneficios son demasiado largos')
    .optional()
    .or(z.literal('')),
  price: z
    .number({ invalid_type_error: 'Ingresa un precio válido' })
    .min(0.01, 'El precio debe ser mayor a $0')
    .max(99999.99, 'El precio es demasiado alto'),
  previousPrice: z
    .number()
    .min(0, 'El precio anterior no puede ser negativo')
    .max(99999.99, 'El precio es demasiado alto')
    .nullable()
    .optional(),
  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .min(-1, 'Stock mínimo: -1 (ilimitado)')
    .optional()
    .default(-1),
  deliveryInfo: z
    .string()
    .max(500, 'La información de entrega es demasiado larga')
    .optional()
    .or(z.literal('')),
  paymentInfo: z
    .string()
    .max(500, 'La información de pago es demasiado larga')
    .optional()
    .or(z.literal('')),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema

export type UpdateProductFormData = z.infer<typeof updateProductSchema>
