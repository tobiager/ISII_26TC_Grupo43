export interface TipoProcedimiento {
  id: number
  nombre: string
}

export interface RegistroClinico {
  id: number
  descripcion: string
  fechaRegistro: string
  idTipoProcedimiento: number
  tipoProcedimiento: string
  idUsuario: number
  usuarioNombre: string
  usuarioRol: string
}

export interface InternacionHistorial {
  idInternacion: number
  fechaInicio: string
  fechaFin: string | null
  estado: 'ACTIVA' | 'EGRESADA'
  numeroHabitacion: string
  pisoHabitacion: number
  cantidadTraslados: number
  eventos: RegistroClinico[]
}

export interface HistorialMedicoDetalle {
  id: number
  fechaCreacion: string
  fechaActualizacion: string
  observaciones: string | null
  estadoHistorial: string
  registros: RegistroClinico[]
  eventosAmbulatorios: RegistroClinico[]
  internaciones: InternacionHistorial[]
}

export interface RegistroClinicoRequest {
  idPaciente: number
  idTipoProcedimiento: number
  descripcion: string
}
