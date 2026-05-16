import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Rol } from '../types/auth'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  allowedRoles?: Rol[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 mt-3">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso no autorizado</h2>
          <p className="text-sm text-gray-500 mb-6">
            No tenés permisos para acceder a esta sección.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
