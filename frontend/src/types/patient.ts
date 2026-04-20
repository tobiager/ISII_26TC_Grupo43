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
  enfermedadesCronicas: string | null
  antecedenteFamiliar: string | null
  obraSocial: string | null
  idObraSocial: number | null
  nroAfiliado: string | null
  estado: 'Ambulatorio' | 'Internado' | 'Egresado'
  numeroHabitacion: string | null
  ultimaVisita: string | null
  telefono: string | null
  direccion: string | null
  // Ubicación estructurada (localidad → provincia)
  idLocalidad: number | null
  nombreLocalidad: string | null
  idProvincia: number | null
  nombreProvincia: string | null
  // Contacto de emergencia
  contactoEmergenciaNombre: string | null
  contactoEmergenciaTelefono: string | null
  contactoEmergenciaParentesco: string | null
}

export interface PatientRequest {
  nombre: string
  apellido: string
  dni: number | ''
  fechaNacimiento: string
  tipoSangre: string
  alergias: string[]
  enfermedadesCronicas: string
  antecedenteFamiliar: string
  telefono: string
  direccion: string
  idLocalidad: number | ''
  contactoEmergenciaNombre: string
  contactoEmergenciaTelefono: string
  contactoEmergenciaParentesco: string
  idObraSocial: number | ''
  nombreObraSocial: string
  nroAfiliado: string
}

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
