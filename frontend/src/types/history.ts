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

export interface HistorialMedicoDetalle {
  id: number
  fechaCreacion: string
  fechaActualizacion: string
  observaciones: string | null
  estadoHistorial: string
  registros: RegistroClinico[]
}

export interface RegistroClinicoRequest {
  idPaciente: number
  idTipoProcedimiento: number
  descripcion: string
}
