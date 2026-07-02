import type { AuthUser, AdminUsuario } from '../../types/auth'

export const MOCK_DEMO_TOKEN = 'demo-mock-token'

export const MOCK_DEMO_USER: AuthUser = {
  idUsuario: 999,
  email: 'visitante@clinicks.com',
  nombre: 'Visitante',
  apellido: 'Demo',
  nombreCompleto: 'Visitante Demo',
  iniciales: 'VD',
  rol: 'VISITANTE',
  autorizacion: null,
  mustChangePassword: false,
  esAdminProtegido: false,
}

export const MOCK_ADMIN_USUARIOS: AdminUsuario[] = [
  { idUsuario: 1, email: 'admin@clinicks.com', nombre: 'Admin', apellido: 'Clinicks', nombreCompleto: 'Admin Clinicks', iniciales: 'AC', rol: 'ADMINISTRADOR', autorizacion: null, activo: true },
  { idUsuario: 2, email: 'admin@hospital.com', nombre: 'Marta', apellido: 'Gutierrez', nombreCompleto: 'Marta Gutierrez', iniciales: 'MG', rol: 'ADMINISTRATIVO', autorizacion: null, activo: true },
  { idUsuario: 3, email: 'claudia@hospital.com', nombre: 'Claudia', apellido: 'López', nombreCompleto: 'Claudia López', iniciales: 'CL', rol: 'MEDICO', autorizacion: null, activo: true },
  { idUsuario: 4, email: 'enfermera@hospital.com', nombre: 'Enfermera', apellido: 'Pérez', nombreCompleto: 'Enfermera Pérez', iniciales: 'EP', rol: 'ENFERMERO', autorizacion: null, activo: true },
  { idUsuario: 999, email: 'visitante@clinicks.com', nombre: 'Visitante', apellido: 'Demo', nombreCompleto: 'Visitante Demo', iniciales: 'VD', rol: 'VISITANTE', autorizacion: null, activo: true },
]
