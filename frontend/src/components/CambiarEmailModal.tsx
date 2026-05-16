import { useState } from 'react'
import { X, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CambiarEmailModal({ open, onClose }: Props) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [passwordActual, setPasswordActual] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleClose = () => {
    setNuevoEmail('')
    setPasswordActual('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.cambiarEmail({ nuevoEmail, passwordActual })
      toast.success('Email actualizado. Por seguridad, iniciá sesión nuevamente.')
      logout()
      navigate('/login', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al cambiar el email'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cambiar email</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Al cambiar el email se cerrará tu sesión y deberás iniciar sesión nuevamente con el nuevo email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nuevo email</label>
            <input
              type="email"
              value={nuevoEmail}
              onChange={e => setNuevoEmail(e.target.value)}
              required
              placeholder="nuevo@ejemplo.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña actual</label>
            <input
              type="password"
              value={passwordActual}
              onChange={e => setPasswordActual(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Guardando...' : 'Cambiar email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
