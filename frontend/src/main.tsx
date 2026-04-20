import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

// Sin StrictMode para evitar doble invocación de effects en desarrollo
ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </>
)
