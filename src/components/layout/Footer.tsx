import { APP_NAME } from '@/utils/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-secondary-200 bg-secondary-50">
      <div className="container-app py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">VE</span>
            </div>
            <span className="text-sm text-secondary-600">
              {APP_NAME} &copy; {currentYear}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              Términos
            </a>
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
