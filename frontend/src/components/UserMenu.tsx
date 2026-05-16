import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, KeyRound, Mail, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import CambiarPasswordModal from './CambiarPasswordModal'
import CambiarEmailModal from './CambiarEmailModal'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const esAdmin = user?.esAdminProtegido === true

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
            {user?.iniciales ?? '…'}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 leading-none">{user?.nombreCompleto ?? '…'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.rol ?? ''}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{user?.nombreCompleto}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
              <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                {user?.rol}
              </span>
            </div>

            {esAdmin ? (
              <div className="px-4 py-3 flex items-start gap-2 text-xs text-gray-500">
                <Shield size={13} className="mt-0.5 text-amber-500 shrink-0" />
                <span>Perfil de administrador protegido. Los datos no pueden modificarse desde aquí.</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setOpen(false); setShowPasswordModal(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <KeyRound size={15} className="text-gray-400" />
                  Cambiar contraseña
                </button>
                <button
                  onClick={() => { setOpen(false); setShowEmailModal(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail size={15} className="text-gray-400" />
                  Cambiar email
                </button>
              </>
            )}

            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <CambiarPasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <CambiarEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  )
}
