import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BedDouble, ClipboardList, Search, Shield, Stethoscope, Users,
  Calendar, AlertTriangle,
} from 'lucide-react'
import UserMenu from '../components/UserMenu'
import PatientDetailModal from '../components/PatientDetailModal'
import { patientService } from '../services/patientService'
import { useAuth } from '../contexts/AuthContext'
import { canAccessAdmin } from '../utils/permissions'
import type { Patient } from '../types/patient'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const estadoBadge: Record<string, string> = {
  Ambulatorio: 'bg-green-100 text-green-700',
  Internado:   'bg-blue-100 text-blue-700',
  Egresado:    'bg-gray-100 text-gray-600',
  Inactivo:    'bg-red-100 text-red-600',
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), "d MMM yyyy", { locale: es }) }
  catch { return '—' }
}

export default function HistorialPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user!.rol

  const [patients, setPatients]       = useState<Patient[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.apellido.toLowerCase().includes(q) ||
      String(p.dni).includes(q)
    )
  }, [patients, search])

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
              <Users size={15} />
              Pacientes
            </button>
            <button
              onClick={() => navigate('/habitaciones')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BedDouble size={15} />
              Habitaciones
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <ClipboardList size={15} />
              Historial
            </button>
            {canAccessAdmin(role) && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Shield size={15} />
                Admin
              </button>
            )}
          </nav>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>

        {/* Lista */}
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
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 first:pl-5 last:pr-5">
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
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoBadge[p.estado] ?? estadoBadge.Ambulatorio}`}>
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
                          onClick={() => setSelectedPatient(p)}
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

      {/* Modal de historial del paciente */}
      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        defaultTab="historial"
      />
    </div>
  )
}
