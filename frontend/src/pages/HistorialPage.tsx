import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertTriangle, BedDouble, Calendar, ClipboardList,
  Filter, Search, Shield, Stethoscope, Users, X,
} from 'lucide-react'
import UserMenu from '../components/UserMenu'
import CustomSelect from '../components/CustomSelect'
import { patientService } from '../services/patientService'
import { useAuth } from '../contexts/AuthContext'
import { canAccessAdmin } from '../utils/permissions'
import type { Patient } from '../types/patient'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_BADGE: Record<string, string> = {
  Ambulatorio: 'bg-green-100 text-green-700',
  Internado:   'bg-blue-100 text-blue-700',
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), "dd/MM/yyyy") }
  catch { return '—' }
}

interface GlobalFilters {
  search: string
  estado: string
  obraSocial: string
  conAlergias: boolean
}

const EMPTY_GLOBAL: GlobalFilters = { search: '', estado: '', obraSocial: '', conAlergias: false }

export default function HistorialPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user!.rol

  const [patients, setPatients]   = useState<Patient[]>([])
  const [loading, setLoading]     = useState(true)
  const [filters, setFilters]     = useState<GlobalFilters>(EMPTY_GLOBAL)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await patientService.getAll()
      setPatients(data)
    } catch {
      toast.error('No se pudieron cargar los pacientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Opciones únicas para filtros de obra social
  const uniqueObrasSociales = useMemo(() =>
    [...new Set(patients.map(p => p.obraSocial).filter(Boolean) as string[])].sort(),
  [patients])

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return patients.filter(p => {
      if (q && !p.nombre.toLowerCase().includes(q) && !p.apellido.toLowerCase().includes(q) && !String(p.dni).includes(q)) return false
      if (filters.estado && p.estado !== filters.estado) return false
      if (filters.obraSocial && p.obraSocial !== filters.obraSocial) return false
      if (filters.conAlergias && !(Array.isArray(p.alergias) && p.alergias.length > 0)) return false
      return true
    })
  }, [patients, filters])

  const setFilter = <K extends keyof GlobalFilters>(key: K, val: GlobalFilters[K]) =>
    setFilters(f => ({ ...f, [key]: val }))

  const hasActiveFilters = !!(
    filters.search || filters.estado || filters.obraSocial || filters.conAlergias
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
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
              onClick={() => navigate('/pacientes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Users size={15} /> Pacientes
            </button>
            <button
              onClick={() => navigate('/habitaciones')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BedDouble size={15} /> Habitaciones
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <ClipboardList size={15} /> Historial
            </button>
            {canAccessAdmin(role) && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Shield size={15} /> Admin
              </button>
            )}
          </nav>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <ClipboardList size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial Médico</h1>
            <p className="text-sm text-gray-500">
              {loading ? 'Cargando...' : `${filtered.length} paciente${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Filtros globales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={13} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtros</span>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters(EMPTY_GLOBAL)}
                className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Búsqueda principal */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                placeholder="Nombre, apellido o DNI..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
              />
            </div>
            {/* Estado */}
            <CustomSelect
              value={filters.estado}
              onChange={val => setFilter('estado', val)}
              options={[
                { value: '', label: 'Estado: Todos' },
                { value: 'Ambulatorio', label: 'Ambulatorio' },
                { value: 'Internado', label: 'Internado' },
              ]}
              className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer"
            />
            {/* Obra social */}
            <CustomSelect
              value={filters.obraSocial}
              onChange={val => setFilter('obraSocial', val)}
              options={[
                { value: '', label: 'Obra social: Todas' },
                ...uniqueObrasSociales.map(os => ({ value: os, label: os })),
              ]}
              className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer"
            />
            {/* Con alergias */}
            <label className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={filters.conAlergias}
                onChange={e => setFilter('conAlergias', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <AlertTriangle size={13} className="text-amber-500" />
                Con alergias
              </div>
            </label>
          </div>
        </div>

        {/* Lista de pacientes */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Cargando pacientes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Paciente', 'DNI', 'Edad', 'Estado', 'Obra Social', 'Última visita', ''].map(h => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 first:pl-5 last:pr-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const alergias = Array.isArray(p.alergias) ? p.alergias : []
                  const iniciales = `${p.nombre?.[0] ?? ''}${p.apellido?.[0] ?? ''}`
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Paciente */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {iniciales}
                            </div>
                            {alergias.length > 0 && (
                              <AlertTriangle size={12} className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{p.apellido}, {p.nombre}</p>
                            {alergias.length > 0 && (
                              <p className="text-xs text-red-500 mt-0.5">Alergias: {alergias.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* DNI */}
                      <td className="px-5 py-4 font-mono text-gray-700">{p.dni}</td>
                      {/* Edad */}
                      <td className="px-5 py-4 text-gray-600">{p.edad} años</td>
                      {/* Estado */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_BADGE[p.estado] ?? ESTADO_BADGE.Ambulatorio}`}>
                            {p.estado}
                          </span>
                          {p.estado === 'Internado' && p.numeroHabitacion && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md">
                              <BedDouble size={11} />
                              {p.numeroHabitacion}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Obra social */}
                      <td className="px-5 py-4 text-gray-600">{p.obraSocial ?? '—'}</td>
                      {/* Última visita */}
                      <td className="px-5 py-4 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(p.ultimaVisita)}
                        </span>
                      </td>
                      {/* Acción */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => navigate(`/historial/${p.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <ClipboardList size={12} />
                          Ver historial
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
