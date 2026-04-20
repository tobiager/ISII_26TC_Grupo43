import { AlertTriangle, BedDouble, Pencil, Trash2, LogOut, Eye } from 'lucide-react'
import type { Patient } from '../types/patient'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PatientTableProps {
  patients: Patient[]
  onView: (patient: Patient) => void
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

const estadoBadge: Record<string, string> = {
  Ambulatorio: 'bg-green-100 text-green-700',
  Internado:   'bg-blue-100 text-blue-700',
  Egresado:    'bg-gray-100 text-gray-600',
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'dd/MM/yyyy', { locale: es }) }
  catch { return '—' }
}

export default function PatientTable({ patients, onView, onEdit, onDelete }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <BedDouble size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">No se encontraron pacientes</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Paciente', 'DNI', 'Edad', 'Tipo Sangre', 'Obra Social', 'Estado', 'Última Visita', ''].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 pr-4 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {patients.map(p => {
            const alergiasList = Array.isArray(p.alergias) ? p.alergias : []

            return (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                {/* Paciente */}
                <td className="py-4 pr-4">
                  <div className="flex items-start gap-3">
                    <div className="relative mt-0.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                        {p.nombre[0]}{p.apellido[0]}
                      </div>
                      {alergiasList.length > 0 && (
                        <AlertTriangle
                          size={13}
                          className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{p.apellido} {p.nombre}</p>
                      {alergiasList.length > 0 && (
                        <p className="text-xs text-red-500 mt-0.5">
                          Alergias: {alergiasList.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-4 pr-4 text-gray-700 font-mono">{p.dni}</td>
                <td className="py-4 pr-4 text-gray-700">{p.edad} años</td>

                <td className="py-4 pr-4">
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md">
                    {p.tipoSangre}
                  </span>
                </td>

                <td className="py-4 pr-4 text-gray-700">{p.obraSocial ?? '—'}</td>

                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estadoBadge[p.estado] ?? estadoBadge.Ambulatorio}`}>
                      {p.estado}
                    </span>
                    {p.estado === 'Internado' && p.numeroHabitacion && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-md">
                        <BedDouble size={12} />
                        {p.numeroHabitacion}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-4 pr-4 text-gray-500">{formatDate(p.ultimaVisita)}</td>

                <td className="py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.estado === 'Internado' && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 border border-amber-200 bg-amber-50 px-2 py-1 rounded-md font-medium mr-1">
                        <LogOut size={12} />
                        Alta
                      </span>
                    )}
                    <button
                      onClick={() => onView(p)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Ver información"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar paciente"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Dar de baja"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
