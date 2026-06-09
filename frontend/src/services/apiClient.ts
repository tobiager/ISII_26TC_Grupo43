import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export const apiClient = axios.create({ baseURL: BASE })

// Adjunta el token JWT en cada request si está disponible
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('clinicks_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// En 401 limpia el estado y redirige al login
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('clinicks_token')
      localStorage.removeItem('clinicks_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
