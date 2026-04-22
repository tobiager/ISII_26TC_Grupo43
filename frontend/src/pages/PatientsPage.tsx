import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Users, UserCheck, BedDouble, ClipboardList,
  Search, ChevronDown, UserPlus, Stethoscope, LogOut, UserX, X, Eye, RotateCcw,
} from 'lucide-react'
import Modal from '../components/Modal'
import PatientForm from '../components/PatientForm'
import PatientTable from '../components/PatientTable'
import PatientDetailModal from '../components/PatientDetailModal'
import StatCard from '../components/StatCard'
import FeatureInProgress from '../components/FeatureInProgress'
import { patientService } from '../services/patientService'
import { locationService, type AdminUser } from '../services/locationService'
import type { Patient, PatientRequest } from '../types/patient'

const OBRAS_SOCIALES = ['Todas las Obras Sociales', 'OSDE', 'Swiss Medical', 'PAMI', 'Galeno', 'Medicus']
const ESTADOS = ['Todos los estados', 'Ambulatorio', 'Internado', 'Egresado']

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  const [search, setSearch] = useState('')
  const [filterOS, setFilterOS] = useState('Todas las Obras Sociales')
  const [filterEstado, setFilterEstado] = useState('Todos los estados')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Patient | null>(null)
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [deletedPatients, setDeletedPatients] = useState<Patient[]>([])
  const [loadingDeleted, setLoadingDeleted] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    locationService.getPerfil(ctrl.signal)
      .then(setAdminUser)
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setFetchError(false)
      const data = await patientService.getAll()
      setPatients(data)
    } catch {
      toast.error('No se pudieron cargar los pacientes')
      setPatients([])
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        p.nombreCompleto.toLowerCase().includes(q) ||
        String(p.dni).includes(q)
      const matchOS = filterOS === 'Todas las Obras Sociales' || p.obraSocial === filterOS
      const matchEstado = filterEstado === 'Todos los estados' || p.estado === filterEstado
      return matchSearch && matchOS && matchEstado
    })
  }, [patients, search, filterOS, filterEstado])

  const stats = useMemo(() => ({
    total: patients.length,
    internados: patients.filter(p => p.estado === 'Internado').length,
    camasDisponibles: fetchError ? 0 : 7,
    registrosTotales: fetchError ? 0 : patients.length + 10,
  }), [patients, fetchError])

  const openCreate = () => {
    setEditingPatient(null)
    setModalOpen(true)
  }

  const openDeleted = async () => {
    setShowDeleted(true)
    setLoadingDeleted(true)
    try {
      const data = await patientService.getDeleted()
      setDeletedPatients(data)
    } catch {
      toast.error('No se pudieron cargar los pacientes desactivados')
    } finally {
      setLoadingDeleted(false)
    }
  }

  const openView = async (p: Patient) => {
    try {
      const full = await patientService.getById(p.id)
      setViewingPatient(full)
    } catch {
      toast.error('No se pudo cargar la informacion del paciente')
    }
  }

  const openEdit = async (p: Patient) => {
    try {
      const full = await patientService.getById(p.id)
      setEditingPatient(full)
      setModalOpen(true)
    } catch {
      toast.error('No se pudo cargar el paciente')
    }
  }

  const handleRestaurar = async (p: Patient) => {
    try {
      await patientService.restaurar(p.id)
      toast.success(`${p.nombreCompleto} fue restaurado correctamente`)
      // Actualizar lista de eliminados
      setDeletedPatients(prev => prev.filter(x => x.id !== p.id))
      fetchPatients()
    } catch {
      toast.error('No se pudo restaurar el paciente')
    }
  }

  const handleSubmit = async (data: PatientRequest) => {
    setFormLoading(true)
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, data)
        toast.success('Paciente actualizado correctamente')
      } else {
        await patientService.create(data)
        toast.success('Paciente registrado correctamente')
      }
      setModalOpen(false)
      fetchPatients()
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al guardar el paciente'
      toast.error(msg)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await patientService.delete(deleteConfirm.id)
      toast.success(`${deleteConfirm.nombreCompleto} fue dado de baja`)
      setDeleteConfirm(null)
      fetchPatients()
    } catch {
      toast.error('No se pudo dar de baja al paciente')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Clinicks</span>
          </div>
          <nav className="flex items-center gap-1">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <Users size={15} />
              Pacientes
            </button>
            <FeatureInProgress featureName="camas">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                <BedDouble size={15} />
                Habitaciones
              </button>
            </FeatureInProgress>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
            {adminUser?.iniciales ?? '…'}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {adminUser ? `Adm. ${adminUser.nombreCompleto}` : '…'}
            </p>
            <p className="text-xs text-gray-500">{adminUser?.rol ?? ''}</p>
          </div>
          <FeatureInProgress featureName="cerrar sesión">
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-1">
              <LogOut size={16} />
            </button>
          </FeatureInProgress>
        </div>
      </header>

      {/* ─── CONTENT ─────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Título */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
            <p className="text-sm text-gray-500">Sistema de Gestión Hospitalaria</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} value={stats.total} label="Total Pacientes" iconBgColor="bg-blue-100" iconColor="text-blue-600" />
          <StatCard icon={UserCheck} value={stats.internados} label="Internados" iconBgColor="bg-purple-100" iconColor="text-purple-600" />
          <StatCard icon={BedDouble} value={stats.camasDisponibles} label="Camas Disponibles" iconBgColor="bg-green-100" iconColor="text-green-600" />
          <StatCard icon={ClipboardList} value={stats.registrosTotales} label="Registros Totales" iconBgColor="bg-orange-100" iconColor="text-orange-500" />
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header tabla */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Pacientes</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filtered.length} de {patients.length} pacientes
                  {stats.internados > 0 && ` (${stats.internados} internados`}
                  {stats.total - stats.internados - patients.filter(p => p.estado === 'Egresado').length > 0
                    && `, ${stats.total - stats.internados - patients.filter(p => p.estado === 'Egresado').length} ambulatorios`}
                  {stats.internados > 0 && ')'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openDeleted}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                <UserX size={16} />
                Ver Desactivados
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={16} />
                Registrar Paciente
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o DNI..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <select
                value={filterOS}
                onChange={e => setFilterOS(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
              >
                {OBRAS_SOCIALES.map(os => <option key={os}>{os}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
              >
                {ESTADOS.map(e => <option key={e}>{e}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Contenido tabla */}
          <div className="px-6 pb-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 mt-3">Cargando pacientes...</p>
              </div>
            ) : (
              <PatientTable
                patients={filtered}
                onView={openView}
                onEdit={openEdit}
                onDelete={setDeleteConfirm}
              />
            )}
          </div>
        </div>
      </main>

      {/* ─── MODAL CREAR / EDITAR ────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPatient ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
      >
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* ─── MODAL CONFIRMAR BAJA ────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Stethoscope size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar Baja</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              ¿Dar de baja a <strong>{deleteConfirm.nombreCompleto}</strong>?
              El registro se mantendrá en el sistema de forma inactiva.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Dar de Baja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL PACIENTES DESACTIVADOS ────────────────────────────────────── */}
      {showDeleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleted(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <UserX size={18} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pacientes Desactivados</h3>
                  <p className="text-xs text-gray-400">Registros dados de baja del sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleted(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {loadingDeleted ? (
                <div className="text-center py-12">
                  <div className="inline-block w-7 h-7 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 mt-3">Cargando...</p>
                </div>
              ) : deletedPatients.length === 0 ? (
                <div className="text-center py-12">
                  <UserX size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No hay pacientes desactivados</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="pb-3 font-medium">Paciente</th>
                      <th className="pb-3 font-medium">DNI</th>
                      <th className="pb-3 font-medium">Edad</th>
                      <th className="pb-3 font-medium">Obra Social</th>
                      <th className="pb-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {deletedPatients.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                              {p.nombre?.[0]}{p.apellido?.[0]}
                            </div>
                            <span className="font-medium text-gray-900">
                              {p.nombreCompleto}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-900 font-mono">{p.dni}</td>
                        <td className="py-3 pr-4 text-gray-900">{p.edad} años</td>
                        <td className="py-3 pr-4 text-gray-900">{p.obraSocial ?? '—'}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewingPatient(p)}
                              className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title="Ver informacion"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleRestaurar(p)}
                              className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-2.5 py-1 rounded-lg font-medium transition-colors"
                              title="Restaurar paciente"
                            >
                              <RotateCcw size={12} />
                              Restaurar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-400 text-center">
                {deletedPatients.length} paciente{deletedPatients.length !== 1 ? 's' : ''} desactivado{deletedPatients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DETALLE PACIENTE ──────────────────────────────────────────── */}
      <PatientDetailModal
        patient={viewingPatient}
        onClose={() => setViewingPatient(null)}
      />
    </div>
  )
}


