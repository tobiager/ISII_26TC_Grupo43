export interface EmergencyContact {
  nombre: string
  telefono: string
  parentesco: string
}

export interface Patient {
  id: number
  nombre: string
  apellido: string
  nombreCompleto: string
  dni: number
  edad: number
  fechaNacimiento: string
  tipoSangre: string
  alergias: string[]
  enfermedadesCronicas: string[] | null
  antecedentesFamiliares: string[] | null
  antecedentesText: string | null
  obraSocial: string | null
  idObraSocial: number | null
  nroAfiliado: string | null
  fechaVencimientoAfiliacion: string | null
  estado: 'Ambulatorio' | 'Internado' | 'Egresado'
  numeroHabitacion: string | null
  ultimaVisita: string | null
  telefono: string | null
  tipoTelefono: string | null
  direccion: string | null
  numeroDireccion: number | null
  piso: number | null
  tipoResidencia: string | null
  idLocalidad: number | null
  nombreLocalidad: string | null
  idProvincia: number | null
  nombreProvincia: string | null
  contactosEmergencia: EmergencyContact[]
}

export interface PatientRequest {
  nombre: string
  apellido: string
  dni: number | ''
  fechaNacimiento: string
  tipoSangre: string
  alergias: string[]
  enfermedadesCronicas: string[]
  antecedentesFamiliares: string[]
  antecedentesText: string
  telefono: string
  tipoTelefono: string
  direccion: string
  numeroDireccion: number | ''
  piso: number | ''
  tipoResidencia: string
  idLocalidad: number | ''
  contactosEmergencia: EmergencyContact[]
  idObraSocial: number | ''
  nombreObraSocial: string
  nroAfiliado: string
  fechaVencimientoAfiliacion: string
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
