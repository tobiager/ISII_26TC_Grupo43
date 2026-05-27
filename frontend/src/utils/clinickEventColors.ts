// Centralized clinical event type colors.
// Imported by PatientHistorialPage, PatientDetailModal, and any future component
// that renders RegistroClinico cards or badges.

export const TIPO_COLORS: Record<string, string> = {
  // ── Apertura de historial (azul prominente) ─────────────────────────────
  'Apertura de historial':          'bg-blue-100 border-l-4 border-blue-600',

  // ── Consultas y guardias (celeste/sky) ──────────────────────────────────
  'Consulta clínica':               'bg-sky-50 border-l-4 border-sky-400',
  'Consulta médica':                'bg-sky-50 border-l-4 border-sky-500',
  'Guardia':                        'bg-cyan-50 border-l-4 border-cyan-500',

  // ── Evoluciones ─────────────────────────────────────────────────────────
  'Evolución médica':               'bg-sky-50 border-l-4 border-sky-300',
  'Evolución de enfermería':        'bg-cyan-50 border-l-4 border-cyan-400',

  // ── Control ─────────────────────────────────────────────────────────────
  'Control de signos vitales':      'bg-teal-50 border-l-4 border-teal-300',
  'Control clínico':                'bg-teal-50 border-l-4 border-teal-400',

  // ── Diagnóstico ─────────────────────────────────────────────────────────
  'Diagnóstico':                    'bg-green-50 border-l-4 border-green-400',

  // ── Medicación ──────────────────────────────────────────────────────────
  'Administración de medicación':   'bg-violet-50 border-l-4 border-violet-400',
  'Prescripción de medicación':     'bg-orange-50 border-l-4 border-orange-400',
  'Indicación médica':              'bg-indigo-50 border-l-4 border-indigo-300',

  // ── Laboratorio (amarillo/ámbar) ─────────────────────────────────────────
  'Extracción de sangre':           'bg-amber-50 border-l-4 border-amber-400',
  'Laboratorio':                    'bg-yellow-50 border-l-4 border-yellow-400',

  // ── Imágenes diagnósticas (rose, distinct from red) ─────────────────────
  'Radiografía':                    'bg-orange-50 border-l-4 border-orange-300',
  'Ecografía':                      'bg-orange-50 border-l-4 border-orange-400',
  'Tomografía':                     'bg-rose-50 border-l-4 border-rose-300',
  'Resonancia magnética':           'bg-rose-50 border-l-4 border-rose-400',

  // ── Estudios eléctricos / procedimientos ────────────────────────────────
  'Electrocardiograma':             'bg-purple-50 border-l-4 border-purple-400',
  'Procedimiento':                  'bg-slate-50 border-l-4 border-slate-400',
  'Curación':                       'bg-rose-50 border-l-4 border-rose-400',

  // ── Derivación (violeta) ─────────────────────────────────────────────────
  'Derivación':                     'bg-purple-50 border-l-4 border-purple-500',

  // ── Registros generales / administrativos (gris neutro) ─────────────────
  'Observación general':            'bg-gray-50 border-l-4 border-gray-400',
  'Registro administrativo':        'bg-gray-100 border-l-4 border-gray-400',
  'Otro':                           'bg-gray-50 border-l-4 border-gray-300',

  // ── Tipos automáticos del sistema ────────────────────────────────────────
  'Internación':                    'bg-red-50 border-l-4 border-red-500',       // rojo
  'Alta médica':                    'bg-emerald-50 border-l-4 border-emerald-400', // verde
  'Traslado de habitación':         'bg-teal-50 border-l-4 border-teal-400',
}

/** Returns the Tailwind class string for a given tipo name. Falls back to gray. */
export function getTipoColor(tipo: string): string {
  return TIPO_COLORS[tipo] ?? 'bg-gray-50 border-l-4 border-gray-300'
}

/**
 * Types generated automatically by the system.
 * These are excluded from manual event-registration dropdowns.
 */
export const TIPOS_AUTOMATICOS = new Set([
  'Internación',
  'Traslado de habitación',
  'Alta médica',
  'Egreso hospitalario',
  'Apertura de historial',
  'Registro administrativo',
])
