import axios from 'axios'
import type {
  AdminUsuario,
  AuthUser,
  InvitacionRequest,
  InvitacionResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ValidarTokenResponse,
} from '../types/auth'
import { apiClient } from './apiClient'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

// Instancia pública sin interceptores de auth para login/register
const publicApi = axios.create({ baseURL: BASE })

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
}
