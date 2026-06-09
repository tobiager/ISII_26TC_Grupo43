export type Rol = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'MEDICO' | 'ENFERMERO'

export interface AuthUser {
  idUsuario: number
  email: string
  nombre: string
  apellido: string
  nombreCompleto: string
  iniciales: string
  rol: Rol
  autorizacion: string | null
  mustChangePassword?: boolean
  esAdminProtegido?: boolean
}

export interface PerfilResponse {
  idUsuario: number
  email: string
  nombre: string
  apellido: string
  rol: string
  autorizacion: string | null
  mustChangePassword: boolean
  esAdminProtegido: boolean
}

export interface ResetPasswordResponse {
  message: string
  temporaryPassword: string
}

export interface CambiarPasswordRequest {
  passwordActual: string
  nuevaPassword: string
}

export interface CambiarEmailRequest {
  nuevoEmail: string
  passwordActual: string
}

export interface CambiarDatosBasicosRequest {
  nombre: string
  apellido: string
  fechaNacimiento?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  usuario: AuthUser
}

export interface RegisterRequest {
  token: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  password: string
}

export interface InvitacionRequest {
  email: string
  rol: Rol
  fechaExpiracion?: string
}

export interface InvitacionResponse {
  idInvitacion: number
  email: string
  rol: Rol
  invitationLink: string
  fechaCreacion: string
  fechaExpiracion: string
  fechaUso: string | null
  usada: boolean
  vencida: boolean
}

export interface AdminUsuario {
  idUsuario: number
  email: string
  nombre: string
  apellido: string
  nombreCompleto: string
  iniciales: string
  rol: Rol
  autorizacion: string | null
  activo: boolean
}

export interface ValidarTokenResponse {
  email: string
  rol: Rol
}
