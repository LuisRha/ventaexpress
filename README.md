# VentaExpress

SaaS de páginas de venta individuales para comerciantes de Ecuador.

## Concepto

Permite a comerciantes crear páginas individuales de producto y compartirlas en redes sociales (TikTok, Facebook, Instagram, WhatsApp). Los compradores acceden directamente, realizan un pedido y el vendedor gestiona todo desde un panel simple.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Deploy:** Vercel
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v6

## Requisitos

- Node.js 18+
- npm 9+
- Cuenta Supabase (free tier)

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd ventaexpress

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo backend) | Backend |
| `PAYMENT_PROVIDER` | Proveedor de pagos | Fase 15 |
| `VITE_APP_URL` | URL de la aplicación | Sí |

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
│   ├── ui/        # Sistema de diseño (Button, Input, Card...)
│   ├── shared/    # Loading, Empty, Error states
│   └── layout/    # Navbar, Footer, Sidebar
├── pages/         # Páginas por ruta
├── layouts/       # Layouts (Public, Auth, Dashboard, Admin)
├── hooks/         # Custom hooks
├── services/      # Comunicación con Supabase/APIs
├── lib/           # Configuración de librerías
├── utils/         # Helpers y constantes
├── types/         # Tipos TypeScript
├── contexts/      # React Context providers
└── styles/        # Estilos globales
```

## Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linter
```

## Fases de Desarrollo

1. ✅ Arquitectura y proyecto base
2. Base de datos (migraciones)
3. Row Level Security
4. Autenticación
5. Negocios
6. Productos
7. Storage
8. Imágenes (compresión)
9. Página pública
10. Pedidos
11. Dashboard
12. WhatsApp
13. Planes
14. Suscripciones
15. Pagos
16. Webhooks
17. Admin
18. Seguridad (hardening)
19. Testing
20. Deployment

## Seguridad

- Multi-tenant con RLS (Row Level Security)
- Autenticación via Supabase Auth
- Validación backend para operaciones sensibles
- Rate limiting
- Aislamiento completo entre negocios
- Service Role Key solo en Edge Functions

## Licencia

Privado. Todos los derechos reservados.
