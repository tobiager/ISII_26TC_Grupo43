import { X, Phone, MapPin, AlertTriangle, Heart, Users, CreditCard, Calendar, Droplets } from 'lucide-react'
import type { Patient } from '../types/patient'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PatientDetailModalProps {
  patient: Patient | null
  onClose: () => void
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es }) }
  catch { return '—' }
}

const tipoSangreColors: Record<string, string> = {
  'A+': 'bg-red-100 text-red-700',
  'A-': 'bg-red-100 text-red-700',
  'B+': 'bg-orange-100 text-orange-700',
  'B-': 'bg-orange-100 text-orange-700',
  'AB+': 'bg-purple-100 text-purple-700',
  'AB-': 'bg-purple-100 text-purple-700',
  'O+': 'bg-blue-100 text-blue-700',
  'O-': 'bg-blue-100 text-blue-700',
}

export default function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  if (!patient) return null

  const alergiasList = Array.isArray(patient.alergias) ? patient.alergias : []
  const iniciales = `${patient.nombre?.[0] ?? ''}${patient.apellido?.[0] ?? ''}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header con avatar */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {iniciales}
              </div>
              <div>
                <h2 className="text-lg font-bold">{patient.apellido}, {patient.nombre}</h2>
                <p className="text-blue-100 text-sm mt-0.5">DNI {patient.dni}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    tipoSangreColors[patient.tipoSangre] ?? 'bg-white/20 text-white'
                  }`}>
                    <Droplets size={10} className="inline mr-1" />
                    {patient.tipoSangre}
                  </span>
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                    {patient.edad} años
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    patient.estado === 'Internado' ? 'bg-white text-blue-700'
                    : patient.estado === 'Egresado' ? 'bg-white/20 text-white'
                    : 'bg-green-400/30 text-white'
                  }`}>
                    {patient.estado}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Datos personales */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={13} />
              Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Fecha de nacimiento" value={formatDate(patient.fechaNacimiento)} />
              <InfoRow label="Edad" value={`${patient.edad} años`} />
              <InfoRow label="Teléfono" value={patient.telefono} icon={<Phone size={13} />} />
              <InfoRow label="Tipo de sangre" value={patient.tipoSangre} />
            </div>
          </section>

          {/* Dirección */}
          {(patient.direccion || patient.nombreLocalidad) && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={13} />
                Dirección
              </h3>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                {patient.direccion && <p>{patient.direccion}</p>}
                {patient.nombreLocalidad && (
                  <p className="text-gray-500 mt-0.5">
                    {patient.nombreLocalidad}{patient.nombreProvincia ? `, ${patient.nombreProvincia}` : ''}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Alergias */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle size={13} />
              Alergias
            </h3>
            {alergiasList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {alergiasList.map(a => (
                  <span key={a} className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin alergias registradas</p>
            )}
          </section>

          {/* Antecedentes */}
          {(patient.enfermedadesCronicas || patient.antecedenteFamiliar) && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Heart size={13} />
                Antecedentes Médicos
              </h3>
              <div className="space-y-2">
                {patient.enfermedadesCronicas && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs font-medium text-amber-700 mb-1">Enfermedades crónicas</p>
                    <p className="text-sm text-gray-700">{patient.enfermedadesCronicas}</p>
                  </div>
                )}
                {patient.antecedenteFamiliar && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">Antecedente familiar</p>
                    <p className="text-sm text-gray-700">{patient.antecedenteFamiliar}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Contacto de emergencia */}
          {patient.contactoEmergenciaNombre && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users size={13} />
                Contacto de Emergencia
              </h3>
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{patient.contactoEmergenciaNombre}</p>
                    {patient.contactoEmergenciaParentesco && (
                      <p className="text-xs text-yellow-700 mt-0.5">{patient.contactoEmergenciaParentesco}</p>
                    )}
                  </div>
                  {patient.contactoEmergenciaTelefono && (
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-yellow-200 px-2 py-1 rounded-lg">
                      <Phone size={11} />
                      {patient.contactoEmergenciaTelefono}
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Obra Social */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={13} />
              Obra Social
            </h3>
            {patient.obraSocial ? (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-800">{patient.obraSocial}</p>
                {patient.nroAfiliado && (
                  <span className="text-xs text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-lg font-mono">
                    {patient.nroAfiliado}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin obra social</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
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
      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{value ?? '—'}</p>
    </div>
  )
}
