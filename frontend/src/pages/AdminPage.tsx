import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Users, Shield, Stethoscope, Copy, Check,
  UserCheck, UserX, RefreshCw, Send, ChevronDown, KeyRound, Lock,
} from 'lucide-react'
import { authService } from '../services/authService'
import UserMenu from '../components/UserMenu'
import type { AdminUsuario, InvitacionResponse, Rol } from '../types/auth'

const ADMIN_EMAIL = 'admin@clinicks.com'
const ROLES: Rol[] = ['ADMINISTRATIVO', 'MEDICO', 'ENFERMERO']
const ROL_LABELS: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  ADMINISTRATIVO: 'Administrativo',
  MEDICO: 'Médico',
  ENFERMERO: 'Enfermero',
}

type Tab = 'usuarios' | 'invitaciones'

export default function AdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('usuarios')

  // ── Estado usuarios ──────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [resetConfirmId, setResetConfirmId] = useState<number | null>(null)

  // ── Estado invitaciones ──────────────────────────────────────────────────
  const [invitaciones, setInvitaciones] = useState<InvitacionResponse[]>([])
  const [loadingInvitaciones, setLoadingInvitaciones] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // ── Formulario nueva invitación ──────────────────────────────────────────
  const [invEmail, setInvEmail] = useState('')
  const [invRol, setInvRol] = useState<Rol>('MEDICO')
  const [invExpiracion, setInvExpiracion] = useState('')
  const [invLoading, setInvLoading] = useState(false)
  const [invCreada, setInvCreada] = useState<InvitacionResponse | null>(null)

  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true)
    try {
      const data = await authService.listarUsuarios()
      setUsuarios(data)
    } catch {
      toast.error('No se pudieron cargar los usuarios')
    } finally {
      setLoadingUsuarios(false)
    }
  }, [])

  const fetchInvitaciones = useCallback(async () => {
    setLoadingInvitaciones(true)
    try {
      const data = await authService.listarInvitaciones()
      setInvitaciones(data)
    } catch {
      toast.error('No se pudieron cargar las invitaciones')
    } finally {
      setLoadingInvitaciones(false)
    }
  }, [])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])
  useEffect(() => { fetchInvitaciones() }, [fetchInvitaciones])

  const handleCambiarRol = async (u: AdminUsuario, nuevoRol: Rol) => {
    try {
      await authService.cambiarRol(u.idUsuario, nuevoRol)
      toast.success(`Rol de ${u.nombreCompleto} actualizado a ${ROL_LABELS[nuevoRol]}`)
      fetchUsuarios()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al cambiar el rol')
      fetchUsuarios()
    }
  }

  const handleToggleActivo = async (u: AdminUsuario) => {
    try {
      if (u.activo) {
        await authService.desactivarUsuario(u.idUsuario)
        toast.success(`${u.nombreCompleto} fue desactivado`)
      } else {
        await authService.activarUsuario(u.idUsuario)
        toast.success(`${u.nombreCompleto} fue reactivado`)
      }
      fetchUsuarios()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al modificar el usuario')
    }
  }

  const handleResetPassword = async (u: AdminUsuario) => {
    try {
      const res = await authService.resetearPassword(u.idUsuario)
      toast.success(`Contraseña reseteada. Temporal: ${res.temporaryPassword}`, { duration: 8000 })
      setResetConfirmId(null)
      fetchUsuarios()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al resetear la contraseña')
    }
  }

  const handleCrearInvitacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invEmail) return toast.error('El email es obligatorio')
    setInvLoading(true)
    try {
      const data = await authService.crearInvitacion({
        email: invEmail,
        rol: invRol,
        fechaExpiracion: invExpiracion || undefined,
      })
      setInvCreada(data)
      setInvEmail('')
      setInvExpiracion('')
      toast.success('Invitación creada correctamente')
      fetchInvitaciones()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al crear la invitación')
    } finally {
      setInvLoading(false)
    }
  }

  const copyLink = (link: string, id: number) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('Link copiado al portapapeles')
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Clinicks</span>
          </div>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Users size={15} />
              Pacientes
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <Shield size={15} />
              Admin
            </button>
          </nav>
        </div>
        <UserMenu />
      </header>

      {/* ─── CONTENT ────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500">Gestión de usuarios e invitaciones</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('usuarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === 'usuarios' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={15} />
            Usuarios
          </button>
          <button
            onClick={() => setTab('invitaciones')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === 'invitaciones' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Send size={15} />
            Invitaciones
          </button>
        </div>

        {/* ─── SECCIÓN USUARIOS ─── */}
        {tab === 'usuarios' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Usuarios del sistema</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{usuarios.length} usuarios registrados</p>
                </div>
              </div>
              <button onClick={fetchUsuarios} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="overflow-x-auto">
              {loadingUsuarios ? (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-3">Cargando usuarios...</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-6 pb-3 pt-4 font-medium">Usuario</th>
                      <th className="px-6 pb-3 pt-4 font-medium">Email</th>
                      <th className="px-6 pb-3 pt-4 font-medium">Rol</th>
                      <th className="px-6 pb-3 pt-4 font-medium">Estado</th>
                      <th className="px-6 pb-3 pt-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {usuarios.map(u => {
                      const esAdminProtegido = u.email === ADMIN_EMAIL
                      return (
                        <tr key={u.idUsuario} className={`hover:bg-gray-50 transition-colors ${esAdminProtegido ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                ${u.activo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                {u.iniciales}
                              </div>
                              <div>
                                <span className={`font-medium ${u.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {u.nombreCompleto}
                                </span>
                                {esAdminProtegido && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                    <Lock size={9} />
                                    Protegido
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{u.email}</td>
                          <td className="px-6 py-4">
                            {esAdminProtegido ? (
                              <span className="text-xs font-medium px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                                {ROL_LABELS[u.rol] ?? u.rol}
                              </span>
                            ) : (
                              <div className="relative inline-block">
                                <select
                                  value={u.rol}
                                  onChange={e => handleCambiarRol(u, e.target.value as Rol)}
                                  className="appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-lg border border-gray-200 bg-white outline-none focus:border-blue-400 cursor-pointer"
                                >
                                  {ROLES.map(r => (
                                    <option key={r} value={r}>{ROL_LABELS[r]}</option>
                                  ))}
                                </select>
                                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
                              ${u.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'}`}>
                              {u.activo ? <UserCheck size={11} /> : <UserX size={11} />}
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {!esAdminProtegido && (
                                <>
                                  <button
                                    onClick={() => handleToggleActivo(u)}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                                      ${u.activo
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                  >
                                    {u.activo ? 'Desactivar' : 'Activar'}
                                  </button>

                                  {resetConfirmId === u.idUsuario ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleResetPassword(u)}
                                        className="text-xs font-medium px-2 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() => setResetConfirmId(null)}
                                        className="text-xs font-medium px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setResetConfirmId(u.idUsuario)}
                                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                      title="Resetear contraseña a temporal"
                                    >
                                      <KeyRound size={11} />
                                      Reset pass
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ─── SECCIÓN INVITACIONES ─── */}
        {tab === 'invitaciones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Formulario nueva invitación */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Send size={18} className="text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900">Nueva invitación</h2>
                </div>

                <form onSubmit={handleCrearInvitacion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={invEmail}
                      onChange={e => setInvEmail(e.target.value)}
                      placeholder="usuario@clinicks.com"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                    <div className="relative">
                      <select
                        value={invRol}
                        onChange={e => setInvRol(e.target.value as Rol)}
                        className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{ROL_LABELS[r]}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Expiración <span className="text-gray-400">(opcional, default 7 días)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={invExpiracion}
                      onChange={e => setInvExpiracion(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={invLoading}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {invLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {invLoading ? 'Creando...' : 'Crear invitación'}
                  </button>
                </form>

                {/* Link generado */}
                {invCreada && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs font-medium text-green-700 mb-2">Link generado:</p>
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-green-600 break-all flex-1">{invCreada.invitationLink}</p>
                      <button
                        onClick={() => copyLink(invCreada.invitationLink, invCreada.idInvitacion)}
                        className="shrink-0 p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        title="Copiar link"
                      >
                        {copiedId === invCreada.idInvitacion ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de invitaciones */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div>
                    <h2 className="font-semibold text-gray-900">Invitaciones enviadas</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{invitaciones.length} invitaciones</p>
                  </div>
                  <button onClick={fetchInvitaciones} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                    <RefreshCw size={15} />
                  </button>
                </div>

                {loadingInvitaciones ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : invitaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <Send size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No hay invitaciones creadas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                          <th className="px-6 pb-3 pt-4 font-medium">Email</th>
                          <th className="px-6 pb-3 pt-4 font-medium">Rol</th>
                          <th className="px-6 pb-3 pt-4 font-medium">Estado</th>
                          <th className="px-6 pb-3 pt-4 font-medium">Expira</th>
                          <th className="px-6 pb-3 pt-4 font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {invitaciones.map(inv => (
                          <tr key={inv.idInvitacion} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-gray-700">{inv.email}</td>
                            <td className="px-6 py-3">
                              <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                                {ROL_LABELS[inv.rol] ?? inv.rol}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              {inv.usada ? (
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">Usada</span>
                              ) : inv.vencida ? (
                                <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-600 rounded-full">Vencida</span>
                              ) : (
                                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Pendiente</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-gray-500 text-xs">
                              {new Date(inv.fechaExpiracion).toLocaleDateString('es-AR')}
                            </td>
                            <td className="px-6 py-3">
                              {!inv.usada && !inv.vencida && (
                                <button
                                  onClick={() => copyLink(inv.invitationLink, inv.idInvitacion)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                  title="Copiar link"
                                >
                                  {copiedId === inv.idInvitacion ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
