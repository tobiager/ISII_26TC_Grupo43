import { useEffect, useState } from 'react'
import {
  X, Phone, MapPin, AlertTriangle, Heart, Users, CreditCard,
  Calendar, Droplets, Home, ClipboardList, Plus, ChevronDown,
  ArrowRightLeft, LogOut, BedDouble, Activity,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Patient } from '../types/patient'
import type { HistorialMedicoDetalle, TipoProcedimiento, InternacionHistorial, RegistroClinico } from '../types/history'
import { historialService } from '../services/historialService'
import { useAuth } from '../contexts/AuthContext'
import { canEditMedicalHistory } from '../utils/permissions'
import ReadOnlyBadge from './ReadOnlyBadge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RoomActions {
  onTrasladar?: () => void
  onEgresar?: () => void
}

interface PatientDetailModalProps {
  patient: Patient | null
  onClose: () => void
  defaultTab?: Tab
  roomActions?: RoomActions
}

type Tab = 'info' | 'historial'

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

const tipoSangreColors: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700', 'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-orange-100 text-orange-700', 'B-': 'bg-orange-100 text-orange-700',
  'AB+': 'bg-purple-100 text-purple-700', 'AB-': 'bg-purple-100 text-purple-700',
  'O+': 'bg-blue-100 text-blue-700', 'O-': 'bg-blue-100 text-blue-700',
}

const TIPO_COLORS: Record<string, string> = {
  'Consulta clínica':           'bg-blue-50 border-l-4 border-blue-400',
  'Evolución médica':           'bg-sky-50 border-l-4 border-sky-400',
  'Evolución de enfermería':    'bg-cyan-50 border-l-4 border-cyan-400',
  'Diagnóstico':                'bg-green-50 border-l-4 border-green-400',
  'Administración de medicación': 'bg-violet-50 border-l-4 border-violet-400',
  'Extracción de sangre':       'bg-amber-50 border-l-4 border-amber-400',
  'Laboratorio':                'bg-yellow-50 border-l-4 border-yellow-400',
  'Radiografía':                'bg-orange-50 border-l-4 border-orange-400',
  'Ecografía':                  'bg-orange-50 border-l-4 border-orange-300',
  'Tomografía':                 'bg-red-50 border-l-4 border-red-300',
  'Resonancia magnética':       'bg-red-50 border-l-4 border-red-400',
  'Electrocardiograma':         'bg-purple-50 border-l-4 border-purple-400',
  'Indicación médica':          'bg-indigo-50 border-l-4 border-indigo-300',
  'Procedimiento':              'bg-slate-50 border-l-4 border-slate-400',
  'Curación':                   'bg-rose-50 border-l-4 border-rose-400',
  'Control de signos vitales':  'bg-teal-50 border-l-4 border-teal-300',
  'Observación general':        'bg-gray-50 border-l-4 border-gray-400',
  'Internación':                'bg-indigo-50 border-l-4 border-indigo-500',
  'Alta médica':                'bg-emerald-50 border-l-4 border-emerald-400',
  'Traslado de habitación':     'bg-teal-50 border-l-4 border-teal-400',
}

const TIPOS_AUTOMATICOS = new Set(['Internación', 'Traslado de habitación', 'Alta médica', 'Egreso hospitalario'])

export default function PatientDetailModal({ patient, onClose, defaultTab, roomActions }: PatientDetailModalProps) {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('info')

  const [historial, setHistorial]           = useState<HistorialMedicoDetalle | null>(null)
  const [historialLoading, setHistorialLoading] = useState(false)
  const [tipos, setTipos]                   = useState<TipoProcedimiento[]>([])

  const [showAddForm, setShowAddForm]       = useState(false)
  const [newTipo, setNewTipo]               = useState<number | '' | 'otro'>('')
  const [newCustomType, setNewCustomType]   = useState('')
  const [newDesc, setNewDesc]               = useState('')
  const [addLoading, setAddLoading]         = useState(false)

  const canEdit = user ? canEditMedicalHistory(user.rol) : false

  useEffect(() => {
    if (!patient) return
    setTab(defaultTab ?? 'info')
    setHistorial(null)
    setShowAddForm(false)
    setNewTipo('')
    setNewCustomType('')
    setNewDesc('')
  }, [patient, defaultTab])

  useEffect(() => {
    if (!patient || tab !== 'historial') return
    setHistorialLoading(true)
    const ctrl = new AbortController()
    historialService.getByPaciente(patient.id, ctrl.signal)
      .then(setHistorial)
      .catch(err => { if (err?.name !== 'CanceledError') toast.error('No se pudo cargar el historial') })
      .finally(() => setHistorialLoading(false))
    return () => ctrl.abort()
  }, [patient, tab])

  useEffect(() => {
    if (!canEdit || tipos.length > 0) return
    historialService.getTiposProcedimiento()
      .then(setTipos)
      .catch(() => {})
  }, [canEdit, tipos.length])

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
      setNewTipo('')
      setNewCustomType('')
      setNewDesc('')
      setShowAddForm(false)
      const updated = await historialService.getByPaciente(patient.id)
      setHistorial(updated)
    } catch {
      toast.error('No se pudo registrar el evento')
    } finally {
      setAddLoading(false)
    }
  }

  if (!patient) return null

  const alergiasList  = Array.isArray(patient.alergias) ? patient.alergias : []
  const contactosList = Array.isArray(patient.contactosEmergencia) ? patient.contactosEmergencia : []
  const iniciales     = `${patient.nombre?.[0] ?? ''}${patient.apellido?.[0] ?? ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Alergias banner */}
        {alergiasList.length > 0 && (
          <div className="bg-red-600 px-6 py-2.5 flex items-center gap-3 flex-shrink-0">
            <AlertTriangle size={16} className="text-white flex-shrink-0" />
            <span className="text-white text-xs font-bold uppercase tracking-wide mr-1">Alergias:</span>
            <div className="flex flex-wrap gap-1.5">
              {alergiasList.map(a => (
                <span key={a} className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Header con avatar */}
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">
                {iniciales}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900">{patient.apellido}, {patient.nombre}</h2>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    patient.estado === 'Internado' ? 'bg-blue-100 text-blue-700'
                    : patient.estado === 'Egresado' ? 'bg-gray-100 text-gray-600'
                    : 'bg-green-100 text-green-700'
                  }`}>{patient.estado}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{patient.edad} años</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${tipoSangreColors[patient.tipoSangre] ?? 'bg-gray-100 text-gray-700'}`}>
                    <Droplets size={10} /> {patient.tipoSangre}
                  </span>
                  <span className="text-xs text-gray-500">DNI: <span className="font-mono font-medium text-gray-800">{patient.dni}</span></span>
                  {patient.telefono && (
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} />{patient.telefono}</span>
                  )}
                  {patient.ultimaVisita && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={10} />Última visita: {formatDate(patient.ultimaVisita)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* OS y contacto */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {patient.obraSocial && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
                <CreditCard size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-indigo-500 font-medium">Obra Social</p>
                  <p className="text-sm font-semibold text-indigo-800">{patient.obraSocial}</p>
                  {patient.nroAfiliado && (
                    <p className="text-xs text-indigo-500 mt-0.5">Afiliado: {patient.nroAfiliado}</p>
                  )}
                </div>
              </div>
            )}
            {contactosList[0] && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <Heart size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-amber-600 font-medium">Contacto de Emergencia</p>
                  <p className="text-sm font-semibold text-amber-900">{contactosList[0].nombre}</p>
                  {contactosList[0].parentesco && <p className="text-xs text-amber-600">{contactosList[0].parentesco}</p>}
                  {contactosList[0].telefono && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 mt-0.5"><Phone size={10} />{contactosList[0].telefono}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setTab('info')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={15} />
            Información
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === 'historial' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardList size={15} />
            Historial Clínico
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {tab === 'info' && (
            <div className="space-y-5">
              {/* Datos personales */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={13} /> Datos Personales
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Fecha de nacimiento" value={formatDate(patient.fechaNacimiento)} />
                  <InfoRow label="Tipo de sangre" value={patient.tipoSangre} />
                  <InfoRow label={`Teléfono${patient.tipoTelefono ? ` (${patient.tipoTelefono})` : ''}`} value={patient.telefono} icon={<Phone size={13} />} />
                  <InfoRow label="Edad" value={`${patient.edad} años`} />
                </div>
              </section>

              {/* Dirección */}
              {(patient.direccion || patient.nombreLocalidad) && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={13} /> Dirección
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                    {patient.direccion && (
                      <p>{patient.direccion}{patient.numeroDireccion ? ` ${patient.numeroDireccion}` : ''}{patient.piso != null ? `, Piso ${patient.piso}` : ''}</p>
                    )}
                    {patient.nombreLocalidad && (
                      <p className="text-gray-500">{patient.nombreLocalidad}{patient.nombreProvincia ? `, ${patient.nombreProvincia}` : ''}</p>
                    )}
                    {patient.tipoResidencia && (
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${patient.tipoResidencia === 'permanente' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        <Home size={10} className="inline mr-1" />
                        {patient.tipoResidencia === 'permanente' ? 'Residencia permanente' : 'Residencia transitoria'}
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* Antecedentes médicos */}
              {((patient.enfermedadesCronicas?.length ?? 0) > 0 ||
                (patient.antecedentesFamiliares?.length ?? 0) > 0 ||
                patient.antecedentesText) && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Heart size={13} /> Antecedentes Médicos
                  </h3>
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
                </section>
              )}

              {/* Contactos de emergencia adicionales */}
              {contactosList.length > 1 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users size={13} /> Contactos de Emergencia
                  </h3>
                  <div className="space-y-2">
                    {contactosList.slice(1).map((c, idx) => (
                      <div key={idx} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                            {c.parentesco && <p className="text-xs text-yellow-700 mt-0.5">{c.parentesco}</p>}
                          </div>
                          {c.telefono && (
                            <span className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-yellow-200 px-2 py-1 rounded-lg">
                              <Phone size={11} /> {c.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === 'historial' && (
            <div>
              {/* Header historial */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList size={16} className="text-blue-600" />
                    Historial Clínico
                  </h3>
                  {historial && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {historial.registros.length} registro{historial.registros.length !== 1 ? 's' : ''} encontrado{historial.registros.length !== 1 ? 's' : ''}
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
                      <Plus size={13} />
                      Registrar Evento
                    </button>
                  )}
                </div>
              </div>

              {/* Texto solo lectura para roles no-editores */}
              {!canEdit && (
                <p className="text-xs text-gray-400 italic mb-4">
                  Podés consultar el historial, pero tu rol no permite registrar ni modificar eventos.
                </p>
              )}

              {/* Formulario agregar */}
              {showAddForm && canEdit && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 space-y-3">
                  <p className="text-sm font-medium text-blue-900">Nuevo evento clínico</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de procedimiento</label>
                    <div className="relative">
                      <select
                        value={newTipo}
                        onChange={e => {
                          const v = e.target.value
                          setNewTipo(v === '' ? '' : v === 'otro' ? 'otro' : Number(v))
                          if (v !== 'otro') setNewCustomType('')
                        }}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white"
                      >
                        <option value="">Seleccionar tipo...</option>
                        {tipos.filter(t => !TIPOS_AUTOMATICOS.has(t.nombre) && t.nombre !== 'Otro').map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        <option value="otro">Otro / Personalizado</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowAddForm(false); setNewTipo(''); setNewCustomType(''); setNewDesc('') }}
                      className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddRegistro}
                      disabled={!newTipo || !newDesc.trim() || (newTipo === 'otro' && !newCustomType.trim()) || addLoading}
                      className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Historial agrupado */}
              {historialLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 mt-3">Cargando historial...</p>
                </div>
              ) : !historial || (historial.registros.length === 0 && !(historial.internaciones?.length)) ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Sin registros clínicos</p>
                  {canEdit && <p className="text-xs mt-1">Usá el botón "Registrar Evento" para agregar el primer registro.</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Atenciones ambulatorias */}
                  {(historial.eventosAmbulatorios ?? []).length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity size={13} className="text-green-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Atenciones ambulatorias
                        </span>
                        <span className="text-xs text-gray-400">({historial.eventosAmbulatorios.length})</span>
                      </div>
                      <div className="space-y-3">
                        {historial.eventosAmbulatorios.map(r => (
                          <RegistroCard key={r.id} registro={r} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Internaciones (más reciente primero) */}
                  {(historial.internaciones ?? []).map((internacion, idx) => {
                    const total = historial.internaciones.length
                    const label = internacion.estado === 'ACTIVA'
                      ? 'Internación actual'
                      : `Internación #${total - idx}`
                    return (
                      <InternacionBlock key={internacion.idInternacion} internacion={internacion} label={label} />
                    )
                  })}

                  {/* Fallback: sin datos de agrupación → lista plana */}
                  {!(historial.internaciones?.length) && !(historial.eventosAmbulatorios?.length) && (
                    <div className="space-y-3">
                      {historial.registros.map(r => (
                        <RegistroCard key={r.id} registro={r} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          {roomActions && (roomActions.onTrasladar || roomActions.onEgresar) && (
            <div className="flex gap-2 mb-3">
              {roomActions.onTrasladar && (
                <button
                  onClick={roomActions.onTrasladar}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <ArrowRightLeft size={14} />
                  Trasladar
                </button>
              )}
              {roomActions.onEgresar && (
                <button
                  onClick={roomActions.onEgresar}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <LogOut size={14} />
                  Egresar
                </button>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">{icon}{label}</p>
      <p className="text-sm font-medium text-gray-800">{value ?? '—'}</p>
    </div>
  )
}

function RegistroCard({ registro: r }: { registro: RegistroClinico }) {
  const cardClass = TIPO_COLORS[r.tipoProcedimiento] ?? 'bg-gray-50 border-l-4 border-gray-300'
  return (
    <div className={`rounded-xl p-4 ${cardClass}`}>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {r.tipoProcedimiento}
      </span>
      <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{r.descripcion}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDateTime(r.fechaRegistro)}
        </span>
        <span>•</span>
        <span>{r.usuarioNombre}</span>
        <span className="bg-white/60 px-1.5 py-0.5 rounded text-gray-500">{r.usuarioRol}</span>
      </div>
    </div>
  )
}

function InternacionBlock({ internacion, label }: { internacion: InternacionHistorial; label: string }) {
  const isActiva = internacion.estado === 'ACTIVA'
  const [open, setOpen] = useState(isActiva)

  return (
    <section className={`rounded-xl border overflow-hidden ${isActiva ? 'border-blue-100' : 'border-gray-100'}`}>

      {/* Header clickable (accordion trigger) */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
          isActiva ? 'bg-blue-50 hover:bg-blue-100/70' : 'bg-gray-50 hover:bg-gray-100/70'
        }`}
      >
        <div className="flex-1 min-w-0">
          {/* Primera fila: label + estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <BedDouble size={13} className={isActiva ? 'text-blue-600' : 'text-gray-500'} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${isActiva ? 'text-blue-700' : 'text-gray-600'}`}>
              {label}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActiva ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
              {isActiva ? 'Internado' : 'Egresado'}
            </span>
          </div>

          {/* Segunda fila: hab, fechas, traslados y — si colapsado — cantidad de eventos */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 flex-wrap">
            <BedDouble size={10} className="flex-shrink-0" />
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

        {/* Chevron: apunta abajo = abierto, derecha = cerrado */}
        <ChevronDown
          size={15}
          className={`flex-shrink-0 mt-1 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'} ${isActiva ? 'text-blue-400' : 'text-gray-400'}`}
        />
      </button>

      {/* Body (colapsable) */}
      {open && (
        <div className="px-4 py-4 bg-white space-y-3">
          {internacion.eventos.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-3">
              Sin eventos registrados durante esta internación.
            </p>
          ) : (
            internacion.eventos.map(r => (
              <RegistroCard key={r.id} registro={r} />
            ))
          )}
        </div>
      )}
    </section>
  )
}
