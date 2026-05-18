import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRightLeft,
  BedDouble, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, CreditCard, Droplets, Filter, Heart,
  MapPin, Phone, Plus, Search, Shield, Stethoscope, Users, X,
} from 'lucide-react'
import UserMenu from '../components/UserMenu'
import CustomSelect from '../components/CustomSelect'
import ReadOnlyBadge from '../components/ReadOnlyBadge'
import { patientService } from '../services/patientService'
import { historialService } from '../services/historialService'
import { useAuth } from '../contexts/AuthContext'
import { canAccessAdmin, canEditMedicalHistory } from '../utils/permissions'
import type { Patient } from '../types/patient'
import type {
  HistorialMedicoDetalle,
  InternacionHistorial,
  RegistroClinico,
  TipoProcedimiento,
} from '../types/history'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es }) }
  catch { return '—' }
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), "d MMM yyyy · HH:mm", { locale: es }) }
  catch { return '—' }
}

const TIPO_COLORS: Record<string, string> = {
  'Consulta clínica':             'bg-blue-50 border-l-4 border-blue-400',
  'Evolución médica':             'bg-sky-50 border-l-4 border-sky-400',
  'Evolución de enfermería':      'bg-cyan-50 border-l-4 border-cyan-400',
  'Diagnóstico':                  'bg-green-50 border-l-4 border-green-400',
  'Administración de medicación': 'bg-violet-50 border-l-4 border-violet-400',
  'Extracción de sangre':         'bg-amber-50 border-l-4 border-amber-400',
  'Laboratorio':                  'bg-yellow-50 border-l-4 border-yellow-400',
  'Radiografía':                  'bg-orange-50 border-l-4 border-orange-400',
  'Ecografía':                    'bg-orange-50 border-l-4 border-orange-300',
  'Tomografía':                   'bg-red-50 border-l-4 border-red-300',
  'Resonancia magnética':         'bg-red-50 border-l-4 border-red-400',
  'Electrocardiograma':           'bg-purple-50 border-l-4 border-purple-400',
  'Indicación médica':            'bg-indigo-50 border-l-4 border-indigo-300',
  'Procedimiento':                'bg-slate-50 border-l-4 border-slate-400',
  'Curación':                     'bg-rose-50 border-l-4 border-rose-400',
  'Control de signos vitales':    'bg-teal-50 border-l-4 border-teal-300',
  'Observación general':          'bg-gray-50 border-l-4 border-gray-400',
  'Internación':                  'bg-indigo-50 border-l-4 border-indigo-500',
  'Alta médica':                  'bg-emerald-50 border-l-4 border-emerald-400',
  'Traslado de habitación':       'bg-teal-50 border-l-4 border-teal-400',
}

const TIPOS_AUTOMATICOS = new Set([
  'Internación', 'Traslado de habitación', 'Alta médica', 'Egreso hospitalario',
])

const ESTADO_BADGE: Record<string, string> = {
  Ambulatorio: 'bg-green-100 text-green-700',
  Internado:   'bg-blue-100 text-blue-700',
  Egresado:    'bg-gray-100 text-gray-600',
}

const TIPO_SANGRE_COLORS: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700',    'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-orange-100 text-orange-700', 'B-': 'bg-orange-100 text-orange-700',
  'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-100 text-purple-700',
  'O+': 'bg-blue-100 text-blue-700',  'O-': 'bg-blue-100 text-blue-700',
}

// ── Agrupación conceptual: mueve altas médicas a su internación ────────────
//
// El backend agrupa por rango de fechas, pero un "Alta médica" generado al
// momento exacto del egreso puede quedar fuera del rango (límite exclusivo).
// Esta función lo remueve de eventosAmbulatorios y lo coloca dentro de la
// internación cuya fechaFin coincide (a nivel de minuto).

function groupClinicalEventsByContext(historial: HistorialMedicoDetalle): {
  ambulatorios: RegistroClinico[]
  internaciones: InternacionHistorial[]
} {
  const ALTA_TIPOS = new Set(['Alta médica', 'Egreso hospitalario'])

  // índice: primeros 16 chars de fechaFin ("YYYY-MM-DDTHH:mm") → índice en array
  const intByFechaFin = new Map<string, number>()
  historial.internaciones.forEach((int, idx) => {
    if (int.estado === 'EGRESADA' && int.fechaFin) {
      intByFechaFin.set(int.fechaFin.substring(0, 16), idx)
    }
  })

  const ambulatorios: RegistroClinico[] = []
  const altasPorInternacion = new Map<number, RegistroClinico[]>()

  historial.eventosAmbulatorios.forEach(event => {
    if (ALTA_TIPOS.has(event.tipoProcedimiento)) {
      const eventMin = event.fechaRegistro.substring(0, 16)
      const intIdx = intByFechaFin.get(eventMin)
      if (intIdx !== undefined) {
        if (!altasPorInternacion.has(intIdx)) altasPorInternacion.set(intIdx, [])
        altasPorInternacion.get(intIdx)!.push(event)
        return
      }
    }
    ambulatorios.push(event)
  })

  const internaciones = historial.internaciones.map((int, idx) => {
    const extras = altasPorInternacion.get(idx) ?? []
    if (extras.length === 0) return int
    return { ...int, eventos: [...int.eventos, ...extras] }
  })

  return { ambulatorios, internaciones }
}

// ── Filtros ────────────────────────────────────────────────────────────────

interface HistorialFilters {
  text: string
  dateFrom: string
  dateTo: string
  tipo: string
  origen: 'todos' | 'internaciones' | 'ambulatorios'
  profesional: string
}

const EMPTY_FILTERS: HistorialFilters = {
  text: '', dateFrom: '', dateTo: '', tipo: '', origen: 'todos', profesional: '',
}

function applyEventFilters(events: RegistroClinico[], f: HistorialFilters): RegistroClinico[] {
  const text = f.text.trim().toLowerCase()
  const dateFrom = f.dateFrom ? new Date(f.dateFrom) : null
  const dateTo = f.dateTo ? new Date(f.dateTo + 'T23:59:59') : null
  return events.filter(r => {
    if (text && !r.descripcion.toLowerCase().includes(text) && !r.tipoProcedimiento.toLowerCase().includes(text)) return false
    if (dateFrom && new Date(r.fechaRegistro) < dateFrom) return false
    if (dateTo && new Date(r.fechaRegistro) > dateTo) return false
    if (f.tipo && r.tipoProcedimiento !== f.tipo) return false
    if (f.profesional && r.usuarioNombre !== f.profesional) return false
    return true
  })
}

// ── Página principal ───────────────────────────────────────────────────────

export default function PatientHistorialPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user!.rol
  const canEdit = canEditMedicalHistory(role)

  const [patient, setPatient]           = useState<Patient | null>(null)
  const [historial, setHistorial]       = useState<HistorialMedicoDetalle | null>(null)
  const [tipos, setTipos]               = useState<TipoProcedimiento[]>([])
  const [loadingPatient, setLoadingPatient] = useState(true)
  const [loadingHistorial, setLoadingHistorial] = useState(true)
  const [filters, setFilters]           = useState<HistorialFilters>(EMPTY_FILTERS)

  const [showAddForm, setShowAddForm]   = useState(false)
  const [newTipo, setNewTipo]           = useState<number | '' | 'otro'>('')
  const [newCustomType, setNewCustomType] = useState('')
  const [newDesc, setNewDesc]           = useState('')
  const [addLoading, setAddLoading]     = useState(false)
  const [showComplementary, setShowComplementary] = useState(false)

  const patientId = id ? parseInt(id, 10) : NaN

  const loadHistorial = useCallback(async () => {
    if (isNaN(patientId)) return
    setLoadingHistorial(true)
    try {
      const h = await historialService.getByPaciente(patientId)
      setHistorial(h)
    } catch {
      toast.error('No se pudo cargar el historial')
    } finally {
      setLoadingHistorial(false)
    }
  }, [patientId])

  useEffect(() => {
    if (isNaN(patientId)) { navigate('/historial'); return }
    setLoadingPatient(true)
    patientService.getById(patientId)
      .then(setPatient)
      .catch(() => { toast.error('Paciente no encontrado'); navigate('/historial') })
      .finally(() => setLoadingPatient(false))
    loadHistorial()
  }, [patientId, navigate, loadHistorial])

  useEffect(() => {
    if (!canEdit || tipos.length > 0) return
    historialService.getTiposProcedimiento().then(setTipos).catch(() => {})
  }, [canEdit, tipos.length])

  // Agrupación corregida (Alta médica movida a su internación)
  const grouped = useMemo(() => {
    if (!historial) return { ambulatorios: [] as RegistroClinico[], internaciones: [] as InternacionHistorial[] }
    return groupClinicalEventsByContext(historial)
  }, [historial])

  // Opciones únicas para dropdowns de filtros
  const { uniqueTipos, uniqueProfesionales } = useMemo(() => {
    const all = [...grouped.ambulatorios, ...grouped.internaciones.flatMap(i => i.eventos)]
    return {
      uniqueTipos: [...new Set(all.map(e => e.tipoProcedimiento))].sort(),
      uniqueProfesionales: [...new Set(all.map(e => e.usuarioNombre))].sort(),
    }
  }, [grouped])

  // Ambulatorios filtrados
  const filteredAmbulatorios = useMemo(() => {
    if (filters.origen === 'internaciones') return []
    return applyEventFilters(grouped.ambulatorios, filters)
  }, [grouped.ambulatorios, filters])

  // Internaciones filtradas (preservando numeración original)
  const filteredInternaciones = useMemo(() => {
    if (filters.origen === 'ambulatorios') return []
    const total = grouped.internaciones.length
    const hasEventFilter = !!(filters.text || filters.dateFrom || filters.dateTo || filters.tipo || filters.profesional)
    return grouped.internaciones
      .map((internacion, originalIdx) => ({
        internacion: { ...internacion, eventos: applyEventFilters(internacion.eventos, filters) },
        label: internacion.estado === 'ACTIVA'
          ? 'Internación actual'
          : `Internación #${total - originalIdx}`,
      }))
      .filter(({ internacion }) => !hasEventFilter || internacion.eventos.length > 0)
  }, [grouped.internaciones, filters])

  const handleAddRegistro = async () => {
    if (!patient || !newTipo || !newDesc.trim()) return
    if (newTipo === 'otro' && !newCustomType.trim()) return
    setAddLoading(true)
    try {
      let idTipo: number
      let descripcion = newDesc.trim()
      if (newTipo === 'otro') {
        const otroTipo = tipos.find(t => t.nombre === 'Otro')
        if (!otroTipo) { toast.error('Tipo "Otro" no disponible'); return }
        idTipo = otroTipo.id
        descripcion = `[Tipo personalizado: ${newCustomType.trim()}] ${descripcion}`
      } else {
        idTipo = Number(newTipo)
      }
      await historialService.registrarEvento({ idPaciente: patient.id, idTipoProcedimiento: idTipo, descripcion })
      toast.success('Evento registrado correctamente')
      setNewTipo(''); setNewCustomType(''); setNewDesc(''); setShowAddForm(false)
      await loadHistorial()
    } catch {
      toast.error('No se pudo registrar el evento')
    } finally {
      setAddLoading(false)
    }
  }

  const setFilter = <K extends keyof HistorialFilters>(key: K, val: HistorialFilters[K]) =>
    setFilters(f => ({ ...f, [key]: val }))

  const hasActiveFilters = !!(
    filters.text || filters.dateFrom || filters.dateTo ||
    filters.tipo || filters.origen !== 'todos' || filters.profesional
  )

  const loading = loadingPatient || loadingHistorial

  const alergiasList  = Array.isArray(patient?.alergias) ? patient!.alergias : []
  const contactosList = Array.isArray(patient?.contactosEmergencia) ? patient!.contactosEmergencia : []
  const iniciales     = `${patient?.nombre?.[0] ?? ''}${patient?.apellido?.[0] ?? ''}`

  const totalAmbulatorios  = grouped.ambulatorios.length
  const totalInternaciones = grouped.internaciones.length

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
            <button onClick={() => navigate('/pacientes')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
              <Users size={15} /> Pacientes
            </button>
            <button onClick={() => navigate('/habitaciones')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
              <BedDouble size={15} /> Habitaciones
            </button>
            <button onClick={() => navigate('/historial')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <ClipboardList size={15} /> Historial
            </button>
            {canAccessAdmin(role) && (
              <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                <Shield size={15} /> Admin
              </button>
            )}
          </nav>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">

        <button
          onClick={() => navigate('/historial')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> Volver al historial
        </button>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Cargando...</p>
          </div>
        ) : !patient ? null : (
          <>
            {/* ── Cabecera del paciente ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">

              {alergiasList.length > 0 && (
                <div className="bg-red-600 px-6 py-2.5 flex items-center gap-3">
                  <AlertTriangle size={15} className="text-white flex-shrink-0" />
                  <span className="text-white text-xs font-bold uppercase tracking-wide mr-1">Alergias:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {alergiasList.map(a => (
                      <span key={a} className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
                    {iniciales}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg font-bold text-gray-900">{patient.apellido}, {patient.nombre}</h1>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ESTADO_BADGE[patient.estado] ?? ESTADO_BADGE.Ambulatorio}`}>
                        {patient.estado}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-sm text-gray-600">
                      <span>{patient.edad} años</span>
                      <span className="text-gray-300">·</span>
                      <span>DNI <span className="font-mono font-medium text-gray-800">{patient.dni}</span></span>
                      <span className="text-gray-300">·</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${TIPO_SANGRE_COLORS[patient.tipoSangre] ?? 'bg-gray-100 text-gray-700'}`}>
                        <Droplets size={10} /> {patient.tipoSangre}
                      </span>
                      {patient.obraSocial && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="inline-flex items-center gap-1 text-sm text-indigo-700">
                            <CreditCard size={12} className="text-indigo-400" />
                            <span className="font-medium">{patient.obraSocial}</span>
                            {patient.nroAfiliado && <span className="text-gray-400 text-xs">· Afiliado {patient.nroAfiliado}</span>}
                          </span>
                        </>
                      )}
                    </div>
                    {(patient.direccion || patient.nombreLocalidad) && (
                      <div className="flex items-start gap-1 mt-1 text-xs text-gray-400">
                        <MapPin size={11} className="flex-shrink-0 mt-0.5" />
                        <span>
                          {[
                            patient.direccion
                              ? `${patient.direccion}${patient.numeroDireccion ? ` ${patient.numeroDireccion}` : ''}${patient.piso != null ? `, Piso ${patient.piso}` : ''}`
                              : null,
                            patient.nombreLocalidad,
                            patient.nombreProvincia,
                          ].filter(Boolean).join(', ')}
                          {patient.tipoResidencia && (
                            <span className="ml-1">· {patient.tipoResidencia === 'permanente' ? 'Residencia permanente' : 'Residencia transitoria'}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Datos médicos complementarios (acordeón) ── */}
            {(
              patient.telefono ||
              (patient.enfermedadesCronicas?.length ?? 0) > 0 ||
              (patient.antecedentesFamiliares?.length ?? 0) > 0 ||
              patient.antecedentesText ||
              contactosList.length > 0
            ) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => setShowComplementary(v => !v)}
                  className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Heart size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Datos médicos complementarios</span>
                    {!showComplementary && (
                      <>
                        {(patient.enfermedadesCronicas?.length ?? 0) > 0 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {patient.enfermedadesCronicas!.length} enf. crónica{patient.enfermedadesCronicas!.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {(patient.antecedentesFamiliares?.length ?? 0) > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {patient.antecedentesFamiliares!.length} antec. familiar{patient.antecedentesFamiliares!.length !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${showComplementary ? 'rotate-180' : ''}`}
                  />
                </button>

                {showComplementary && (
                  <div className="px-6 pb-5 pt-3 border-t border-gray-100 space-y-4">

                    {/* Teléfono */}
                    {patient.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {patient.telefono}
                          {patient.tipoTelefono && <span className="text-xs text-gray-400 ml-1">({patient.tipoTelefono})</span>}
                        </span>
                      </div>
                    )}

                    {/* Antecedentes médicos */}
                    {((patient.enfermedadesCronicas?.length ?? 0) > 0 ||
                      (patient.antecedentesFamiliares?.length ?? 0) > 0 ||
                      patient.antecedentesText) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Heart size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Antecedentes Médicos</span>
                        </div>
                        <div className="space-y-2">
                          {(patient.enfermedadesCronicas?.length ?? 0) > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                              <p className="text-xs font-medium text-amber-700 mb-2">Enfermedades crónicas</p>
                              <div className="flex flex-wrap gap-1.5">
                                {patient.enfermedadesCronicas!.map(e => (
                                  <span key={e} className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">{e}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {(patient.antecedentesFamiliares?.length ?? 0) > 0 && (
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                              <p className="text-xs font-medium text-purple-700 mb-2">Antecedentes familiares</p>
                              <div className="flex flex-wrap gap-1.5">
                                {patient.antecedentesFamiliares!.map(a => (
                                  <span key={a} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">{a}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {patient.antecedentesText && (
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                              <p className="text-xs font-medium text-purple-700 mb-1">Observaciones</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{patient.antecedentesText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contactos de emergencia */}
                    {contactosList.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contactos de Emergencia</span>
                        </div>
                        <div className="space-y-2">
                          {contactosList.map((c, idx) => (
                            <div key={idx} className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                                {c.parentesco && <p className="text-xs text-amber-700 mt-0.5">{c.parentesco}</p>}
                              </div>
                              {c.telefono && (
                                <span className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-amber-200 px-2 py-1 rounded-lg flex-shrink-0">
                                  <Phone size={11} /> {c.telefono}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {/* ── Historial clínico ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList size={16} className="text-blue-600" />
                    Historial Clínico
                  </h2>
                  {historial && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {historial.registros.length} registro{historial.registros.length !== 1 ? 's' : ''} en total
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!canEdit && <ReadOnlyBadge />}
                  {canEdit && (
                    <button
                      onClick={() => setShowAddForm(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={13} /> Registrar Evento
                    </button>
                  )}
                </div>
              </div>

              {/* Formulario registrar evento */}
              {showAddForm && canEdit && (
                <div className="px-6 py-5 bg-blue-50 border-b border-blue-100">
                  <p className="text-sm font-medium text-blue-900 mb-3">Nuevo evento clínico</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de procedimiento</label>
                      <CustomSelect
                        value={String(newTipo)}
                        onChange={v => {
                          setNewTipo(v === '' ? '' : v === 'otro' ? 'otro' : Number(v))
                          if (v !== 'otro') setNewCustomType('')
                        }}
                        options={[
                          { value: '', label: 'Seleccionar tipo...' },
                          ...tipos
                            .filter(t => !TIPOS_AUTOMATICOS.has(t.nombre) && t.nombre !== 'Otro')
                            .map(t => ({ value: String(t.id), label: t.nombre })),
                          { value: 'otro', label: 'Otro / Personalizado' },
                        ]}
                        className="w-full py-2 px-3 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer"
                      />
                      {newTipo === 'otro' && (
                        <input
                          type="text"
                          value={newCustomType}
                          onChange={e => setNewCustomType(e.target.value)}
                          placeholder="Nombre del tipo personalizado..."
                          className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                      <textarea
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        rows={3}
                        placeholder="Descripción del evento clínico..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setShowAddForm(false); setNewTipo(''); setNewCustomType(''); setNewDesc('') }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddRegistro}
                      disabled={!newTipo || !newDesc.trim() || (newTipo === 'otro' && !newCustomType.trim()) || addLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addLoading ? 'Guardando...' : 'Guardar evento'}
                    </button>
                  </div>
                </div>
              )}

              {/* Filtros */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtros</span>
                  {hasActiveFilters && (
                    <button
                      onClick={() => setFilters(EMPTY_FILTERS)}
                      className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <X size={12} /> Limpiar filtros
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {/* Búsqueda */}
                  <div className="relative col-span-2 sm:col-span-3 lg:col-span-2">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={filters.text}
                      onChange={e => setFilter('text', e.target.value)}
                      placeholder="Buscar en registros..."
                      className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white"
                    />
                  </div>

                  {/* Rango de fechas (calendario único) */}
                  <DateRangePicker
                    dateFrom={filters.dateFrom}
                    dateTo={filters.dateTo}
                    onChange={(from, to) => setFilters(f => ({ ...f, dateFrom: from, dateTo: to }))}
                  />

                  {/* Tipo */}
                  <CustomSelect
                    value={filters.tipo}
                    onChange={val => setFilter('tipo', val)}
                    options={[
                      { value: '', label: 'Tipo: Todos' },
                      ...uniqueTipos.map(t => ({ value: t, label: t })),
                    ]}
                    className="w-full py-2 px-3 text-xs border border-gray-200 rounded-xl bg-white cursor-pointer"
                  />

                  {/* Origen */}
                  <CustomSelect
                    value={filters.origen}
                    onChange={val => setFilter('origen', val as HistorialFilters['origen'])}
                    options={[
                      { value: 'todos', label: 'Origen: Todos' },
                      { value: 'internaciones', label: 'Solo internaciones' },
                      { value: 'ambulatorios', label: 'Solo ambulatorios' },
                    ]}
                    className="w-full py-2 px-3 text-xs border border-gray-200 rounded-xl bg-white cursor-pointer"
                  />

                  {/* Profesional */}
                  {uniqueProfesionales.length > 0 && (
                    <CustomSelect
                      value={filters.profesional}
                      onChange={val => setFilter('profesional', val)}
                      options={[
                        { value: '', label: 'Profesional: Todos' },
                        ...uniqueProfesionales.map(p => ({ value: p, label: p })),
                      ]}
                      className="w-full py-2 px-3 text-xs border border-gray-200 rounded-xl bg-white cursor-pointer col-span-2 sm:col-span-1"
                    />
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="px-6 py-6">
                {loadingHistorial ? (
                  <div className="text-center py-16">
                    <div className="inline-block w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 mt-3">Cargando historial...</p>
                  </div>
                ) : !historial ? null : totalInternaciones === 0 && totalAmbulatorios === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sin registros clínicos</p>
                    {canEdit && <p className="text-xs mt-1">Usá el botón "Registrar Evento" para agregar el primer registro.</p>}
                  </div>
                ) : (
                  <div className="space-y-10">

                    {/* Internaciones */}
                    {filters.origen !== 'ambulatorios' && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <BedDouble size={15} className="text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Internaciones</h3>
                          <span className="text-xs text-gray-400">
                            {filteredInternaciones.length !== totalInternaciones
                              ? `${filteredInternaciones.length} de ${totalInternaciones}`
                              : `(${totalInternaciones})`}
                          </span>
                        </div>
                        {filteredInternaciones.length === 0 ? (
                          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                            <BedDouble size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">
                              {totalInternaciones === 0
                                ? 'Sin internaciones registradas'
                                : 'Ninguna internación coincide con los filtros'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {filteredInternaciones.map(({ internacion, label }) => (
                              <InternacionBlock key={internacion.idInternacion} internacion={internacion} label={label} />
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {/* Atenciones ambulatorias */}
                    {filters.origen !== 'internaciones' && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <Activity size={15} className="text-green-600" />
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Atenciones ambulatorias</h3>
                          <span className="text-xs text-gray-400">
                            {filteredAmbulatorios.length !== totalAmbulatorios
                              ? `${filteredAmbulatorios.length} de ${totalAmbulatorios}`
                              : `(${totalAmbulatorios})`}
                          </span>
                        </div>
                        {filteredAmbulatorios.length === 0 ? (
                          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                            <Activity size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">
                              {totalAmbulatorios === 0
                                ? 'Sin atenciones ambulatorias registradas'
                                : 'Ninguna atención coincide con los filtros'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredAmbulatorios.map(r => <RegistroCard key={r.id} registro={r} />)}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ── DateRangePicker ────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

type CalView = 'day' | 'month' | 'year'

function DateRangePicker({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom: string
  dateTo: string
  onChange: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'from' | 'to'>('from')
  const [view, setView] = useState<CalView>('day')
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [yearPageStart, setYearPageStart] = useState(() => Math.floor(new Date().getFullYear() / 12) * 12)
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  const openPicker = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPickerPos({ top: rect.bottom + 6, left: rect.left })
      const d = dateFrom ? new Date(dateFrom + 'T12:00:00') : new Date()
      const y = d.getFullYear()
      setViewYear(y)
      setViewMonth(d.getMonth())
      setYearPageStart(Math.floor(y / 12) * 12)
    }
    setPhase('from')
    setView('day')
    setOpen(true)
  }

  const closePicker = () => { setOpen(false); setPhase('from') }

  useEffect(() => {
    if (!open) return
    const onMouse = (e: MouseEvent) => {
      const t = e.target as Node
      if (!buttonRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false); setPhase('from')
      }
    }
    const onScroll = () => { setOpen(false); setPhase('from') }
    document.addEventListener('mousedown', onMouse)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (day: string) => {
    if (phase === 'from') {
      onChange(day, day)
      setPhase('to')
    } else {
      if (day === dateFrom) {
        closePicker()
      } else {
        const from = day < dateFrom ? day : dateFrom
        const to   = day < dateFrom ? dateFrom : day
        onChange(from, to)
        closePicker()
      }
    }
  }

  const handleClear = () => { onChange('', ''); closePicker() }

  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const todayStr       = format(new Date(), 'yyyy-MM-dd')
  const nowYear        = new Date().getFullYear()
  const nowMonth       = new Date().getMonth()

  const getDayClass = (day: string): string => {
    const isSelected = (day === dateFrom || day === dateTo) && !!dateFrom
    const isSingle   = dateFrom === dateTo && day === dateFrom && !!dateFrom
    const inRange    = !!(dateFrom && dateTo && dateFrom !== dateTo && day > dateFrom && day < dateTo)
    const isToday    = day === todayStr
    if (isSelected || isSingle) return 'bg-blue-600 text-white rounded-full font-semibold'
    if (inRange)  return 'bg-blue-100 text-blue-700 rounded'
    if (isToday)  return 'text-blue-600 font-semibold hover:bg-blue-50 rounded-full'
    return 'text-gray-700 hover:bg-gray-100 rounded-full'
  }

  const displayLabel = (): string => {
    if (!dateFrom) return 'Seleccionar fechas'
    if (!dateTo || dateFrom === dateTo) return format(new Date(dateFrom + 'T12:00:00'), "d MMM yyyy", { locale: es })
    return `${format(new Date(dateFrom + 'T12:00:00'), "d MMM", { locale: es })} → ${format(new Date(dateTo + 'T12:00:00'), "d MMM yyyy", { locale: es })}`
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={open ? closePicker : openPicker}
        className={`flex items-center justify-between gap-2 px-3 py-2 text-xs border rounded-xl w-full transition-colors ${
          dateFrom
            ? 'border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100'
            : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar size={12} className="flex-shrink-0" />
          <span className="truncate">{displayLabel()}</span>
        </div>
        {dateFrom && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); handleClear() }}
            className="flex-shrink-0 text-blue-400 hover:text-blue-700"
          >
            <X size={11} />
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-[268px]"
        >
          {/* ── Year view ── */}
          {view === 'year' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setYearPageStart(y => y - 12)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={14} className="text-gray-500" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  {yearPageStart} – {yearPageStart + 11}
                </span>
                <button type="button" onClick={() => setYearPageStart(y => y + 12)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, i) => {
                  const year = yearPageStart + i
                  const isSel = year === viewYear
                  const isCurrent = year === nowYear
                  return (
                    <button key={year} type="button"
                      onClick={() => { setViewYear(year); setView('month') }}
                      className={`py-2 text-xs rounded-lg font-medium transition-colors ${
                        isSel ? 'bg-blue-600 text-white'
                        : isCurrent ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {year}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setView('month')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* ── Month view ── */}
          {view === 'month' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setViewYear(y => y - 1)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={14} className="text-gray-500" />
                </button>
                <button type="button"
                  onClick={() => { setYearPageStart(Math.floor(viewYear / 12) * 12); setView('year') }}
                  className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                  {viewYear}
                </button>
                <button type="button" onClick={() => setViewYear(y => y + 1)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MONTH_SHORT.map((name, idx) => {
                  const isSel = idx === viewMonth
                  const isCurrent = idx === nowMonth && viewYear === nowYear
                  return (
                    <button key={idx} type="button"
                      onClick={() => { setViewMonth(idx); setView('day') }}
                      className={`py-2.5 text-xs rounded-lg font-medium transition-colors ${
                        isSel ? 'bg-blue-600 text-white'
                        : isCurrent ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {name}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setView('day')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* ── Day view ── */}
          {view === 'day' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={14} className="text-gray-500" />
                </button>
                <button type="button" onClick={() => setView('month')}
                  className="text-sm font-semibold text-gray-800 capitalize hover:text-blue-600 transition-colors">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </button>
                <button type="button" onClick={nextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`p${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(dayStr)}
                      className={`w-8 h-8 mx-auto flex items-center justify-center text-xs transition-colors ${getDayClass(dayStr)}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Limpiar
                </button>
                <span className="text-xs text-gray-400 italic">
                  {phase === 'from' ? 'Tocá un día para iniciar' : 'Tocá otro día para el fin'}
                </span>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

// ── RegistroCard ───────────────────────────────────────────────────────────

function RegistroCard({ registro: r }: { registro: RegistroClinico }) {
  const cardClass = TIPO_COLORS[r.tipoProcedimiento] ?? 'bg-gray-50 border-l-4 border-gray-300'
  return (
    <div className={`rounded-xl p-4 ${cardClass}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{r.tipoProcedimiento}</span>
      <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{r.descripcion}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
        <span className="flex items-center gap-1"><Calendar size={11} />{formatDateTime(r.fechaRegistro)}</span>
        <span>•</span>
        <span>{r.usuarioNombre}</span>
        <span className="bg-white/60 px-1.5 py-0.5 rounded text-gray-500">{r.usuarioRol}</span>
      </div>
    </div>
  )
}

// ── InternacionBlock ───────────────────────────────────────────────────────

function InternacionBlock({ internacion, label }: { internacion: InternacionHistorial; label: string }) {
  const isActiva = internacion.estado === 'ACTIVA'
  const [open, setOpen] = useState(isActiva)

  return (
    <section className={`rounded-xl border overflow-hidden ${isActiva ? 'border-blue-200' : 'border-gray-200'}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full text-left px-5 py-4 flex items-start justify-between gap-3 transition-colors ${
          isActiva ? 'bg-blue-50 hover:bg-blue-100/70' : 'bg-gray-50 hover:bg-gray-100/70'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <BedDouble size={14} className={isActiva ? 'text-blue-600' : 'text-gray-500'} />
            <span className={`text-sm font-semibold ${isActiva ? 'text-blue-700' : 'text-gray-700'}`}>{label}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isActiva ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
              {isActiva ? 'Internado' : 'Egresado'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
            <span>Hab. {internacion.numeroHabitacion} — Piso {internacion.pisoHabitacion}</span>
            <span className="text-gray-300">·</span>
            <span>{formatDateTime(internacion.fechaInicio)}</span>
            <span className="text-gray-300">→</span>
            <span className={isActiva ? 'font-medium text-blue-600' : ''}>
              {internacion.fechaFin ? formatDateTime(internacion.fechaFin) : 'Actual'}
            </span>
            {internacion.cantidadTraslados > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1">
                  <ArrowRightLeft size={10} />
                  {internacion.cantidadTraslados} traslado{internacion.cantidadTraslados !== 1 ? 's' : ''}
                </span>
              </>
            )}
            {!open && (
              <>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1">
                  <ClipboardList size={10} />
                  {internacion.eventos.length} evento{internacion.eventos.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 mt-1 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'} ${isActiva ? 'text-blue-400' : 'text-gray-400'}`}
        />
      </button>

      {open && (
        <div className="px-5 py-5 bg-white space-y-3">
          {internacion.eventos.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">Sin eventos registrados durante esta internación.</p>
          ) : (
            internacion.eventos.map(r => <RegistroCard key={r.id} registro={r} />)
          )}
        </div>
      )}
    </section>
  )
}
