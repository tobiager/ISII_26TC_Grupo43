import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  BedDouble, Users, Wrench, CheckCircle, X, Stethoscope,
  Shield, ClipboardList, ArrowRightLeft, LogOut, User, ChevronDown,
} from 'lucide-react'
import UserMenu from '../components/UserMenu'
import CustomSelect from '../components/CustomSelect'
import ReadOnlyBadge from '../components/ReadOnlyBadge'
import PatientDetailModal from '../components/PatientDetailModal'
import { roomService } from '../services/roomService'
import { patientService } from '../services/patientService'
import { useAuth } from '../contexts/AuthContext'
import {
  canAdmitPatient,
  canTransferPatient,
  canDischargePatient,
  canManageRooms,
  canAccessAdmin,
} from '../utils/permissions'
import type { Habitacion } from '../types/room'
import type { Patient } from '../types/patient'

const ESTADO_CONFIG = {
  disponible:    { label: 'Disponible',    bg: 'bg-green-100 text-green-700',  border: 'border-t-4 border-t-green-400' },
  ocupada:       { label: 'Ocupada',       bg: 'bg-blue-100 text-blue-700',    border: 'border-t-4 border-t-blue-400'  },
  mantenimiento: { label: 'Mantenimiento', bg: 'bg-amber-100 text-amber-700',  border: 'border-t-4 border-t-amber-400' },
} as const

export default function HabitacionesPage() {
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const role = user!.rol

  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([])
  const [loading, setLoading]           = useState(true)
  const [patients, setPatients]         = useState<Patient[]>([])

  // ── modal internar ────────────────────────────────────────────────
  const [internModal, setInternModal]           = useState<Habitacion | null>(null)
  const [internPatientId, setInternPatientId]   = useState<number | ''>('')
  const [internMotivo, setInternMotivo]         = useState('')
  const [internLoading, setInternLoading]       = useState(false)

  // ── modal trasladar ───────────────────────────────────────────────
  const [trasladoModal, setTrasladoModal]               = useState<Habitacion | null>(null)
  const [trasladoDestino, setTrasladoDestino]           = useState<number | ''>('')
  const [trasladoMotivo, setTrasladoMotivo]             = useState('')
  const [trasladoObs, setTrasladoObs]                   = useState('')
  const [trasladoLoading, setTrasladoLoading]           = useState(false)

  // ── modal egresar ─────────────────────────────────────────────────
  const [egresoModal, setEgresoModal]       = useState<Habitacion | null>(null)
  const [egresoObs, setEgresoObs]           = useState('')
  const [egresoLoading, setEgresoLoading]   = useState(false)

  // ── cambio de estado de habitación ───────────────────────────────
  const [estadoLoading, setEstadoLoading]   = useState<number | null>(null)

  // ── modal ver paciente ────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedRoom, setSelectedRoom]       = useState<Habitacion | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await roomService.getAll()
      setHabitaciones(data)
    } catch {
      toast.error('No se pudieron cargar las habitaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    patientService.getAll().then(setPatients).catch(() => {})
  }, [])

  const pisos = useMemo(() => {
    const map = new Map<number, Habitacion[]>()
    habitaciones.forEach(h => {
      const arr = map.get(h.pisoHabitacion) ?? []
      arr.push(h)
      map.set(h.pisoHabitacion, arr)
    })
    return [...map.entries()].sort(([a], [b]) => a - b)
  }, [habitaciones])

  const stats = useMemo(() => ({
    total:        habitaciones.length,
    disponibles:  habitaciones.filter(h => h.estadoHabitacion === 'disponible').length,
    ocupadas:     habitaciones.filter(h => h.estadoHabitacion === 'ocupada').length,
    mantenimiento:habitaciones.filter(h => h.estadoHabitacion === 'mantenimiento').length,
  }), [habitaciones])

  const disponiblesParaTraslado = habitaciones.filter(
    h => h.estadoHabitacion === 'disponible' && h.id !== trasladoModal?.id,
  )

  // ── pacientes no internados para el selector ──────────────────────
  const pacientesNoInternados = patients.filter(p => p.estado !== 'Internado')

  // ── acciones ─────────────────────────────────────────────────────

  const openInternar = (h: Habitacion) => {
    setInternPatientId('')
    setInternMotivo('')
    setInternModal(h)
  }

  const handleInternar = async () => {
    if (!internModal || !internPatientId || !internMotivo.trim()) return
    setInternLoading(true)
    try {
      await roomService.internar({ idPaciente: Number(internPatientId), idHabitacion: internModal.id, motivo: internMotivo })
      toast.success('Paciente internado correctamente')
      setInternModal(null)
      fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al internar el paciente')
    } finally {
      setInternLoading(false)
    }
  }

  const openTrasladar = (h: Habitacion) => {
    setTrasladoDestino('')
    setTrasladoMotivo('')
    setTrasladoObs('')
    setTrasladoModal(h)
  }

  const handleTrasladar = async () => {
    if (!trasladoModal?.internacionActual || !trasladoDestino || !trasladoMotivo.trim()) return
    setTrasladoLoading(true)
    try {
      await roomService.trasladar(trasladoModal.internacionActual.id, {
        idHabitacionDestino: Number(trasladoDestino),
        motivo: trasladoMotivo,
        observaciones: trasladoObs || undefined,
      })
      toast.success('Paciente trasladado correctamente')
      setTrasladoModal(null)
      fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al trasladar el paciente')
    } finally {
      setTrasladoLoading(false)
    }
  }

  const openEgresar = (h: Habitacion) => {
    setEgresoObs('')
    setEgresoModal(h)
  }

  const handleEgresar = async () => {
    if (!egresoModal?.internacionActual) return
    setEgresoLoading(true)
    try {
      await roomService.egresar(egresoModal.internacionActual.id, { observaciones: egresoObs || undefined })
      toast.success('Paciente egresado correctamente')
      setEgresoModal(null)
      fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al egresar el paciente')
    } finally {
      setEgresoLoading(false)
    }
  }

  const handleVerPaciente = (id: number) => {
    const patient = patients.find(p => p.id === id) ?? null
    const room    = habitaciones.find(h => h.pacienteActual?.id === id) ?? null
    setSelectedPatient(patient)
    setSelectedRoom(room)
  }

  const handleCambiarEstado = async (hab: Habitacion, nuevoEstado: 'disponible' | 'mantenimiento') => {
    setEstadoLoading(hab.id)
    try {
      await roomService.cambiarEstado(hab.id, nuevoEstado)
      toast.success(nuevoEstado === 'mantenimiento' ? 'Habitación marcada en mantenimiento' : 'Habitación marcada como disponible')
      fetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Error al cambiar estado de la habitación')
    } finally {
      setEstadoLoading(null)
    }
  }

  const isReadOnly = !canAdmitPatient(role) && !canTransferPatient(role) && !canDischargePatient(role) && !canManageRooms(role)

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
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <BedDouble size={15} />
              Habitaciones
            </button>
            <button
              onClick={() => navigate('/historial')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <ClipboardList size={15} />
              Historial
            </button>
            {hasRole('ADMINISTRADOR') && (
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

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Título */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <BedDouble size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mapa de Habitaciones</h1>
              <p className="text-sm text-gray-500">Gestión de camas e internaciones</p>
            </div>
          </div>
          {isReadOnly && (
            <ReadOnlyBadge message="Tu rol no permite gestionar habitaciones." />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={BedDouble}   value={stats.total}         label="Total"         color="blue"  />
          <StatCard icon={CheckCircle} value={stats.disponibles}   label="Disponibles"   color="green" />
          <StatCard icon={Users}       value={stats.ocupadas}      label="Ocupadas"      color="blue"  />
          <StatCard icon={Wrench}      value={stats.mantenimiento} label="Mantenimiento" color="amber" />
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Cargando habitaciones...</p>
          </div>
        ) : pisos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BedDouble size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay habitaciones registradas</p>
          </div>
        ) : (
          pisos.map(([piso, rooms]) => (
            <div key={piso} className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Piso {piso}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {rooms.map(h => (
                  <RoomCard
                    key={h.id}
                    habitacion={h}
                    canAdmit={canAdmitPatient(role)}
                    canTransfer={canTransferPatient(role)}
                    canDischarge={canDischargePatient(role)}
                    canManage={canManageRooms(role)}
                    estadoLoading={estadoLoading === h.id}
                    onInternar={() => openInternar(h)}
                    onTrasladar={() => openTrasladar(h)}
                    onEgresar={() => openEgresar(h)}
                    onVerPaciente={id => handleVerPaciente(id)}
                    onCambiarEstado={estado => handleCambiarEstado(h, estado)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* MODAL INTERNAR */}
      {internModal && (
        <Modal title={`Internar Paciente — Habitación ${internModal.numeroHabitacion}`} onClose={() => setInternModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <CustomSelect
                value={String(internPatientId)}
                onChange={val => setInternPatientId(val === '' ? '' : Number(val))}
                options={[
                  { value: '', label: 'Seleccionar paciente...' },
                  ...pacientesNoInternados.map(p => ({ value: String(p.id), label: `${p.nombreCompleto} — DNI ${p.dni}` })),
                ]}
                className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Internación</label>
              <textarea
                value={internMotivo}
                onChange={e => setInternMotivo(e.target.value)}
                rows={3}
                placeholder="Describa el motivo de la internación..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setInternModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleInternar}
              disabled={!internPatientId || !internMotivo.trim() || internLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {internLoading ? 'Internando...' : 'Confirmar Internación'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL TRASLADAR */}
      {trasladoModal && (
        <Modal
          title={`Trasladar Paciente — Habitación ${trasladoModal.numeroHabitacion}`}
          onClose={() => setTrasladoModal(null)}
        >
          <div className="space-y-4">
            {trasladoModal.pacienteActual && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                <p className="text-xs text-blue-500 font-medium mb-1">Paciente a trasladar</p>
                <p className="font-medium text-blue-900">{trasladoModal.pacienteActual.nombreCompleto}</p>
                <p className="text-blue-600 text-xs">DNI {trasladoModal.pacienteActual.dni}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habitación destino</label>
              <CustomSelect
                value={String(trasladoDestino)}
                onChange={val => setTrasladoDestino(val === '' ? '' : Number(val))}
                options={[
                  { value: '', label: 'Seleccionar habitación...' },
                  ...disponiblesParaTraslado.map(h => ({ value: String(h.id), label: `Habitación ${h.numeroHabitacion} — Piso ${h.pisoHabitacion}` })),
                ]}
                className="w-full py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer"
              />
              {disponiblesParaTraslado.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No hay habitaciones disponibles para traslado.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del traslado</label>
              <input
                value={trasladoMotivo}
                onChange={e => setTrasladoMotivo(e.target.value)}
                placeholder="Motivo del traslado..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea
                value={trasladoObs}
                onChange={e => setTrasladoObs(e.target.value)}
                rows={2}
                placeholder="Observaciones adicionales..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setTrasladoModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleTrasladar}
              disabled={!trasladoDestino || !trasladoMotivo.trim() || trasladoLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trasladoLoading ? 'Trasladando...' : 'Confirmar Traslado'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL VER PACIENTE */}
      <PatientDetailModal
        patient={selectedPatient}
        onClose={() => { setSelectedPatient(null); setSelectedRoom(null) }}
        defaultTab="info"
        roomActions={
          selectedRoom
            ? {
                onTrasladar: canTransferPatient(role)
                  ? () => { setSelectedPatient(null); setSelectedRoom(null); openTrasladar(selectedRoom) }
                  : undefined,
                onEgresar: canDischargePatient(role)
                  ? () => { setSelectedPatient(null); setSelectedRoom(null); openEgresar(selectedRoom) }
                  : undefined,
              }
            : undefined
        }
      />

      {/* MODAL EGRESAR */}
      {egresoModal && (
        <Modal
          title={`Egresar Paciente — Habitación ${egresoModal.numeroHabitacion}`}
          onClose={() => setEgresoModal(null)}
        >
          <div className="space-y-4">
            {egresoModal.pacienteActual && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm">
                <p className="text-xs text-amber-600 font-medium mb-1">Paciente a egresar</p>
                <p className="font-medium text-amber-900">{egresoModal.pacienteActual.nombreCompleto}</p>
                <p className="text-amber-700 text-xs">DNI {egresoModal.pacienteActual.dni}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea
                value={egresoObs}
                onChange={e => setEgresoObs(e.target.value)}
                rows={3}
                placeholder="Motivo del egreso, indicaciones, etc..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEgresoModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleEgresar}
              disabled={egresoLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {egresoLoading ? 'Egresando...' : 'Confirmar Egreso'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface RoomCardProps {
  habitacion: Habitacion
  canAdmit: boolean
  canTransfer: boolean
  canDischarge: boolean
  canManage: boolean
  estadoLoading: boolean
  onInternar: () => void
  onTrasladar: () => void
  onEgresar: () => void
  onVerPaciente: (id: number) => void
  onCambiarEstado: (estado: 'disponible' | 'mantenimiento') => void
}

function RoomCard({ habitacion: h, canAdmit, canTransfer, canDischarge, canManage, estadoLoading, onInternar, onTrasladar, onEgresar, onVerPaciente, onCambiarEstado }: RoomCardProps) {
  const cfg = ESTADO_CONFIG[h.estadoHabitacion] ?? ESTADO_CONFIG.disponible

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${cfg.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BedDouble size={16} className="text-gray-500" />
          <span className="font-semibold text-gray-900 text-sm">{h.numeroHabitacion}</span>
          <span className="text-xs text-gray-400">Piso {h.pisoHabitacion}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg}`}>
          {cfg.label}
        </span>
      </div>

      {h.estadoHabitacion === 'ocupada' && h.pacienteActual ? (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 leading-tight">{h.pacienteActual.nombreCompleto}</p>
              <p className="text-xs text-gray-400">DNI {h.pacienteActual.dni}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              onClick={() => onVerPaciente(h.pacienteActual!.id)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Ver paciente
            </button>
            {canTransfer ? (
              <button
                onClick={onTrasladar}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                <ArrowRightLeft size={11} />
                Trasladar
              </button>
            ) : (
              <button
                disabled
                title="Tu rol no permite trasladar pacientes."
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                <ArrowRightLeft size={11} />
                Trasladar
              </button>
            )}
            {canDischarge ? (
              <button
                onClick={onEgresar}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
              >
                <LogOut size={11} />
                Egresar
              </button>
            ) : (
              <button
                disabled
                title="Tu rol no permite egresar pacientes."
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                <LogOut size={11} />
                Egresar
              </button>
            )}
          </div>
        </div>
      ) : h.estadoHabitacion === 'disponible' ? (
        <div className="mb-3 text-xs text-gray-400 italic">Sin paciente asignado</div>
      ) : (
        <div className="mb-3 text-xs text-amber-600 font-medium">En mantenimiento</div>
      )}

      <div className="space-y-1.5">
        {h.estadoHabitacion === 'disponible' && (
          canAdmit ? (
            <button
              onClick={onInternar}
              className="w-full py-2 text-xs font-medium rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Internar Paciente
            </button>
          ) : (
            <button
              disabled
              title="Tu rol no permite internar pacientes."
              className="w-full py-2 text-xs font-medium rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed"
            >
              Internar Paciente
            </button>
          )
        )}

        {h.estadoHabitacion === 'disponible' && (
          canManage ? (
            <button
              onClick={() => onCambiarEstado('mantenimiento')}
              disabled={estadoLoading}
              className="w-full py-2 text-xs font-medium rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <Wrench size={11} className="inline mr-1" />
              {estadoLoading ? 'Actualizando...' : 'Marcar mantenimiento'}
            </button>
          ) : (
            <button
              disabled
              title="Tu rol no permite modificar habitaciones."
              className="w-full py-2 text-xs font-medium rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed"
            >
              <Wrench size={11} className="inline mr-1" />
              Marcar mantenimiento
            </button>
          )
        )}

        {h.estadoHabitacion === 'mantenimiento' && (
          canManage ? (
            <button
              onClick={() => onCambiarEstado('disponible')}
              disabled={estadoLoading}
              className="w-full py-2 text-xs font-medium rounded-xl border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={11} className="inline mr-1" />
              {estadoLoading ? 'Actualizando...' : 'Marcar disponible'}
            </button>
          ) : (
            <button
              disabled
              title="Tu rol no permite modificar habitaciones."
              className="w-full py-2 text-xs font-medium rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed"
            >
              <CheckCircle size={11} className="inline mr-1" />
              Marcar disponible
            </button>
          )
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, color }: { icon: any; value: number; label: string; color: 'blue' | 'green' | 'amber' }) {
  const colors = {
    blue:  { bg: 'bg-blue-100',  text: 'text-blue-600'  },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  }
  const c = colors[color]
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon size={20} className={c.text} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
