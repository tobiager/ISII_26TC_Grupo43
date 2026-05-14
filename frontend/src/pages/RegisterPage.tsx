import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Stethoscope, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'
import type { ValidarTokenResponse } from '../types/auth'

interface FormData {
  nombre: string
  apellido: string
  fechaNacimiento: string
  password: string
  confirmarPassword: string
}

interface FormErrors {
  nombre?: string
  apellido?: string
  fechaNacimiento?: string
  password?: string
  confirmarPassword?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [invitacion, setInvitacion] = useState<ValidarTokenResponse | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<FormData>({
    nombre: '', apellido: '', fechaNacimiento: '', password: '', confirmarPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!token) {
      setTokenError('No se proporcionó un token de invitación.')
      setLoadingToken(false)
      return
    }
    authService.validarToken(token)
      .then(data => { setInvitacion(data); setLoadingToken(false) })
      .catch(err => {
        const msg = err?.response?.data?.error ?? 'La invitación no es válida o ha expirado.'
        setTokenError(msg)
        setLoadingToken(false)
      })
  }, [token])

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!form.fechaNacimiento) e.fechaNacimiento = 'La fecha de nacimiento es obligatoria'
    if (!form.password) {
      e.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 8) {
      e.password = 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!form.confirmarPassword) {
      e.confirmarPassword = 'Confirmá la contraseña'
    } else if (form.password !== form.confirmarPassword) {
      e.confirmarPassword = 'Las contraseñas no coinciden'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authService.register({
        token,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento,
        password: form.password,
      })
      toast.success('Cuenta creada exitosamente. Ya podés iniciar sesión.')
      navigate('/login', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al completar el registro.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loadingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Invitación inválida</h2>
          <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:underline"
          >
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  const fieldClass = (field: keyof FormErrors) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Stethoscope size={20} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-2xl">Clinicks</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">Crear cuenta</h1>
            {invitacion && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">Email:</span> {invitacion.email}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  <span className="font-medium">Rol asignado:</span> {invitacion.rol}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={form.nombre} onChange={set('nombre')} className={fieldClass('nombre')} />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input type="text" value={form.apellido} onChange={set('apellido')} className={fieldClass('apellido')} />
                {errors.apellido && <p className="text-xs text-red-500 mt-1">{errors.apellido}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
              <input type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} className={fieldClass('fechaNacimiento')} />
              {errors.fechaNacimiento && <p className="text-xs text-red-500 mt-1">{errors.fechaNacimiento}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  className={fieldClass('password') + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmarPassword}
                  onChange={set('confirmarPassword')}
                  className={fieldClass('confirmarPassword') + ' pr-10'}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmarPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmarPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            ¿Ya tenés cuenta?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
              Iniciá sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
