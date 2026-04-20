import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Loader2 } from 'lucide-react'
import type { Patient, PatientRequest } from '../types/patient'
import { BLOOD_TYPES } from '../types/patient'
import { locationService, type Provincia, type Localidad, type ObraSocial } from '../services/locationService'

interface PatientFormProps {
  patient: Patient | null
  onSubmit: (data: PatientRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

const today = new Date().toISOString().split('T')[0]

type FormFields = Omit<PatientRequest, 'alergias' | 'enfermedadesCronicas' | 'antecedentesFamiliares'> & {
  idProvincia: number | ''
}

export default function PatientForm({ patient, onSubmit, onCancel, isLoading }: PatientFormProps) {
  const [alergias, setAlergias]                     = useState<string[]>([])
  const [alergiaNueva, setAlergiaNueva]             = useState('')
  const [enfermedades, setEnfermedades]             = useState<string[]>([])
  const [enfermedadNueva, setEnfermedadNueva]       = useState('')
  const [antecedentes, setAntecedentes]             = useState<string[]>([])
  const [antecedenteNuevo, setAntecedenteNuevo]     = useState('')
  const [provincias, setProvincias]                 = useState<Provincia[]>([])
  const [localidades, setLocalidades]               = useState<Localidad[]>([])
  const [obrasSociales, setObrasSociales]           = useState<ObraSocial[]>([])
  const [loadingLoc, setLoadingLoc]                 = useState(false)
  const isInitializing = useRef(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormFields>({
      defaultValues: {
        nombre: '', apellido: '', dni: '', fechaNacimiento: '', tipoSangre: '',
        telefono: '', direccion: '',
        idProvincia: '', idLocalidad: '',
        contactoEmergenciaNombre: '', contactoEmergenciaTelefono: '', contactoEmergenciaParentesco: '',
        idObraSocial: '', nombreObraSocial: '', nroAfiliado: '',
      },
    })

  const idProvinciaWatch  = watch('idProvincia')
  const idObraSocialWatch = watch('idObraSocial')

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      locationService.getProvincias(ctrl.signal),
      locationService.getObrasSociales(ctrl.signal),
    ]).then(([provs, obras]) => {
      setProvincias(provs)
      setObrasSociales(obras)
    }).catch(() => {})
    return () => ctrl.abort()
  }, [])

  useEffect(() => {
    if (!idProvinciaWatch) { setLocalidades([]); return }
    const ctrl = new AbortController()
    setLoadingLoc(true)
    locationService.getLocalidades(Number(idProvinciaWatch), ctrl.signal)
      .then(locs => {
        setLocalidades(locs)
        if (!isInitializing.current) {
          setValue('idLocalidad', '')
        }
      })
      .catch(() => {})
      .finally(() => setLoadingLoc(false))
    return () => ctrl.abort()
  }, [idProvinciaWatch, setValue])

  useEffect(() => {
    if (patient) {
      isInitializing.current = true
      reset({
        nombre: patient.nombre, apellido: patient.apellido,
        dni: patient.dni, fechaNacimiento: patient.fechaNacimiento ?? '',
        tipoSangre: patient.tipoSangre,
        telefono: patient.telefono ?? '', direccion: patient.direccion ?? '',
        idProvincia: patient.idProvincia ?? '',
        idLocalidad: patient.idLocalidad ?? '',
        contactoEmergenciaNombre: patient.contactoEmergenciaNombre ?? '',
        contactoEmergenciaTelefono: patient.contactoEmergenciaTelefono ?? '',
        contactoEmergenciaParentesco: patient.contactoEmergenciaParentesco ?? '',
        idObraSocial: patient.idObraSocial ?? '',
        nombreObraSocial: '',
        nroAfiliado: patient.nroAfiliado ?? '',
      })
      setAlergias(Array.isArray(patient.alergias) ? patient.alergias : [])
      setEnfermedades(Array.isArray(patient.enfermedadesCronicas) ? patient.enfermedadesCronicas : [])
      setAntecedentes(Array.isArray(patient.antecedentesFamiliares) ? patient.antecedentesFamiliares : [])

      if (patient.idProvincia) {
        locationService.getLocalidades(patient.idProvincia)
          .then(locs => {
            setLocalidades(locs)
            if (patient.idLocalidad) setValue('idLocalidad', patient.idLocalidad)
          })
          .catch(() => {})
          .finally(() => { isInitializing.current = false })
      } else {
        isInitializing.current = false
        setLocalidades([])
      }
    } else {
      isInitializing.current = false
      reset()
      setAlergias([])
      setEnfermedades([])
      setAntecedentes([])
      setLocalidades([])
    }
  }, [patient, reset, setValue])

  const addItem = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    resetInput: () => void,
  ) => {
    const t = value.trim()
    if (t && !list.map(x => x.toLowerCase()).includes(t.toLowerCase())) {
      setter(prev => [...prev, t])
    }
    resetInput()
  }

  const removeItem = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => prev.filter(x => x !== value))

  const handleFormSubmit = ({ idProvincia: _unused, idObraSocial, ...data }: FormFields) => {
    const finalIdObraSocial = String(idObraSocial) === 'nueva' ? '' : idObraSocial
    onSubmit({
      ...data,
      idObraSocial: finalIdObraSocial as number | '',
      alergias,
      enfermedadesCronicas: enfermedades,
      antecedentesFamiliares: antecedentes,
    })
  }

  const inputCls = (err?: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors bg-white ${
      err ? 'border-red-400 focus:ring-2 focus:ring-red-100'
          : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
    }`

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

      {/* Nombre + Apellido */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            {...register('nombre', { required: 'Obligatorio' })}
            className={inputCls(!!errors.nombre)}
            placeholder="Juan"
          />
          {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            {...register('apellido', { required: 'Obligatorio' })}
            className={inputCls(!!errors.apellido)}
            placeholder="Perez"
          />
          {errors.apellido && <p className="text-xs text-red-500 mt-1">{errors.apellido.message}</p>}
        </div>
      </div>

      {/* DNI + Fecha */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('dni', {
              required: 'Obligatorio',
              min: { value: 1000000, message: 'DNI invalido' },
              max: { value: 99999999, message: 'DNI invalido' },
            })}
            className={inputCls(!!errors.dni)}
            placeholder="12345678"
          />
          {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <input type="date" max={today}
            {...register('fechaNacimiento', { required: 'Obligatorio' })}
            className={inputCls(!!errors.fechaNacimiento)}
          />
          {errors.fechaNacimiento && <p className="text-xs text-red-500 mt-1">{errors.fechaNacimiento.message}</p>}
        </div>
      </div>

      {/* Tipo sangre + Telefono */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Sangre <span className="text-red-500">*</span>
          </label>
          <select {...register('tipoSangre', { required: 'Obligatorio' })} className={inputCls(!!errors.tipoSangre)}>
            <option value="">Seleccionar...</option>
            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
          {errors.tipoSangre && <p className="text-xs text-red-500 mt-1">{errors.tipoSangre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
          <input {...register('telefono')} className={inputCls()} placeholder="11-1234-5678" />
        </div>
      </div>

      {/* Direccion */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
        <p className="text-sm font-semibold text-blue-700">Direccion</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Provincia</label>
            <select {...register('idProvincia')} className={inputCls()}>
              <option value="">- Seleccionar provincia -</option>
              {provincias.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Localidad
              {loadingLoc && <Loader2 size={11} className="inline ml-1 animate-spin text-blue-500" />}
            </label>
            <select
              {...register('idLocalidad')}
              className={inputCls()}
              disabled={!idProvinciaWatch || loadingLoc}
            >
              <option value="">
                {!idProvinciaWatch
                  ? '- Primero elegi una provincia -'
                  : loadingLoc
                  ? 'Cargando...'
                  : '- Seleccionar localidad -'}
              </option>
              {localidades.map(l => (
                <option key={l.id} value={l.id}>{l.nombre} ({l.codigoPostal})</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Calle y Numero</label>
          <input
            {...register('direccion')}
            className={inputCls()}
            placeholder="Av. Corrientes 1234"
          />
        </div>
      </div>

      {/* Alergias */}
      <TagInput
        label="Alergias"
        colorScheme="red"
        items={alergias}
        inputValue={alergiaNueva}
        placeholder="Ej: Penicilina"
        onInputChange={setAlergiaNueva}
        onAdd={() => addItem(alergiaNueva, alergias, setAlergias, () => setAlergiaNueva(''))}
        onRemove={v => removeItem(v, setAlergias)}
        emptyText="Sin alergias registradas"
      />

      {/* Enfermedades Crónicas */}
      <TagInput
        label="Enfermedades Crónicas"
        colorScheme="amber"
        items={enfermedades}
        inputValue={enfermedadNueva}
        placeholder="Ej: Diabetes tipo 2"
        onInputChange={setEnfermedadNueva}
        onAdd={() => addItem(enfermedadNueva, enfermedades, setEnfermedades, () => setEnfermedadNueva(''))}
        onRemove={v => removeItem(v, setEnfermedades)}
        emptyText="Sin enfermedades crónicas registradas"
      />

      {/* Antecedentes Familiares */}
      <TagInput
        label="Antecedentes Familiares"
        colorScheme="purple"
        items={antecedentes}
        inputValue={antecedenteNuevo}
        placeholder="Ej: Hipertensión"
        onInputChange={setAntecedenteNuevo}
        onAdd={() => addItem(antecedenteNuevo, antecedentes, setAntecedentes, () => setAntecedenteNuevo(''))}
        onRemove={v => removeItem(v, setAntecedentes)}
        emptyText="Sin antecedentes familiares registrados"
      />

      {/* Contacto de Emergencia */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-700 mb-3">Contacto de Emergencia</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nombre Completo</label>
            <input {...register('contactoEmergenciaNombre')}
              className="w-full rounded-lg border border-yellow-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400"
              placeholder="Rosa Gonzalez" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Telefono</label>
            <input {...register('contactoEmergenciaTelefono')}
              className="w-full rounded-lg border border-yellow-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400"
              placeholder="11-9999-8888" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Parentesco</label>
            <input {...register('contactoEmergenciaParentesco')}
              className="w-full rounded-lg border border-yellow-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400"
              placeholder="Esposa" />
          </div>
        </div>
      </div>

      {/* Obra Social */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Obra Social</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Seleccionar</label>
            <select {...register('idObraSocial')} className={inputCls()}>
              <option value="">Sin obra social</option>
              {obrasSociales.map(os => (
                <option key={os.id} value={os.id}>{os.nombre}</option>
              ))}
              <option value="nueva">+ Otra (ingresar nombre)</option>
            </select>
          </div>
          {String(idObraSocialWatch) === 'nueva' ? (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nombre de la obra social</label>
              <input {...register('nombreObraSocial')}
                className={inputCls()}
                placeholder="Ej: Accord Salud" />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nro. Afiliado</label>
              <input {...register('nroAfiliado')}
                className={inputCls()}
                placeholder="OSDE-001234" />
            </div>
          )}
        </div>
        {String(idObraSocialWatch) === 'nueva' && (
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">Nro. Afiliado</label>
            <input {...register('nroAfiliado')} className={inputCls()} placeholder="Nro. de afiliado" />
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          {isLoading ? 'Guardando...' : patient ? 'Guardar Cambios' : 'Registrar Paciente'}
        </button>
      </div>
    </form>
  )
}

const colorSchemes = {
  red:    { border: 'border-red-200',    bg: 'bg-red-50',    label: 'text-red-700',    inputBorder: 'border-red-200',    inputFocus: 'focus:border-red-400 focus:ring-red-100',    tag: 'bg-red-100 text-red-700'    },
  amber:  { border: 'border-amber-200',  bg: 'bg-amber-50',  label: 'text-amber-700',  inputBorder: 'border-amber-200',  inputFocus: 'focus:border-amber-400 focus:ring-amber-100',  tag: 'bg-amber-100 text-amber-700'  },
  purple: { border: 'border-purple-200', bg: 'bg-purple-50', label: 'text-purple-700', inputBorder: 'border-purple-200', inputFocus: 'focus:border-purple-400 focus:ring-purple-100', tag: 'bg-purple-100 text-purple-700' },
}

interface TagInputProps {
  label: string
  colorScheme: keyof typeof colorSchemes
  items: string[]
  inputValue: string
  placeholder: string
  emptyText: string
  onInputChange: (v: string) => void
  onAdd: () => void
  onRemove: (v: string) => void
}

function TagInput({ label, colorScheme, items, inputValue, placeholder, emptyText, onInputChange, onAdd, onRemove }: TagInputProps) {
  const c = colorSchemes[colorScheme]
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <p className={`text-sm font-semibold ${c.label} mb-3`}>{label}</p>
      <div className="flex gap-2 mb-3">
        <input
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd() } }}
          className={`flex-1 rounded-lg border ${c.inputBorder} bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${c.inputFocus}`}
          placeholder={placeholder}
        />
        <button type="button" onClick={onAdd}
          className={`p-2 rounded-lg ${c.tag} hover:opacity-80 transition-opacity`}>
          <Plus size={18} />
        </button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item} className={`inline-flex items-center gap-1 ${c.tag} text-xs font-medium px-2.5 py-1 rounded-full`}>
              {item}
              <button type="button" onClick={() => onRemove(item)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className={`text-xs ${c.label} opacity-60`}>{emptyText}</p>
      )}
    </div>
  )
}
