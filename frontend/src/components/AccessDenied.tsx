import { ShieldOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  message?: string
}

export default function AccessDenied({ message }: Props) {
  const navigate = useNavigate()
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso restringido</h2>
        <p className="text-sm text-gray-500 mb-6">
          {message ?? 'Tu rol no tiene permisos para acceder a esta sección.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
