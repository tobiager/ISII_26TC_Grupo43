import type { Patient } from '../../types/patient'
import { localidadNombre, provinciaDeLocalidad, obraSocialNombre } from './locations'

interface PatientSeed {
  id: number
  nombre: string
  apellido: string
  dni: number
  fechaNacimiento: string
  tipoSangre: string
  alergias: string[]
  enfermedadesCronicas: string[] | null
  antecedentesFamiliares: string[] | null
  antecedentesText: string | null
  idObraSocial: number | null
  nroAfiliado: string | null
  fechaVencimientoAfiliacion: string | null
  estado: 'Ambulatorio' | 'Internado'
  numeroHabitacion: string | null
  ultimaVisita: string | null
  telefono: string
  tipoTelefono: string
  direccion: string
  numeroDireccion: number
  piso: number | null
  tipoResidencia: string
  idLocalidad: number
  contactosEmergencia: { nombre: string; telefono: string; parentesco: string }[]
}

function edadDesde(fechaNacimiento: string): number {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const m = hoy.getMonth() - nacimiento.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

const PATIENT_SEEDS: PatientSeed[] = [
  { id: 1, nombre: 'Martina', apellido: 'Gómez', dni: 34521678, fechaNacimiento: '1990-03-14', tipoSangre: 'O+', alergias: ['Penicilina'], enfermedadesCronicas: null, antecedentesFamiliares: ['Hipertensión'], antecedentesText: null, idObraSocial: 2, nroAfiliado: 'OS-100234', fechaVencimientoAfiliacion: '2027-01-31', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-06-18', telefono: '+54 9 11 4455-1122', tipoTelefono: 'personal', direccion: 'Calle 47', numeroDireccion: 620, piso: null, tipoResidencia: 'permanente', idLocalidad: 1, contactosEmergencia: [{ nombre: 'Carlos Gómez', telefono: '+54 9 11 4455-9988', parentesco: 'Padre' }] },
  { id: 2, nombre: 'Lucas', apellido: 'Fernández', dni: 28934521, fechaNacimiento: '1985-07-02', tipoSangre: 'A+', alergias: ['Ibuprofeno', 'Látex'], enfermedadesCronicas: ['Diabetes tipo 2'], antecedentesFamiliares: ['Diabetes'], antecedentesText: 'Cirugía de apéndice en 2015.', idObraSocial: 3, nroAfiliado: 'SM-559812', fechaVencimientoAfiliacion: '2026-11-30', estado: 'Internado', numeroHabitacion: '101', ultimaVisita: '2026-06-28', telefono: '+54 9 11 5566-3344', tipoTelefono: 'personal', direccion: 'Av. 7', numeroDireccion: 1450, piso: 3, tipoResidencia: 'permanente', idLocalidad: 1, contactosEmergencia: [{ nombre: 'Ana Fernández', telefono: '+54 9 11 5566-7788', parentesco: 'Esposa' }] },
  { id: 3, nombre: 'Sofía', apellido: 'Rodríguez', dni: 39012345, fechaNacimiento: '1998-11-20', tipoSangre: 'B+', alergias: [], enfermedadesCronicas: null, antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 1, nroAfiliado: null, fechaVencimientoAfiliacion: null, estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-05-30', telefono: '+54 9 223 455-1010', tipoTelefono: 'personal', direccion: 'Belgrano', numeroDireccion: 2310, piso: 2, tipoResidencia: 'permanente', idLocalidad: 2, contactosEmergencia: [{ nombre: 'Laura Rodríguez', telefono: '+54 9 223 455-2020', parentesco: 'Madre' }] },
  { id: 4, nombre: 'Mateo', apellido: 'Álvarez', dni: 31245678, fechaNacimiento: '1979-02-08', tipoSangre: 'AB-', alergias: ['Dipirona'], enfermedadesCronicas: ['Hipertensión arterial'], antecedentesFamiliares: ['Cardiopatía'], antecedentesText: null, idObraSocial: 7, nroAfiliado: 'IOMA-778213', fechaVencimientoAfiliacion: '2026-09-15', estado: 'Internado', numeroHabitacion: '102', ultimaVisita: '2026-07-01', telefono: '+54 9 11 3322-9911', tipoTelefono: 'emergencia', direccion: 'Guemes', numeroDireccion: 880, piso: null, tipoResidencia: 'permanente', idLocalidad: 3, contactosEmergencia: [{ nombre: 'Julia Álvarez', telefono: '+54 9 11 3322-4400', parentesco: 'Hija' }, { nombre: 'Pedro Álvarez', telefono: '+54 9 11 3322-5500', parentesco: 'Hermano' }] },
  { id: 5, nombre: 'Valentina', apellido: 'Torres', dni: 40123456, fechaNacimiento: '2001-05-27', tipoSangre: 'O-', alergias: ['Aspirina'], enfermedadesCronicas: null, antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 4, nroAfiliado: 'GAL-330912', fechaVencimientoAfiliacion: '2027-03-10', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-06-05', telefono: '+54 9 11 6677-1234', tipoTelefono: 'personal', direccion: 'Junín', numeroDireccion: 1500, piso: 5, tipoResidencia: 'transitorio', idLocalidad: 4, contactosEmergencia: [{ nombre: 'Marcos Torres', telefono: '+54 9 11 6677-4321', parentesco: 'Padre' }] },
  { id: 6, nombre: 'Benjamín', apellido: 'Silva', dni: 27456123, fechaNacimiento: '1975-09-12', tipoSangre: 'A-', alergias: [], enfermedadesCronicas: ['EPOC'], antecedentesFamiliares: ['Cáncer'], antecedentesText: 'Fumador desde los 20 años, dejó en 2020.', idObraSocial: 2, nroAfiliado: 'OS-441209', fechaVencimientoAfiliacion: '2026-08-20', estado: 'Internado', numeroHabitacion: '201', ultimaVisita: '2026-07-02', telefono: '+54 9 351 455-3311', tipoTelefono: 'personal', direccion: 'Av. Colón', numeroDireccion: 2200, piso: null, tipoResidencia: 'permanente', idLocalidad: 5, contactosEmergencia: [{ nombre: 'Rosa Silva', telefono: '+54 9 351 455-9900', parentesco: 'Esposa' }] },
  { id: 7, nombre: 'Camila', apellido: 'Romero', dni: 36789012, fechaNacimiento: '1993-01-30', tipoSangre: 'B-', alergias: ['Polen'], enfermedadesCronicas: null, antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 1, nroAfiliado: null, fechaVencimientoAfiliacion: null, estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-04-22', telefono: '+54 9 351 611-7788', tipoTelefono: 'personal', direccion: 'Sarmiento', numeroDireccion: 340, piso: 1, tipoResidencia: 'permanente', idLocalidad: 6, contactosEmergencia: [{ nombre: 'Diego Romero', telefono: '+54 9 351 611-8899', parentesco: 'Hermano' }] },
  { id: 8, nombre: 'Thiago', apellido: 'Díaz', dni: 41234567, fechaNacimiento: '2003-08-16', tipoSangre: 'O+', alergias: ['Penicilina', 'Aspirina'], enfermedadesCronicas: null, antecedentesFamiliares: ['Asma'], antecedentesText: null, idObraSocial: 5, nroAfiliado: 'MED-220145', fechaVencimientoAfiliacion: '2026-12-05', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-06-11', telefono: '+54 9 379 455-2233', tipoTelefono: 'personal', direccion: '9 de Julio', numeroDireccion: 970, piso: null, tipoResidencia: 'permanente', idLocalidad: 7, contactosEmergencia: [{ nombre: 'Marta Díaz', telefono: '+54 9 379 455-6677', parentesco: 'Madre' }] },
  { id: 9, nombre: 'Isabella', apellido: 'Molina', dni: 29876543, fechaNacimiento: '1982-12-05', tipoSangre: 'AB+', alergias: [], enfermedadesCronicas: ['Insuficiencia renal'], antecedentesFamiliares: ['Diabetes', 'Hipertensión'], antecedentesText: 'En seguimiento por nefrología desde 2022.', idObraSocial: 8, nroAfiliado: 'PAMI-990211', fechaVencimientoAfiliacion: '2026-10-01', estado: 'Internado', numeroHabitacion: '202', ultimaVisita: '2026-07-01', telefono: '+54 9 379 511-4455', tipoTelefono: 'emergencia', direccion: 'Mendoza', numeroDireccion: 1120, piso: null, tipoResidencia: 'permanente', idLocalidad: 8, contactosEmergencia: [{ nombre: 'Roberto Molina', telefono: '+54 9 379 511-3322', parentesco: 'Esposo' }] },
  { id: 10, nombre: 'Joaquín', apellido: 'Sosa', dni: 37890123, fechaNacimiento: '1996-06-19', tipoSangre: 'A+', alergias: ['Látex'], enfermedadesCronicas: null, antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 6, nroAfiliado: 'SAN-114892', fechaVencimientoAfiliacion: '2027-02-14', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-05-15', telefono: '+54 9 341 455-8899', tipoTelefono: 'personal', direccion: 'Pellegrini', numeroDireccion: 2050, piso: 4, tipoResidencia: 'permanente', idLocalidad: 9, contactosEmergencia: [{ nombre: 'Florencia Sosa', telefono: '+54 9 341 455-1100', parentesco: 'Hermana' }] },
  { id: 11, nombre: 'Emma', apellido: 'Acosta', dni: 42345678, fechaNacimiento: '2005-04-09', tipoSangre: 'O-', alergias: [], enfermedadesCronicas: null, antecedentesFamiliares: ['Hipertensión'], antecedentesText: null, idObraSocial: 1, nroAfiliado: null, fechaVencimientoAfiliacion: null, estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-03-27', telefono: '+54 9 341 622-3344', tipoTelefono: 'personal', direccion: 'Rioja', numeroDireccion: 780, piso: null, tipoResidencia: 'transitorio', idLocalidad: 10, contactosEmergencia: [{ nombre: 'Nicolás Acosta', telefono: '+54 9 341 622-5566', parentesco: 'Padre' }] },
  { id: 12, nombre: 'Bautista', apellido: 'Herrera', dni: 33456789, fechaNacimiento: '1988-10-23', tipoSangre: 'B+', alergias: ['Dipirona'], enfermedadesCronicas: ['Asma'], antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 3, nroAfiliado: 'SM-661203', fechaVencimientoAfiliacion: '2026-07-30', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-06-24', telefono: '+54 9 362 455-7711', tipoTelefono: 'personal', direccion: 'French', numeroDireccion: 410, piso: 1, tipoResidencia: 'permanente', idLocalidad: 11, contactosEmergencia: [{ nombre: 'Paula Herrera', telefono: '+54 9 362 455-2288', parentesco: 'Esposa' }] },
  { id: 13, nombre: 'Renata', apellido: 'Paredes', dni: 38567890, fechaNacimiento: '1994-09-01', tipoSangre: 'A-', alergias: ['Polen', 'Ibuprofeno'], enfermedadesCronicas: null, antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 2, nroAfiliado: 'OS-880124', fechaVencimientoAfiliacion: '2026-11-11', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-06-30', telefono: '+54 9 362 500-9922', tipoTelefono: 'personal', direccion: 'Illia', numeroDireccion: 1230, piso: null, tipoResidencia: 'permanente', idLocalidad: 12, contactosEmergencia: [{ nombre: 'Hugo Paredes', telefono: '+54 9 362 500-4411', parentesco: 'Padre' }] },
  { id: 14, nombre: 'Santino', apellido: 'Benítez', dni: 44567890, fechaNacimiento: '2008-01-17', tipoSangre: 'O+', alergias: [], enfermedadesCronicas: null, antecedentesFamiliares: ['Diabetes'], antecedentesText: null, idObraSocial: 1, nroAfiliado: null, fechaVencimientoAfiliacion: null, estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-02-19', telefono: '+54 9 11 7788-1122', tipoTelefono: 'personal', direccion: 'Moreno', numeroDireccion: 560, piso: null, tipoResidencia: 'permanente', idLocalidad: 1, contactosEmergencia: [{ nombre: 'Vanina Benítez', telefono: '+54 9 11 7788-3344', parentesco: 'Madre' }] },
  { id: 15, nombre: 'Alma', apellido: 'Ibarra', dni: 35678901, fechaNacimiento: '1991-06-30', tipoSangre: 'AB-', alergias: ['Aspirina'], enfermedadesCronicas: ['Hipotiroidismo'], antecedentesFamiliares: null, antecedentesText: null, idObraSocial: 4, nroAfiliado: 'GAL-552071', fechaVencimientoAfiliacion: '2027-04-22', estado: 'Ambulatorio', numeroHabitacion: null, ultimaVisita: '2026-06-08', telefono: '+54 9 223 611-5544', tipoTelefono: 'personal', direccion: 'Alberdi', numeroDireccion: 900, piso: 2, tipoResidencia: 'permanente', idLocalidad: 2, contactosEmergencia: [{ nombre: 'Gastón Ibarra', telefono: '+54 9 223 611-6655', parentesco: 'Esposo' }] },
]

export const MOCK_PATIENTS: Patient[] = PATIENT_SEEDS.map(seed => {
  const { id: idProvincia, nombre: nombreProvincia } = provinciaDeLocalidad(seed.idLocalidad)
  return {
    id: seed.id,
    nombre: seed.nombre,
    apellido: seed.apellido,
    nombreCompleto: `${seed.nombre} ${seed.apellido}`,
    dni: seed.dni,
    edad: edadDesde(seed.fechaNacimiento),
    fechaNacimiento: seed.fechaNacimiento,
    tipoSangre: seed.tipoSangre,
    alergias: seed.alergias,
    enfermedadesCronicas: seed.enfermedadesCronicas,
    antecedentesFamiliares: seed.antecedentesFamiliares,
    antecedentesText: seed.antecedentesText,
    obraSocial: obraSocialNombre(seed.idObraSocial),
    idObraSocial: seed.idObraSocial,
    nroAfiliado: seed.nroAfiliado,
    fechaVencimientoAfiliacion: seed.fechaVencimientoAfiliacion,
    estado: seed.estado,
    numeroHabitacion: seed.numeroHabitacion,
    ultimaVisita: seed.ultimaVisita,
    telefono: seed.telefono,
    tipoTelefono: seed.tipoTelefono,
    direccion: seed.direccion,
    numeroDireccion: seed.numeroDireccion,
    piso: seed.piso,
    tipoResidencia: seed.tipoResidencia,
    idLocalidad: seed.idLocalidad,
    nombreLocalidad: localidadNombre(seed.idLocalidad),
    idProvincia,
    nombreProvincia,
    contactosEmergencia: seed.contactosEmergencia,
  }
})
