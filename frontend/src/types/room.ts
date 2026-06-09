export type EstadoHabitacion = 'disponible' | 'ocupada' | 'mantenimiento'

export interface PacienteOcupante {
  id: number
  nombreCompleto: string
  dni: number
}

export interface InternacionActual {
  id: number
  fechaInicio: string
  cantidadTraslados: number
}

export interface Habitacion {
  id: number
  numeroHabitacion: string
  pisoHabitacion: number
  estadoHabitacion: EstadoHabitacion
  pacienteActual: PacienteOcupante | null
  internacionActual: InternacionActual | null
}

export interface InternacionRequest {
  idPaciente: number
  idHabitacion: number
  motivo: string
  observaciones?: string
}

export interface TrasladoRequest {
  idHabitacionDestino: number
  motivo: string
  observaciones?: string
}

export interface EgresoRequest {
  observaciones?: string
}
