import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Stethoscope, Eye, EyeOff, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isDemoMode, DEMO_CREDENTIALS } from '../mocks/demoMode'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  // Si ya está logueado, redirigir
  if (user) {
    navigate(getDefaultRoute(user.rol), { replace: true })
    return null
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!email) e.email = 'El email es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'El formato del email no es válido'
    if (!password) e.password = 'La contraseña es obligatoria'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login({ email, password })
      // Obtener rol del usuario actualizado desde el contexto
      const stored = localStorage.getItem('clinicks_user')
      const u = stored ? JSON.parse(stored) : null
      const route = u ? getDefaultRoute(u.rol) : '/'
      navigate(route, { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Credenciales incorrectas. Verifique email y contraseña.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Stethoscope size={20} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-2xl">Clinicks</span>
        </div>

        {/* Cuenta demo */}
        {isDemoMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-1">Cuenta demo (solo lectura)</p>
                <p>Email: <span className="font-mono">{DEMO_CREDENTIALS.email}</span></p>
                <p>Contraseña: <span className="font-mono">{DEMO_CREDENTIALS.password}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-sm text-gray-500 mt-1">Ingresá tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
                placeholder="admin@clinicks.com"
                className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors
                  ${errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg outline-none transition-colors
                    ${errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Sistema de Gestión Hospitalaria · Clinicks
        </p>
      </div>
    </div>
  )
}

function getDefaultRoute(rol: string): string {
  switch (rol) {
    case 'ADMINISTRADOR': return '/admin'
    default: return '/'
  }
}
