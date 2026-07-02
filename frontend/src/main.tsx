import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import { isDemoMode } from './mocks/demoMode'
import './index.css'

async function bootstrap() {
  if (isDemoMode) {
    const [{ installMockInterceptors }, { apiClient }, { publicApi }] = await Promise.all([
      import('./mocks/mockAdapter'),
      import('./services/apiClient'),
      import('./services/authService'),
    ])
    installMockInterceptors(apiClient, publicApi)
  }

  // Sin StrictMode para evitar doble invocación de effects en desarrollo
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

bootstrap()
