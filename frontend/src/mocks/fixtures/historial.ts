import type { HistorialMedicoDetalle, TipoProcedimiento } from '../../types/history'

export const MOCK_TIPOS_PROCEDIMIENTO: TipoProcedimiento[] = [
  { id: 1, nombre: 'Consulta médica' },
  { id: 2, nombre: 'Control clínico' },
  { id: 3, nombre: 'Laboratorio' },
  { id: 4, nombre: 'Imagenología' },
  { id: 5, nombre: 'Vacunación' },
  { id: 6, nombre: 'Prescripción de medicación' },
  { id: 7, nombre: 'Derivación' },
  { id: 8, nombre: 'Internación' },
  { id: 9, nombre: 'Evolución internación' },
  { id: 10, nombre: 'Alta médica' },
  { id: 11, nombre: 'Cirugía' },
  { id: 12, nombre: 'Guardia' },
  { id: 13, nombre: 'Kinesiología' },
  { id: 14, nombre: 'Curación' },
  { id: 15, nombre: 'Registro administrativo' },
  { id: 16, nombre: 'Apertura de historial' },
  { id: 17, nombre: 'Traslado de habitación' },
]

const DRA_LOPEZ = { idUsuario: 3, usuarioNombre: 'Claudia López', usuarioRol: 'MEDICO' }
const ENF_PEREZ = { idUsuario: 4, usuarioNombre: 'Enfermera Pérez', usuarioRol: 'ENFERMERO' }
const ADMIN = { idUsuario: 1, usuarioNombre: 'Admin Clinicks', usuarioRol: 'ADMINISTRADOR' }

type HistorialSeed = Omit<HistorialMedicoDetalle, 'registros'>

const HISTORIAL_SEEDS: Record<number, HistorialSeed> = {
  1: {
    id: 101, fechaCreacion: '2024-01-10', fechaActualizacion: '2026-06-18', observaciones: null, estadoHistorial: 'activo',
    internaciones: [],
    eventosAmbulatorios: [
      { id: 1, descripcion: 'Apertura de historial clínico.', fechaRegistro: '2024-01-10', idTipoProcedimiento: 16, tipoProcedimiento: 'Apertura de historial', ...ADMIN },
      { id: 2, descripcion: 'Consulta de control anual, sin hallazgos relevantes.', fechaRegistro: '2026-06-18', idTipoProcedimiento: 1, tipoProcedimiento: 'Consulta médica', ...DRA_LOPEZ },
      { id: 3, descripcion: 'Análisis de sangre de rutina, valores dentro de parámetros normales.', fechaRegistro: '2026-06-18', idTipoProcedimiento: 3, tipoProcedimiento: 'Laboratorio', ...DRA_LOPEZ },
    ],
  },
  2: {
    id: 102, fechaCreacion: '2022-05-03', fechaActualizacion: '2026-06-28', observaciones: 'Paciente diabético en seguimiento.', estadoHistorial: 'activo',
    eventosAmbulatorios: [
      { id: 4, descripcion: 'Apertura de historial clínico.', fechaRegistro: '2022-05-03', idTipoProcedimiento: 16, tipoProcedimiento: 'Apertura de historial', ...ADMIN },
      { id: 5, descripcion: 'Control de glucemia, ajuste de dosis de insulina.', fechaRegistro: '2026-05-10', idTipoProcedimiento: 2, tipoProcedimiento: 'Control clínico', ...DRA_LOPEZ },
    ],
    internaciones: [
      {
        idInternacion: 1001, fechaInicio: '2026-06-27', fechaFin: null, estado: 'ACTIVA', numeroHabitacion: '101', pisoHabitacion: 1, cantidadTraslados: 0,
        eventos: [
          { id: 6, descripcion: 'Internación por descompensación de diabetes tipo 2.', fechaRegistro: '2026-06-27', idTipoProcedimiento: 8, tipoProcedimiento: 'Internación', ...DRA_LOPEZ },
          { id: 7, descripcion: 'Evolución favorable, glucemia estabilizada.', fechaRegistro: '2026-06-29', idTipoProcedimiento: 9, tipoProcedimiento: 'Evolución internación', ...ENF_PEREZ },
        ],
      },
    ],
  },
  3: {
    id: 103, fechaCreacion: '2025-02-14', fechaActualizacion: '2026-05-30', observaciones: null, estadoHistorial: 'activo',
    internaciones: [],
    eventosAmbulatorios: [
      { id: 8, descripcion: 'Apertura de historial clínico.', fechaRegistro: '2025-02-14', idTipoProcedimiento: 16, tipoProcedimiento: 'Apertura de historial', ...ADMIN },
      { id: 9, descripcion: 'Consulta por dolor de garganta, se prescribe antiinflamatorio.', fechaRegistro: '2026-05-30', idTipoProcedimiento: 6, tipoProcedimiento: 'Prescripción de medicación', ...DRA_LOPEZ },
    ],
  },
  4: {
    id: 104, fechaCreacion: '2021-08-22', fechaActualizacion: '2026-07-01', observaciones: 'Hipertenso, requiere monitoreo cardiovascular.', estadoHistorial: 'activo',
    eventosAmbulatorios: [
      { id: 10, descripcion: 'Apertura de historial clínico.', fechaRegistro: '2021-08-22', idTipoProcedimiento: 16, tipoProcedimiento: 'Apertura de historial', ...ADMIN },
    ],
    internaciones: [
      {
        idInternacion: 1002, fechaInicio: '2026-06-29', fechaFin: null, estado: 'ACTIVA', numeroHabitacion: '102', pisoHabitacion: 1, cantidadTraslados: 1,
        eventos: [
          { id: 11, descripcion: 'Internación por pico hipertensivo.', fechaRegistro: '2026-06-29', idTipoProcedimiento: 8, tipoProcedimiento: 'Internación', ...DRA_LOPEZ },
          { id: 12, descripcion: 'Traslado a habitación 102 por disponibilidad.', fechaRegistro: '2026-06-30', idTipoProcedimiento: 17, tipoProcedimiento: 'Traslado de habitación', ...ENF_PEREZ },
          { id: 13, descripcion: 'Ecocardiograma sin hallazgos agudos.', fechaRegistro: '2026-07-01', idTipoProcedimiento: 4, tipoProcedimiento: 'Imagenología', ...DRA_LOPEZ },
        ],
      },
    ],
  },
  6: {
    id: 106, fechaCreacion: '2020-03-11', fechaActualizacion: '2026-07-02', observaciones: 'EPOC, ex fumador.', estadoHistorial: 'activo',
    eventosAmbulatorios: [
      { id: 14, descripcion: 'Apertura de historial clínico.', fechaRegistro: '2020-03-11', idTipoProcedimiento: 16, tipoProcedimiento: 'Apertura de historial', ...ADMIN },
    ],
    internaciones: [
      {
        idInternacion: 1003, fechaInicio: '2026-06-20', fechaFin: null, estado: 'ACTIVA', numeroHabitacion: '201', pisoHabitacion: 2, cantidadTraslados: 0,
        eventos: [
          { id: 15, descripcion: 'Internación por dificultad respiratoria.', fechaRegistro: '2026-06-20', idTipoProcedimiento: 8, tipoProcedimiento: 'Internación', ...DRA_LOPEZ },
          { id: 16, descripcion: 'Sesión de kinesiología respiratoria.', fechaRegistro: '2026-06-24', idTipoProcedimiento: 13, tipoProcedimiento: 'Kinesiología', ...ENF_PEREZ },
          { id: 17, descripcion: 'Evolución estable, saturación de oxígeno normalizada.', fechaRegistro: '2026-07-02', idTipoProcedimiento: 9, tipoProcedimiento: 'Evolución internación', ...DRA_LOPEZ },
        ],
      },
    ],
  },
  9: {
    id: 109, fechaCreacion: '2022-11-30', fechaActualizacion: '2026-07-01', observaciones: 'Insuficiencia renal, seguimiento por nefrología.', estadoHistorial: 'activo',
    eventosAmbulatorios: [
      { id: 18, descripcion: 'Apertura de historial clínico.', fechaRegistro: '2022-11-30', idTipoProcedimiento: 16, tipoProcedimiento: 'Apertura de historial', ...ADMIN },
    ],
    internaciones: [
      {
        idInternacion: 1004, fechaInicio: '2026-06-30', fechaFin: null, estado: 'ACTIVA', numeroHabitacion: '202', pisoHabitacion: 2, cantidadTraslados: 0,
        eventos: [
          { id: 19, descripcion: 'Internación programada para diálisis.', fechaRegistro: '2026-06-30', idTipoProcedimiento: 8, tipoProcedimiento: 'Internación', ...DRA_LOPEZ },
          { id: 20, descripcion: 'Sesión de diálisis sin complicaciones.', fechaRegistro: '2026-07-01', idTipoProcedimiento: 2, tipoProcedimiento: 'Control clínico', ...ENF_PEREZ },
        ],
      },
    ],
  },
}

export const MOCK_HISTORIAL: Record<number, HistorialMedicoDetalle> = Object.fromEntries(
  Object.entries(HISTORIAL_SEEDS).map(([idPaciente, seed]) => [
    idPaciente,
    {
      ...seed,
      registros: [...seed.eventosAmbulatorios, ...seed.internaciones.flatMap(i => i.eventos)],
    },
  ])
)
