import { useNavigate } from 'react-router-dom'
import { BedDouble, ClipboardList, Shield, Stethoscope, Users } from 'lucide-react'
import UserMenu from '../components/UserMenu'
import { useAuth } from '../contexts/AuthContext'
import { canAccessAdmin } from '../utils/permissions'

export default function HistorialPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user!.rol

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Clinicks</span>
          </div>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => navigate('/pacientes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Users size={15} />
              Pacientes
            </button>
            <button
              onClick={() => navigate('/habitaciones')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BedDouble size={15} />
              Habitaciones
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50">
              <ClipboardList size={15} />
              Historial
            </button>
            {canAccessAdmin(role) && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Shield size={15} />
                Admin
              </button>
            )}
          </nav>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <ClipboardList size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial Médico</h1>
            <p className="text-sm text-gray-500">Buscá un paciente para ver su historial clínico</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Accedé al historial desde el paciente</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Para ver el historial clínico de un paciente, buscalo en la lista de pacientes y abrí su detalle.
          </p>
          <button
            onClick={() => navigate('/pacientes')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Users size={15} />
            Ir a Pacientes
          </button>
        </div>
      </main>
    </div>
  )
}
