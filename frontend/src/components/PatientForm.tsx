import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X, Loader2, Trash2, Info } from 'lucide-react'
import { toast } from 'sonner'
import type { EmergencyContact, Patient, PatientRequest } from '../types/patient'
import { BLOOD_TYPES } from '../types/patient'
import { locationService, type Provincia, type Localidad, type ObraSocial } from '../services/locationService'
import { patientService } from '../services/patientService'
import {
  patientSchema, TELEFONO_REGEX, SOLO_LETRAS,
  CONTACT_NOMBRE_MAX, CONTACT_PARENTESCO_MAX, CONTACT_TELEFONO_MAX,
  normalizarTelefono, esTelefonoArgentinoValido,
} from '../validations/patientSchema'
import type { PatientFormValues } from '../validations/patientSchema'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PatientFormProps {
  patient: Patient | null
  onSubmit: (data: PatientRequest) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0]

// ─── Teclas siempre permitidas (navegación y edición) ────────────────────────

const ALLOWED_KEYS = [
  'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Tab', 'Enter', 'Home', 'End',
]

function blockNonDigits(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey) return
  if (!ALLOWED_KEYS.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
}

function blockInvalidPhone(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey) return
  if (!ALLOWED_KEYS.includes(e.key) && !/^[\d\s\-()+.]$/.test(e.key)) e.preventDefault()
}

function blockInvalidAfiliado(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey) return
  if (!ALLOWED_KEYS.includes(e.key) && !/^[a-zA-Z0-9]$/.test(e.key)) e.preventDefault()
}

function blockNonLetters(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey) return
  if (!ALLOWED_KEYS.includes(e.key) && !/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]$/.test(e.key)) e.preventDefault()
}

const DEFAULT_VALUES: Partial<PatientFormValues> = {
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  tipoSangre: undefined,
  telefono: '',
  tipoTelefono: 'personal',
  direccion: '',
  piso: undefined,
  tipoResidencia: 'permanente',
  idProvincia: undefined,
  idLocalidad: undefined,
  idObraSocial: '',
  nombreObraSocial: '',
  nroAfiliado: '',
  fechaVencimientoAfiliacion: '',
  antecedentesText: '',
}

// ─── Helpers de estilo ────────────────────────────────────────────────────────

const cls = (...parts: string[]) => parts.filter(Boolean).join(' ')

const inputBase =
  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors bg-white'

const inputOk = 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
const inputErr = 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100'

function inputCls(hasError?: boolean) {
  return cls(inputBase, hasError ? inputErr : inputOk)
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 flex items-center gap-1 text-xs text-red-600">{msg}</p>
}

function UniqueHint({ text }: { text: string }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-blue-500">
      <Info size={11} />
      {text}
    </p>
  )
}

// ─── Validación de contactos de emergencia ────────────────────────────────────

function validateContactos(list: EmergencyContact[], patientPhone: string): Record<string, string> {
  const errs: Record<string, string> = {}
  const patientNorm = normalizarTelefono(patientPhone)
  const seenPhones = new Set<string>()

  list.forEach((c, i) => {
    if (!c.nombre.trim()) {
      errs[`${i}_nombre`] = 'El nombre es obligatorio'
    } else if (!SOLO_LETRAS.test(c.nombre.trim())) {
      errs[`${i}_nombre`] = 'Solo se permiten letras y espacios'
    } else if (c.nombre.trim().length > CONTACT_NOMBRE_MAX) {
      errs[`${i}_nombre`] = `Máximo ${CONTACT_NOMBRE_MAX} caracteres`
    }

    if (!c.telefono.trim()) {
      errs[`${i}_telefono`] = 'El teléfono es obligatorio'
    } else if (c.telefono.trim().length > CONTACT_TELEFONO_MAX) {
      errs[`${i}_telefono`] = `Máximo ${CONTACT_TELEFONO_MAX} caracteres`
    } else if (!TELEFONO_REGEX.test(c.telefono)) {
      errs[`${i}_telefono`] = 'Solo números, espacios, guiones o paréntesis'
    } else if (!esTelefonoArgentinoValido(c.telefono)) {
      errs[`${i}_telefono`] = 'Formato argentino inválido (ej: 1123456789 ó 5491123456789)'
    } else {
      const norm = normalizarTelefono(c.telefono)
      if (patientNorm && norm === patientNorm) {
        errs[`${i}_telefono`] = 'No puede ser igual al teléfono del paciente'
      } else if (seenPhones.has(norm)) {
        errs[`${i}_telefono`] = 'Este número ya figura en otro contacto de emergencia'
      }
      seenPhones.add(norm)
    }

    if (!c.parentesco.trim()) {
      errs[`${i}_parentesco`] = 'El parentesco es obligatorio'
    } else if (c.parentesco.trim().length > CONTACT_PARENTESCO_MAX) {
      errs[`${i}_parentesco`] = `Máximo ${CONTACT_PARENTESCO_MAX} caracteres`
    }
  })
  return errs
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PatientForm({ patient, onSubmit, onCancel, isLoading }: PatientFormProps) {
  // Arrays gestionados fuera de react-hook-form (tags + contactos)
  const [alergias, setAlergias] = useState<string[]>([])
  const [alergiaNueva, setAlergiaNueva] = useState('')
  const [enfermedades, setEnfermedades] = useState<string[]>([])
  const [enfermedadNueva, setEnfermedadNueva] = useState('')
  const [antecedentes, setAntecedentes] = useState<string[]>([])
  const [antecedenteNuevo, setAntecedenteNuevo] = useState('')

  const [contactos, setContactos] = useState<EmergencyContact[]>([])
  const [contactosErr, setContactosErr] = useState<Record<string, string>>({})

  // Listas de selección (carga asíncrona)
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [localidades, setLocalidades] = useState<Localidad[]>([])
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [loadingLoc, setLoadingLoc] = useState(false)

  // Validación de unicidad de DNI (async)
  const [dniExists, setDniExists] = useState(false)
  const [checkingDni, setCheckingDni] = useState(false)

  // Validación de unicidad de Nro Afiliado
  const [afiliadoExists, setAfiliadoExists] = useState(false)
  const [checkingAfiliado, setCheckingAfiliado] = useState(false)

  const isInitializing = useRef(false)

  // ── react-hook-form con zodResolver ─────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitted },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as any,
    mode: 'onTouched',   // muestra errores después del primer blur; isValid se actualiza siempre
    defaultValues: DEFAULT_VALUES as any,
  })

  const idProvinciaWatch = watch('idProvincia')
  const idLocalidadWatch = watch('idLocalidad')
  const idObraSocialWatch = watch('idObraSocial')
  const nombreObraSocialWatch = watch('nombreObraSocial')
  const nroAfiliadoWatch = watch('nroAfiliado')
  const dniWatch = watch('dni')
  const telefonoWatch = watch('telefono')

  // ── Carga inicial de provincias y obras sociales ─────────────────────────────

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      locationService.getProvincias(ctrl.signal),
      locationService.getObrasSociales(ctrl.signal),
    ]).then(([provs, obras]) => {
      setProvincias(provs)
      setObrasSociales(obras)
      // Aseguramos pre-selección por carga asíncrona de las options en DOM
      if (patient) {
        if (patient.idProvincia) setValue('idProvincia', String(patient.idProvincia) as any)
        if (patient.idObraSocial) setValue('idObraSocial', String(patient.idObraSocial) as any)
      }
    }).catch(() => { })
    return () => ctrl.abort()
  }, [patient, setValue])

  // ── Cascading provincia → localidades ────────────────────────────────────────

  useEffect(() => {
    if (!idProvinciaWatch) { setLocalidades([]); return }
    const ctrl = new AbortController()
    setLoadingLoc(true)
    locationService.getLocalidades(Number(idProvinciaWatch), ctrl.signal)
      .then(locs => {
        setLocalidades(locs)
        if (isInitializing.current && patient?.idLocalidad) {
          // El paciente ya traía localidad: la pre-seleccionamos una vez cargada la lista
          setValue('idLocalidad', String(patient.idLocalidad) as any, { shouldValidate: true })
          isInitializing.current = false
        } else {
          // Cambio manual de provincia por el usuario: reiniciamos localidad
          setValue('idLocalidad', '' as any)
        }
      })
      .catch(() => { })
      .finally(() => setLoadingLoc(false))
    return () => ctrl.abort()
  }, [idProvinciaWatch, patient, setValue])

  // ── Poblar formulario al editar ──────────────────────────────────────────────

  useEffect(() => {
    if (patient) {
      isInitializing.current = true
      reset({
        nombre: patient.nombre,
        apellido: patient.apellido,
        dni: patient.dni as any,
        fechaNacimiento: patient.fechaNacimiento ?? '',
        tipoSangre: patient.tipoSangre as any,
        telefono: patient.telefono ?? '',
        tipoTelefono: (patient.tipoTelefono ?? 'personal') as any,
        direccion: patient.direccion ?? '',
        numeroDireccion: (patient.numeroDireccion ?? undefined) as any,
        piso: (patient.piso ?? undefined) as any,
        tipoResidencia: (patient.tipoResidencia ?? 'permanente') as any,
        idProvincia: patient.idProvincia ? String(patient.idProvincia) as any : '',
        idLocalidad: patient.idLocalidad ? String(patient.idLocalidad) as any : '',
        idObraSocial: patient.idObraSocial ? String(patient.idObraSocial) as any : '',
        nombreObraSocial: '',
        nroAfiliado: patient.nroAfiliado ?? '',
        fechaVencimientoAfiliacion: patient.fechaVencimientoAfiliacion ?? '',
        antecedentesText: patient.antecedentesText ?? '',
      })
      setAlergias(Array.isArray(patient.alergias) ? patient.alergias : [])
      setEnfermedades(Array.isArray(patient.enfermedadesCronicas) ? patient.enfermedadesCronicas : [])
      setAntecedentes(Array.isArray(patient.antecedentesFamiliares) ? patient.antecedentesFamiliares : [])
      setContactos(Array.isArray(patient.contactosEmergencia) ? patient.contactosEmergencia : [])
    } else {
      isInitializing.current = false
      reset(DEFAULT_VALUES as any)
      setAlergias([]); setEnfermedades([]); setAntecedentes([])
      setContactos([]); setLocalidades([])
      setDniExists(false)
    }
  }, [patient, reset])

  // ── Verificación de unicidad de DNI ──────────────────────────────────────────

  const handleDniBlur = async () => {
    const dni = Number(dniWatch)
    if (!dni || dni < 1_000_000 || dni > 99_999_999) { setDniExists(false); return }
    setCheckingDni(true)
    try {
      const existe = await patientService.checkDni(dni, patient?.id)
      setDniExists(existe)
    } catch {
      setDniExists(false)
    } finally {
      setCheckingDni(false)
    }
  }

  // ── Verificación de unicidad de Nro Afiliado ─────────────────────────────────

  const handleAfiliadoBlur = async () => {
    if (!nroAfiliadoWatch || !nroAfiliadoWatch.trim() || !idObraSocialWatch || idObraSocialWatch === '') {
      setAfiliadoExists(false)
      return
    }
    
    setCheckingAfiliado(true)
    try {
      const idObra = idObraSocialWatch === 'nueva' ? undefined : Number(idObraSocialWatch)
      const nombreObra = idObraSocialWatch === 'nueva' ? nombreObraSocialWatch : undefined
      
      const existe = await patientService.checkAfiliado(nroAfiliadoWatch, idObra, nombreObra, patient?.id)
      setAfiliadoExists(existe)
    } catch {
      setAfiliadoExists(false)
    } finally {
      setCheckingAfiliado(false)
    }
  }

  useEffect(() => {
    // Si ya hay un nroAfiliado, re-chequear si cambia la obra social
    if (nroAfiliadoWatch && nroAfiliadoWatch.trim() !== '') {
      handleAfiliadoBlur()
    }
  }, [idObraSocialWatch, nombreObraSocialWatch])

  // ── Tag lists helpers ────────────────────────────────────────────────────────

  const addItem = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    reset: () => void,
  ) => {
    const t = value.trim()
    if (t && !list.map(x => x.toLowerCase()).includes(t.toLowerCase())) setter(prev => [...prev, t])
    reset()
  }

  const removeItem = (val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter(prev => prev.filter(x => x !== val))

  // ── Contactos helpers ────────────────────────────────────────────────────────

  const canAddContacto = () => {
    if (contactos.length === 0) return true
    const last = contactos[contactos.length - 1]
    return last.nombre.trim() !== '' && last.telefono.trim() !== '' && last.parentesco.trim() !== ''
  }

  const addContacto = () => {
    if (canAddContacto()) {
      setContactos(prev => [...prev, { nombre: '', telefono: '', parentesco: '' }])
    }
  }

  const updateContacto = (idx: number, field: keyof EmergencyContact, value: string) => {
    setContactos(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
    const key = `${idx}_${field}`
    setContactosErr(prev => {
      const next = { ...prev }
      if (field === 'telefono') {
        const norm = normalizarTelefono(value)
        const patientNorm = normalizarTelefono(telefonoWatch ?? '')
        if (value && !TELEFONO_REGEX.test(value)) {
          next[key] = 'Solo números, espacios, guiones o paréntesis'
        } else if (value && !esTelefonoArgentinoValido(value)) {
          next[key] = 'Formato argentino inválido (ej: 1123456789)'
        } else if (value && patientNorm && norm === patientNorm) {
          next[key] = 'No puede ser igual al teléfono del paciente'
        } else {
          delete next[key]
        }
      } else {
        delete next[key]
      }
      return next
    })
  }

  const removeContacto = (idx: number) => {
    setContactos(prev => prev.filter((_, i) => i !== idx))
    setContactosErr(prev => {
      const next: Record<string, string> = {}
      Object.entries(prev).forEach(([k, v]) => {
        const sep = k.indexOf('_')
        const ki = Number(k.substring(0, sep))
        const field = k.substring(sep + 1)
        if (ki < idx) next[k] = v
        else if (ki > idx) next[`${ki - 1}_${field}`] = v
      })
      return next
    })
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onInvalidSubmit = () => {
    toast.error('Corregí los errores del formulario antes de continuar')
  }

  const handleFormSubmit = (data: PatientFormValues) => {
    const contactErrors = validateContactos(contactos, data.telefono ?? '')

    if (Object.keys(contactErrors).length > 0) {
      setContactosErr(contactErrors)
      toast.error('Revisá los datos de los contactos de emergencia')
      return
    }
    if (dniExists) {
      toast.error('El DNI ingresado ya está registrado en el sistema')
      return
    }
    if (afiliadoExists) {
      toast.error('El número de afiliado ya está registrado para esta Obra Social')
      return
    }

    const idObraSocial = data.idObraSocial === 'nueva' ? '' : data.idObraSocial

    // Convertir idObraSocial: string → number | '' (el servicio sanitiza)
    const parsedIdOS: number | '' =
      data.idObraSocial === '' || data.idObraSocial === 'nueva'
        ? ''
        : (Number(data.idObraSocial) as number)

    onSubmit({
      nombre: data.nombre,
      apellido: data.apellido,
      dni: data.dni,
      fechaNacimiento: data.fechaNacimiento,
      tipoSangre: data.tipoSangre,
      alergias,
      enfermedadesCronicas: enfermedades,
      antecedentesFamiliares: antecedentes,
      antecedentesText: data.antecedentesText ?? '',
      telefono: data.telefono ?? '',
      tipoTelefono: data.tipoTelefono,
      direccion: data.direccion,
      numeroDireccion: (data.numeroDireccion ?? '') as number | '',
      piso: (data.piso ?? '') as number | '',
      tipoResidencia: data.tipoResidencia,
      idLocalidad: data.idLocalidad,
      idObraSocial: parsedIdOS,
      nombreObraSocial: data.nombreObraSocial ?? '',
      nroAfiliado: data.nroAfiliado ?? '',
      fechaVencimientoAfiliacion: data.fechaVencimientoAfiliacion ?? '',
      contactosEmergencia: contactos,
    })
  }

  // El botón 'Guardar Cambios' debe estar siempre habilitado para el clic.
  // Las validaciones se ejecutarán al hacer submit o onChange.
  const submitDisabled = isLoading || checkingDni || checkingAfiliado

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, onInvalidSubmit)} noValidate className="space-y-5">

      {/* ── Nombre + Apellido ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            {...register('nombre')}
            className={inputCls(!!errors.nombre)}
            placeholder="Juan"
            autoComplete="given-name"
          />
          <FieldError msg={errors.nombre?.message} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            {...register('apellido')}
            className={inputCls(!!errors.apellido)}
            placeholder="Pérez"
            autoComplete="family-name"
          />
          <FieldError msg={errors.apellido?.message} />
        </div>
      </div>

      {/* ── DNI + Fecha de Nacimiento ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              {...register('dni')}
              onBlur={handleDniBlur}
              onKeyDown={blockNonDigits}
              maxLength={8}
              className={inputCls(!!(errors.dni || dniExists))}
              placeholder="12345678"
            />
            {checkingDni && (
              <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-400" />
            )}
          </div>
          <FieldError msg={errors.dni?.message} />
          {!errors.dni && dniExists && (
            <p className="mt-1 text-xs text-red-600">Este DNI ya está registrado en el sistema</p>
          )}
          {!errors.dni && !dniExists && (
            <UniqueHint text="El DNI debe ser único en el sistema" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            max={today}
            {...register('fechaNacimiento')}
            className={inputCls(!!errors.fechaNacimiento)}
          />
          <FieldError msg={errors.fechaNacimiento?.message} />
        </div>
      </div>

      {/* ── Tipo de Sangre ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Sangre <span className="text-red-500">*</span>
          </label>
          <select {...register('tipoSangre')} className={inputCls(!!errors.tipoSangre)}>
            <option value="">Seleccionar...</option>
            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
          <FieldError msg={errors.tipoSangre?.message} />
        </div>
      </div>

      {/* ── Teléfono ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Teléfono</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Número</label>
            <input
              {...register('telefono')}
              onKeyDown={blockInvalidPhone}
              maxLength={25}
              className={inputCls(!!errors.telefono)}
              placeholder="11-1234-5678"
              inputMode="tel"
            />
            <FieldError msg={errors.telefono?.message} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tipo de Teléfono</label>
            <select {...register('tipoTelefono')} className={inputCls(!!errors.tipoTelefono)}>
              <option value="personal">Personal</option>
              <option value="emergencia">Emergencia</option>
            </select>
            <FieldError msg={errors.tipoTelefono?.message} />
          </div>
        </div>
      </div>

      {/* ── Dirección ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
        <p className="text-sm font-semibold text-blue-700">
          Dirección <span className="text-red-500">*</span>
        </p>

        {/* Provincia + Localidad */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Provincia</label>
            <select {...register('idProvincia')} value={idProvinciaWatch || ''} className={inputCls()}>
              <option value="">- Seleccionar provincia -</option>
              {provincias.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Localidad <span className="text-red-500">*</span>
              {loadingLoc && <Loader2 size={11} className="inline ml-1 animate-spin text-blue-500" />}
            </label>
            <select
              {...register('idLocalidad')}
              value={idLocalidadWatch || ''}
              className={inputCls(!!errors.idLocalidad)}
              disabled={!idProvinciaWatch || loadingLoc}
            >
              <option value="">
                {!idProvinciaWatch
                  ? '- Primero elegí una provincia -'
                  : loadingLoc
                    ? 'Cargando...'
                    : '- Seleccionar localidad -'}
              </option>
              {localidades.map(l => (
                <option key={l.id} value={l.id}>{l.nombre} ({l.codigoPostal})</option>
              ))}
            </select>
            <FieldError msg={errors.idLocalidad?.message} />
          </div>
        </div>

        {/* Calle + Número + Piso */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">
              Calle <span className="text-red-500">*</span>
            </label>
            <input
              {...register('direccion')}
              className={inputCls(!!errors.direccion)}
              placeholder="Av. Corrientes"
            />
            <FieldError msg={errors.direccion?.message} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register('numeroDireccion')}
              className={inputCls(!!errors.numeroDireccion)}
              placeholder="1234"
            />
            <FieldError msg={errors.numeroDireccion?.message} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Piso (opcional)</label>
            <input
              type="number"
              min={0}
              {...register('piso')}
              className={inputCls(!!errors.piso)}
              placeholder="3"
            />
            <FieldError msg={errors.piso?.message} />
          </div>
        </div>

        {/* Tipo de Residencia */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Tipo de Residencia <span className="text-red-500">*</span>
          </label>
          <select {...register('tipoResidencia')} className={inputCls(!!errors.tipoResidencia)}>
            <option value="permanente">Permanente</option>
            <option value="transitorio">Transitorio</option>
          </select>
          <FieldError msg={errors.tipoResidencia?.message} />
        </div>
      </div>

      {/* ── Alergias ──────────────────────────────────────────────────────── */}
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

      {/* ── Enfermedades Crónicas ─────────────────────────────────────────── */}
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

      {/* ── Antecedentes Familiares ───────────────────────────────────────── */}
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

      {/* ── Observaciones (texto libre antecedentes) ──────────────────────── */}
      <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
        <label className="block text-sm font-semibold text-purple-700 mb-2">
          Observaciones — Antecedentes Familiares
        </label>
        <textarea
          {...register('antecedentesText')}
          rows={3}
          className={cls(
            'w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none resize-none transition-colors',
            errors.antecedentesText
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100',
          )}
          placeholder="Descripción libre de antecedentes familiares relevantes..."
        />
        <FieldError msg={errors.antecedentesText?.message} />
      </div>

      {/* ── Contactos de Emergencia (múltiples) ───────────────────────────── */}
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-yellow-700">Contactos de Emergencia</p>
          <button
            type="button"
            onClick={addContacto}
            disabled={!canAddContacto()}
            className={cls(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
              canAddContacto()
                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                : 'text-yellow-400 bg-yellow-50 cursor-not-allowed opacity-50'
            )}
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>

        {contactos.length === 0 && (
          <p className="text-xs text-yellow-600 opacity-70">Sin contactos de emergencia registrados</p>
        )}

        {contactos.map((contacto, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-yellow-200 p-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-yellow-700">Contacto {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeContacto(idx)}
                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre Completo</label>
                <input
                  value={contacto.nombre}
                  onChange={e => updateContacto(idx, 'nombre', e.target.value)}
                  onKeyDown={blockNonLetters}
                  maxLength={CONTACT_NOMBRE_MAX}
                  className={cls(
                    'w-full rounded-lg border px-2 py-1.5 text-sm outline-none bg-yellow-50/50',
                    contactosErr[`${idx}_nombre`]
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-yellow-200 focus:border-yellow-400',
                  )}
                  placeholder="Rosa González"
                />
                {contactosErr[`${idx}_nombre`] && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1"><Info size={10} /> {contactosErr[`${idx}_nombre`]}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                <input
                  value={contacto.telefono}
                  onChange={e => updateContacto(idx, 'telefono', e.target.value)}
                  onKeyDown={blockInvalidPhone}
                  inputMode="tel"
                  maxLength={CONTACT_TELEFONO_MAX}
                  className={cls(
                    'w-full rounded-lg border px-2 py-1.5 text-sm outline-none bg-yellow-50/50',
                    contactosErr[`${idx}_telefono`]
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-yellow-200 focus:border-yellow-400',
                  )}
                  placeholder="11-9999-8888"
                />
                {contactosErr[`${idx}_telefono`] && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1"><Info size={10} /> {contactosErr[`${idx}_telefono`]}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Parentesco</label>
                <input
                  value={contacto.parentesco}
                  onChange={e => updateContacto(idx, 'parentesco', e.target.value)}
                  onKeyDown={blockNonLetters}
                  maxLength={CONTACT_PARENTESCO_MAX}
                  className={cls(
                    'w-full rounded-lg border px-2 py-1.5 text-sm outline-none bg-yellow-50/50',
                    contactosErr[`${idx}_parentesco`]
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-yellow-200 focus:border-yellow-400',
                  )}
                  placeholder="Esposa"
                />
                {contactosErr[`${idx}_parentesco`] && (
                  <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1"><Info size={10} /> {contactosErr[`${idx}_parentesco`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Obra Social ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Obra Social</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Seleccionar</label>
            <select {...register('idObraSocial')} value={idObraSocialWatch || ''} className={inputCls()}>
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
              <input
                {...register('nombreObraSocial')}
                className={inputCls(!!errors.nombreObraSocial)}
                placeholder="Ej: Accord Salud"
              />
              <FieldError msg={errors.nombreObraSocial?.message} />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Nro. Afiliado
                {idObraSocialWatch && idObraSocialWatch !== '' && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <div className="relative">
                <input
                  {...register('nroAfiliado')}
                  onBlur={handleAfiliadoBlur}
                  onKeyDown={blockInvalidAfiliado}
                  maxLength={20}
                  className={inputCls(!!(errors.nroAfiliado || afiliadoExists))}
                  placeholder="OSDE-001234"
                />
                {checkingAfiliado && (
                  <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-400" />
                )}
              </div>
              <FieldError msg={errors.nroAfiliado?.message} />
              {!errors.nroAfiliado && afiliadoExists && (
                <p className="mt-1 text-xs text-red-600">Este Nro. ya está registrado para esta Obra Social</p>
              )}
              {!errors.nroAfiliado && !afiliadoExists && (
                <UniqueHint text="El Nro. de Afiliado debe ser único por Obra Social" />
              )}
            </div>
          )}
        </div>

        {/* Nro. Afiliado para nueva obra social */}
        {String(idObraSocialWatch) === 'nueva' && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nro. Afiliado</label>
            <div className="relative">
              <input
                {...register('nroAfiliado')}
                onBlur={handleAfiliadoBlur}
                onKeyDown={blockInvalidAfiliado}
                maxLength={50}
                className={inputCls(!!(errors.nroAfiliado || afiliadoExists))}
                placeholder="Nro. de afiliado"
              />
              {checkingAfiliado && (
                <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-400" />
              )}
            </div>
            <FieldError msg={errors.nroAfiliado?.message} />
            {!errors.nroAfiliado && afiliadoExists && (
              <p className="mt-1 text-xs text-red-600">Este Nro. ya está registrado para esta Obra Social</p>
            )}
            {!errors.nroAfiliado && !afiliadoExists && (
              <UniqueHint text="El Nro. de Afiliado debe ser único por Obra Social" />
            )}
          </div>
        )}

        {/* Fecha de vencimiento */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Fecha de Vencimiento de la Afiliación</label>
          <input
            type="date"
            min={today}
            {...register('fechaVencimientoAfiliacion')}
            className={inputCls(!!errors.fechaVencimientoAfiliacion)}
          />
          <FieldError msg={errors.fechaVencimientoAfiliacion?.message} />
        </div>
      </div>

      {/* ── Resumen de errores (tras intento de envío con errores) ─────────── */}
      {(isSubmitted && !isValid) || Object.keys(contactosErr).length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold mb-1">Corregí los errores antes de continuar.</p>
          <p className="text-xs text-red-500">
            {!isValid && 'Los campos obligatorios están indicados con * o hay valores incorrectos. '}
            {Object.keys(contactosErr).length > 0 && 'Revisá los contactos de emergencia.'}
          </p>
        </div>
      ) : null}

      {/* ── Acciones ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitDisabled}
          className={cls(
            'px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors flex items-center gap-2',
            submitDisabled
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700',
          )}
        >
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          {isLoading ? 'Guardando...' : patient ? 'Guardar Cambios' : 'Registrar Paciente'}
        </button>
      </div>
    </form>
  )
}

// ─── TagInput ─────────────────────────────────────────────────────────────────

const colorSchemes = {
  red: { border: 'border-red-200', bg: 'bg-red-50', label: 'text-red-700', inputBorder: 'border-red-200', inputFocus: 'focus:border-red-400 focus:ring-red-100', tag: 'bg-red-100 text-red-700' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', label: 'text-amber-700', inputBorder: 'border-amber-200', inputFocus: 'focus:border-amber-400 focus:ring-amber-100', tag: 'bg-amber-100 text-amber-700' },
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
        <button
          type="button"
          onClick={onAdd}
          className={`p-2 rounded-lg ${c.tag} hover:opacity-80 transition-opacity`}
        >
          <Plus size={18} />
        </button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span
              key={item}
              className={`inline-flex items-center gap-1 ${c.tag} text-xs font-medium px-2.5 py-1 rounded-full`}
            >
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
