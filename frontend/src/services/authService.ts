import axios from 'axios'
import type {
  AdminUsuario,
  AuthUser,
  CambiarDatosBasicosRequest,
  CambiarEmailRequest,
  CambiarPasswordRequest,
  InvitacionRequest,
  InvitacionResponse,
  LoginRequest,
  LoginResponse,
  PerfilResponse,
  RegisterRequest,
  ResetPasswordResponse,
  ValidarTokenResponse,
} from '../types/auth'
import { apiClient } from './apiClient'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

// Instancia pública sin interceptores de auth para login/register
export const publicApi = axios.create({ baseURL: BASE })

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    publicApi.post<LoginResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest): Promise<LoginResponse> =>
    publicApi.post<LoginResponse>('/auth/register', data).then(r => r.data),

  me: (): Promise<AuthUser> =>
    apiClient.get<AuthUser>('/auth/me').then(r => r.data),

  validarToken: (token: string): Promise<ValidarTokenResponse> =>
    publicApi.get<ValidarTokenResponse>('/auth/invitations/validate', { params: { token } }).then(r => r.data),

  crearInvitacion: (data: InvitacionRequest): Promise<InvitacionResponse> =>
    apiClient.post<InvitacionResponse>('/auth/invitations', data).then(r => r.data),

  listarInvitaciones: (): Promise<InvitacionResponse[]> =>
    apiClient.get<InvitacionResponse[]>('/auth/invitations').then(r => r.data),

  listarUsuarios: (): Promise<AdminUsuario[]> =>
    apiClient.get<AdminUsuario[]>('/admin/users').then(r => r.data),

  cambiarRol: (idUsuario: number, rol: string): Promise<AdminUsuario> =>
    apiClient.patch<AdminUsuario>(`/admin/users/${idUsuario}/role`, { rol }).then(r => r.data),

  desactivarUsuario: (idUsuario: number): Promise<AdminUsuario> =>
    apiClient.patch<AdminUsuario>(`/admin/users/${idUsuario}/disable`).then(r => r.data),

  activarUsuario: (idUsuario: number): Promise<AdminUsuario> =>
    apiClient.patch<AdminUsuario>(`/admin/users/${idUsuario}/enable`).then(r => r.data),

  resetearPassword: (idUsuario: number): Promise<ResetPasswordResponse> =>
    apiClient.patch<ResetPasswordResponse>(`/admin/users/${idUsuario}/reset-password`).then(r => r.data),

  obtenerPerfil: (): Promise<PerfilResponse> =>
    apiClient.get<PerfilResponse>('/profile').then(r => r.data),

  cambiarPassword: (data: CambiarPasswordRequest): Promise<PerfilResponse> =>
    apiClient.patch<PerfilResponse>('/profile/password', data).then(r => r.data),

  cambiarEmail: (data: CambiarEmailRequest): Promise<PerfilResponse> =>
    apiClient.patch<PerfilResponse>('/profile/email', data).then(r => r.data),

  cambiarDatosBasicos: (data: CambiarDatosBasicosRequest): Promise<PerfilResponse> =>
    apiClient.patch<PerfilResponse>('/profile/basic-data', data).then(r => r.data),
}
