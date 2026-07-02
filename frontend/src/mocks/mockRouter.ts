import type { Patient } from '../types/patient'
import type { RegistroClinico } from '../types/history'
import { store } from './store'
import { MOCK_DEMO_TOKEN, MOCK_DEMO_USER } from './fixtures/users'
import { DEMO_CREDENTIALS } from './demoMode'

export class MockHttpError extends Error {
  status: number
  data: unknown
  constructor(status: number, data: unknown) {
    super(typeof data === 'object' && data && 'error' in (data as object) ? String((data as any).error) : 'Mock error')
    this.status = status
    this.data = data
  }
}

interface RouteContext {
  params: Record<string, string>
  query: Record<string, string>
  body: any
  token: string | null
}

type Handler = (ctx: RouteContext) => unknown

interface RouteDef {
  method: string
  pattern: RegExp
  paramNames: string[]
  handler: Handler
}

const routes: RouteDef[] = []

function compile(path: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = []
  const regexStr = path
    .split('/')
    .map(segment => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1))
        return '([^/]+)'
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { pattern: new RegExp(`^${regexStr}$`), paramNames }
}

function route(method: string, path: string, handler: Handler) {
  const { pattern, paramNames } = compile(path)
  routes.push({ method: method.toUpperCase(), pattern, paramNames, handler })
}

function requireAuth(token: string | null) {
  if (token !== MOCK_DEMO_TOKEN) {
    throw new MockHttpError(401, { error: 'No autenticado' })
  }
}

// En el modo demo el único usuario real es el VISITANTE, así que las mutaciones
// reservadas a ADMINISTRADOR siempre quedan bloqueadas (coincide con la regla real del backend).
function requireAdmin(token: string | null) {
  requireAuth(token)
  throw new MockHttpError(403, { error: 'Tu rol (Visitante) no permite esta acción en el modo demo.' })
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// ---- Auth ----
route('POST', '/auth/login', ({ body }) => {
  if (body?.email === DEMO_CREDENTIALS.email && body?.password === DEMO_CREDENTIALS.password) {
    return { token: MOCK_DEMO_TOKEN, usuario: MOCK_DEMO_USER }
  }
  throw new MockHttpError(401, { error: 'Credenciales incorrectas. Verifique email y contraseña.' })
})

route('POST', '/auth/register', () => {
  throw new MockHttpError(403, { error: 'El registro no está disponible en el modo demo.' })
})

route('GET', '/auth/invitations/validate', () => {
  throw new MockHttpError(404, { error: 'Invitación no encontrada.' })
})

route('GET', '/auth/me', ({ token }) => {
  requireAuth(token)
  return MOCK_DEMO_USER
})

route('GET', '/auth/invitations', ({ token }) => {
  requireAuth(token)
  return []
})

route('POST', '/auth/invitations', ({ token }) => {
  requireAdmin(token)
})

// ---- Admin ----
route('GET', '/admin/users', ({ token }) => {
  requireAuth(token)
  return store.adminUsuarios
})

route('PATCH', '/admin/users/:id/role', ({ token, params, body }) => {
  requireAdmin(token)
  const user = store.adminUsuarios.find(u => u.idUsuario === Number(params.id))
  if (!user) throw new MockHttpError(404, { error: 'Usuario no encontrado.' })
  user.rol = body.rol
  return user
})

route('PATCH', '/admin/users/:id/disable', ({ token, params }) => {
  requireAdmin(token)
  const user = store.adminUsuarios.find(u => u.idUsuario === Number(params.id))
  if (!user) throw new MockHttpError(404, { error: 'Usuario no encontrado.' })
  user.activo = false
  return user
})

route('PATCH', '/admin/users/:id/enable', ({ token, params }) => {
  requireAdmin(token)
  const user = store.adminUsuarios.find(u => u.idUsuario === Number(params.id))
  if (!user) throw new MockHttpError(404, { error: 'Usuario no encontrado.' })
  user.activo = true
  return user
})

route('PATCH', '/admin/users/:id/reset-password', ({ token }) => {
  requireAdmin(token)
  return { message: 'Contraseña reseteada (demo).', temporaryPassword: 'Temporal123456' }
})

// ---- Profile ----
route('GET', '/profile', ({ token }) => {
  requireAuth(token)
  return {
    idUsuario: MOCK_DEMO_USER.idUsuario,
    email: MOCK_DEMO_USER.email,
    nombre: MOCK_DEMO_USER.nombre,
    apellido: MOCK_DEMO_USER.apellido,
    rol: MOCK_DEMO_USER.rol,
    autorizacion: MOCK_DEMO_USER.autorizacion,
    mustChangePassword: false,
    esAdminProtegido: false,
  }
})

route('PATCH', '/profile/password', ({ token }) => {
  requireAuth(token)
  throw new MockHttpError(403, { error: 'No disponible en el modo demo.' })
})

route('PATCH', '/profile/email', ({ token }) => {
  requireAuth(token)
  throw new MockHttpError(403, { error: 'No disponible en el modo demo.' })
})

route('PATCH', '/profile/basic-data', ({ token }) => {
  requireAuth(token)
  throw new MockHttpError(403, { error: 'No disponible en el modo demo.' })
})

// ---- Pacientes ----
route('GET', '/pacientes', ({ token }) => {
  requireAuth(token)
  return store.patients
})

route('GET', '/pacientes/desactivados', ({ token }) => {
  requireAuth(token)
  return store.deletedPatients
})

route('GET', '/pacientes/existe-dni', ({ token, query }) => {
  requireAuth(token)
  const dni = Number(query.dni)
  const excluirId = query.excluirId ? Number(query.excluirId) : undefined
  const existe = store.patients.some(p => p.dni === dni && p.id !== excluirId)
  return { existe }
})

route('GET', '/pacientes/existe-afiliado', ({ token, query }) => {
  requireAuth(token)
  const excluirId = query.excluirId ? Number(query.excluirId) : undefined
  const existe = store.patients.some(
    p => p.nroAfiliado === query.nroAfiliado && p.id !== excluirId
  )
  return { existe }
})

route('GET', '/pacientes/:id', ({ token, params }) => {
  requireAuth(token)
  const patient = store.patients.find(p => p.id === Number(params.id))
  if (!patient) throw new MockHttpError(404, { error: 'Paciente no encontrado.' })
  return patient
})

route('POST', '/pacientes', ({ token, body }) => {
  requireAuth(token)
  const id = store.nextPatientId++
  const newPatient: Patient = {
    id,
    nombre: body.nombre,
    apellido: body.apellido,
    nombreCompleto: `${body.nombre} ${body.apellido}`,
    dni: Number(body.dni),
    edad: 0,
    fechaNacimiento: body.fechaNacimiento,
    tipoSangre: body.tipoSangre,
    alergias: body.alergias ?? [],
    enfermedadesCronicas: body.enfermedadesCronicas ?? null,
    antecedentesFamiliares: body.antecedentesFamiliares ?? null,
    antecedentesText: body.antecedentesText ?? null,
    obraSocial: null,
    idObraSocial: body.idObraSocial ?? null,
    nroAfiliado: body.nroAfiliado ?? null,
    fechaVencimientoAfiliacion: body.fechaVencimientoAfiliacion ?? null,
    estado: 'Ambulatorio',
    numeroHabitacion: null,
    ultimaVisita: null,
    telefono: body.telefono ?? null,
    tipoTelefono: body.tipoTelefono ?? null,
    direccion: body.direccion ?? null,
    numeroDireccion: body.numeroDireccion ?? null,
    piso: body.piso ?? null,
    tipoResidencia: body.tipoResidencia ?? null,
    idLocalidad: body.idLocalidad ?? null,
    nombreLocalidad: null,
    idProvincia: null,
    nombreProvincia: null,
    contactosEmergencia: body.contactosEmergencia ?? [],
  }
  store.patients.push(newPatient)
  return newPatient
})

route('PUT', '/pacientes/:id', ({ token, params, body }) => {
  requireAuth(token)
  const patient = store.patients.find(p => p.id === Number(params.id))
  if (!patient) throw new MockHttpError(404, { error: 'Paciente no encontrado.' })
  Object.assign(patient, {
    nombre: body.nombre,
    apellido: body.apellido,
    nombreCompleto: `${body.nombre} ${body.apellido}`,
    dni: Number(body.dni),
    fechaNacimiento: body.fechaNacimiento,
    tipoSangre: body.tipoSangre,
    alergias: body.alergias ?? [],
    enfermedadesCronicas: body.enfermedadesCronicas ?? null,
    antecedentesFamiliares: body.antecedentesFamiliares ?? null,
    antecedentesText: body.antecedentesText ?? null,
    idObraSocial: body.idObraSocial ?? null,
    nroAfiliado: body.nroAfiliado ?? null,
    fechaVencimientoAfiliacion: body.fechaVencimientoAfiliacion ?? null,
    telefono: body.telefono ?? null,
    tipoTelefono: body.tipoTelefono ?? null,
    direccion: body.direccion ?? null,
    numeroDireccion: body.numeroDireccion ?? null,
    piso: body.piso ?? null,
    tipoResidencia: body.tipoResidencia ?? null,
    idLocalidad: body.idLocalidad ?? null,
    contactosEmergencia: body.contactosEmergencia ?? [],
  })
  return patient
})

route('DELETE', '/pacientes/:id', ({ token, params }) => {
  requireAuth(token)
  const idx = store.patients.findIndex(p => p.id === Number(params.id))
  if (idx === -1) throw new MockHttpError(404, { error: 'Paciente no encontrado.' })
  const [patient] = store.patients.splice(idx, 1)
  store.deletedPatients.push(patient)
  return undefined
})

route('PATCH', '/pacientes/:id/restaurar', ({ token, params }) => {
  requireAuth(token)
  const idx = store.deletedPatients.findIndex(p => p.id === Number(params.id))
  if (idx === -1) throw new MockHttpError(404, { error: 'Paciente no encontrado.' })
  const [patient] = store.deletedPatients.splice(idx, 1)
  store.patients.push(patient)
  return undefined
})

// ---- Habitaciones / Internación ----
route('GET', '/habitaciones', ({ token }) => {
  requireAuth(token)
  return store.rooms
})

route('POST', '/habitaciones/:id/internar', ({ token, params, body }) => {
  requireAuth(token)
  const room = store.rooms.find(r => r.id === Number(params.id))
  const patient = store.patients.find(p => p.id === Number(body.idPaciente))
  if (!room || !patient) throw new MockHttpError(404, { error: 'Habitación o paciente no encontrado.' })
  if (room.estadoHabitacion !== 'disponible') throw new MockHttpError(409, { error: 'La habitación no está disponible.' })

  const idInternacion = store.nextInternacionId++
  room.estadoHabitacion = 'ocupada'
  room.pacienteActual = { id: patient.id, nombreCompleto: patient.nombreCompleto, dni: patient.dni }
  room.internacionActual = { id: idInternacion, fechaInicio: today(), cantidadTraslados: 0 }
  patient.estado = 'Internado'
  patient.numeroHabitacion = room.numeroHabitacion

  const evento: RegistroClinico = {
    id: store.nextRegistroId++,
    descripcion: body.motivo + (body.observaciones ? ` — ${body.observaciones}` : ''),
    fechaRegistro: today(),
    idTipoProcedimiento: 8,
    tipoProcedimiento: 'Internación',
    idUsuario: MOCK_DEMO_USER.idUsuario,
    usuarioNombre: MOCK_DEMO_USER.nombreCompleto,
    usuarioRol: MOCK_DEMO_USER.rol,
  }
  const historial = getOrCreateHistorial(patient.id)
  historial.internaciones.push({
    idInternacion,
    fechaInicio: today(),
    fechaFin: null,
    estado: 'ACTIVA',
    numeroHabitacion: room.numeroHabitacion,
    pisoHabitacion: room.pisoHabitacion,
    cantidadTraslados: 0,
    eventos: [evento],
  })
  historial.registros.push(evento)
  return undefined
})

route('POST', '/internaciones/:idInternacion/trasladar', ({ token, params, body }) => {
  requireAuth(token)
  const idInternacion = Number(params.idInternacion)
  const origen = store.rooms.find(r => r.internacionActual?.id === idInternacion)
  const destino = store.rooms.find(r => r.id === Number(body.idHabitacionDestino))
  if (!origen || !destino) throw new MockHttpError(404, { error: 'Habitación no encontrada.' })
  if (destino.estadoHabitacion !== 'disponible') throw new MockHttpError(409, { error: 'La habitación destino no está disponible.' })

  const patient = store.patients.find(p => p.id === origen.pacienteActual?.id)
  destino.estadoHabitacion = 'ocupada'
  destino.pacienteActual = origen.pacienteActual
  destino.internacionActual = { ...origen.internacionActual!, cantidadTraslados: origen.internacionActual!.cantidadTraslados + 1 }
  origen.estadoHabitacion = 'disponible'
  origen.pacienteActual = null
  origen.internacionActual = null
  if (patient) patient.numeroHabitacion = destino.numeroHabitacion

  const evento: RegistroClinico = {
    id: store.nextRegistroId++,
    descripcion: body.motivo + (body.observaciones ? ` — ${body.observaciones}` : ''),
    fechaRegistro: today(),
    idTipoProcedimiento: 17,
    tipoProcedimiento: 'Traslado de habitación',
    idUsuario: MOCK_DEMO_USER.idUsuario,
    usuarioNombre: MOCK_DEMO_USER.nombreCompleto,
    usuarioRol: MOCK_DEMO_USER.rol,
  }
  if (patient) {
    const historial = getOrCreateHistorial(patient.id)
    const internacion = historial.internaciones.find(i => i.idInternacion === idInternacion)
    if (internacion) {
      internacion.numeroHabitacion = destino.numeroHabitacion
      internacion.pisoHabitacion = destino.pisoHabitacion
      internacion.cantidadTraslados += 1
      internacion.eventos.push(evento)
    }
    historial.registros.push(evento)
  }
  return undefined
})

route('POST', '/internaciones/:idInternacion/egresar', ({ token, params, body }) => {
  requireAuth(token)
  const idInternacion = Number(params.idInternacion)
  const room = store.rooms.find(r => r.internacionActual?.id === idInternacion)
  if (!room) throw new MockHttpError(404, { error: 'Internación no encontrada.' })

  const patient = store.patients.find(p => p.id === room.pacienteActual?.id)
  room.estadoHabitacion = 'disponible'
  room.pacienteActual = null
  room.internacionActual = null
  if (patient) {
    patient.estado = 'Ambulatorio'
    patient.numeroHabitacion = null
    patient.ultimaVisita = today()
  }

  const evento: RegistroClinico = {
    id: store.nextRegistroId++,
    descripcion: body.observaciones ?? 'Alta médica.',
    fechaRegistro: today(),
    idTipoProcedimiento: 10,
    tipoProcedimiento: 'Alta médica',
    idUsuario: MOCK_DEMO_USER.idUsuario,
    usuarioNombre: MOCK_DEMO_USER.nombreCompleto,
    usuarioRol: MOCK_DEMO_USER.rol,
  }
  if (patient) {
    const historial = getOrCreateHistorial(patient.id)
    const internacion = historial.internaciones.find(i => i.idInternacion === idInternacion)
    if (internacion) {
      internacion.estado = 'EGRESADA'
      internacion.fechaFin = today()
      internacion.eventos.push(evento)
    }
    historial.registros.push(evento)
  }
  return undefined
})

route('PATCH', '/habitaciones/:id/estado', ({ token, params, body }) => {
  requireAuth(token)
  const room = store.rooms.find(r => r.id === Number(params.id))
  if (!room) throw new MockHttpError(404, { error: 'Habitación no encontrada.' })
  if (room.estadoHabitacion === 'ocupada') throw new MockHttpError(409, { error: 'No se puede cambiar el estado de una habitación ocupada.' })
  room.estadoHabitacion = body.estado
  return undefined
})

// ---- Historial ----
route('GET', '/historial/tipos-procedimiento', ({ token }) => {
  requireAuth(token)
  return store.tiposProcedimiento
})

route('GET', '/historial/:idPaciente', ({ token, params }) => {
  requireAuth(token)
  return getOrCreateHistorial(Number(params.idPaciente))
})

route('POST', '/historial/:idPaciente/registros', ({ token, params, body }) => {
  requireAuth(token)
  const idPaciente = Number(params.idPaciente)
  const historial = getOrCreateHistorial(idPaciente)
  const tipo = store.tiposProcedimiento.find(t => t.id === body.idTipoProcedimiento)
  const evento: RegistroClinico = {
    id: store.nextRegistroId++,
    descripcion: body.descripcion,
    fechaRegistro: today(),
    idTipoProcedimiento: body.idTipoProcedimiento,
    tipoProcedimiento: tipo?.nombre ?? 'Registro',
    idUsuario: MOCK_DEMO_USER.idUsuario,
    usuarioNombre: MOCK_DEMO_USER.nombreCompleto,
    usuarioRol: MOCK_DEMO_USER.rol,
  }
  const activeInternacion = historial.internaciones.find(i => i.estado === 'ACTIVA')
  if (activeInternacion) {
    activeInternacion.eventos.push(evento)
  } else {
    historial.eventosAmbulatorios.push(evento)
  }
  historial.registros.push(evento)
  return undefined
})

function getOrCreateHistorial(idPaciente: number) {
  if (!store.historial[idPaciente]) {
    store.historial[idPaciente] = {
      id: idPaciente,
      fechaCreacion: today(),
      fechaActualizacion: today(),
      observaciones: null,
      estadoHistorial: 'activo',
      registros: [],
      eventosAmbulatorios: [],
      internaciones: [],
    }
  }
  return store.historial[idPaciente]
}

// ---- Reference data ----
route('GET', '/provincias', () => store.provincias)

route('GET', '/localidades', ({ query }) => {
  if (query.provinciaId) {
    return store.localidades.filter(l => l.idProvincia === Number(query.provinciaId))
  }
  return store.localidades
})

route('GET', '/obras-sociales', () => store.obrasSociales)

route('GET', '/usuarios/perfil', ({ token }) => {
  requireAuth(token)
  return {
    id: MOCK_DEMO_USER.idUsuario,
    email: MOCK_DEMO_USER.email,
    nombre: MOCK_DEMO_USER.nombre,
    apellido: MOCK_DEMO_USER.apellido,
    nombreCompleto: MOCK_DEMO_USER.nombreCompleto,
    iniciales: MOCK_DEMO_USER.iniciales,
    rol: MOCK_DEMO_USER.rol,
  }
})

route('GET', '/usuarios/:id', ({ token, params }) => {
  requireAuth(token)
  const user = store.adminUsuarios.find(u => u.idUsuario === Number(params.id))
  if (!user) throw new MockHttpError(404, { error: 'Usuario no encontrado.' })
  return {
    id: user.idUsuario,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    nombreCompleto: user.nombreCompleto,
    iniciales: user.iniciales,
    rol: user.rol,
  }
})

export function matchRoute(method: string, path: string, query: Record<string, string>) {
  for (const r of routes) {
    if (r.method !== method.toUpperCase()) continue
    const match = r.pattern.exec(path)
    if (!match) continue
    const params: Record<string, string> = {}
    r.paramNames.forEach((name, i) => { params[name] = match[i + 1] })
    return { handler: r.handler, params, query }
  }
  return null
}
