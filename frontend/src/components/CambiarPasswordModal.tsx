import { useState } from 'react'
import { X, KeyRound, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import type { AuthUser } from '../types/auth'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CambiarPasswordModal({ open, onClose }: Props) {
  const { user, updateUser } = useAuth()
  const [passwordActual, setPasswordActual] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleClose = () => {
    setPasswordActual('')
    setNuevaPassword('')
    setConfirmarPassword('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nuevaPassword !== confirmarPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (nuevaPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setLoading(true)
    try {
      const perfil = await authService.cambiarPassword({ passwordActual, nuevaPassword })
      if (user) {
        updateUser({ ...user, mustChangePassword: perfil.mustChangePassword } as AuthUser)
      }
      toast.success('Contraseña actualizada correctamente')
      handleClose()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al cambiar la contraseña'
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
            <KeyRound size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña actual</label>
            <div className="relative">
              <input
                type={showActual ? 'text' : 'password'}
                value={passwordActual}
                onChange={e => setPasswordActual(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowActual(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showActual ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showNueva ? 'text' : 'password'}
                value={nuevaPassword}
                onChange={e => setNuevaPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowNueva(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNueva ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmarPassword}
              onChange={e => setConfirmarPassword(e.target.value)}
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
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
