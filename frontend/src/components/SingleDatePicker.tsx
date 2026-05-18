import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const PANEL_H = 320

type CalView = 'day' | 'month' | 'year'

interface SingleDatePickerProps {
  value: string
  onChange: (val: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  placeholder?: string
  hasError?: boolean
  disabled?: boolean
}

export default function SingleDatePicker({
  value,
  onChange,
  onBlur,
  min,
  max,
  placeholder = 'Seleccionar fecha',
  hasError = false,
  disabled = false,
}: SingleDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [view, setView] = useState<CalView>('day')
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [yearPageStart, setYearPageStart] = useState(() =>
    Math.floor(new Date().getFullYear() / 12) * 12
  )
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const openPicker = () => {
    if (disabled) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom
      const top = spaceBelow < PANEL_H + 8 ? rect.top - PANEL_H - 4 : rect.bottom + 4
      const left = Math.min(rect.left, window.innerWidth - 276 - 8)
      setPos({ top, left })
    }
    const baseDate = value
      ? (() => { try { return new Date(value + 'T12:00:00') } catch { return new Date() } })()
      : new Date()
    const y = baseDate.getFullYear()
    setViewYear(y)
    setViewMonth(baseDate.getMonth())
    setYearPageStart(Math.floor(y / 12) * 12)
    setView('day')
    setOpen(true)
  }

  const closePicker = () => { setOpen(false); onBlur?.() }

  useEffect(() => {
    if (!open) return
    const onMouse = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) closePicker()
    }
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return
      closePicker()
    }
    document.addEventListener('mousedown', onMouse)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (dayStr: string) => { onChange(dayStr); closePicker() }
  const handleClear = () => { onChange(''); closePicker() }
  const handleToday = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    if ((!min || todayStr >= min) && (!max || todayStr <= max)) handleDayClick(todayStr)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const nowYear = new Date().getFullYear()
  const nowMonth = new Date().getMonth()

  const getDayClass = (dayStr: string) => {
    const isDisabled = (min && dayStr < min) || (max && dayStr > max)
    if (isDisabled) return 'text-gray-300 cursor-not-allowed'
    if (dayStr === value) return 'bg-blue-600 text-white rounded-full font-semibold'
    if (dayStr === todayStr) return 'text-blue-600 font-semibold hover:bg-blue-50 rounded-full cursor-pointer'
    return 'text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer'
  }

  const displayLabel = () => {
    if (!value) return ''
    try { return format(new Date(value + 'T12:00:00'), "d 'de' MMMM 'de' yyyy", { locale: es }) }
    catch { return value }
  }

  const triggerVisual = disabled
    ? 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed'
    : hasError
      ? 'w-full border border-red-400 bg-red-50/30 rounded-lg px-3 py-2 text-sm cursor-pointer'
      : 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-400'

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={open ? closePicker : openPicker}
        className={`flex items-center gap-2 text-left outline-none transition-colors ${triggerVisual}`}
      >
        <Calendar size={14} className={`flex-shrink-0 ${value ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className={`flex-1 truncate text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayLabel() || placeholder}
        </span>
        {value && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); handleClear() }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: 276, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4"
        >

          {/* ── Year view ─────────────────────────────── */}
          {view === 'year' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setYearPageStart(y => y - 12)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={14} className="text-gray-500" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  {yearPageStart} – {yearPageStart + 11}
                </span>
                <button type="button" onClick={() => setYearPageStart(y => y + 12)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 12 }, (_, i) => {
                  const year = yearPageStart + i
                  const isSel = year === viewYear
                  const isCurrent = year === nowYear
                  return (
                    <button key={year} type="button"
                      onClick={() => { setViewYear(year); setView('month') }}
                      className={`py-2 text-xs rounded-lg font-medium transition-colors ${
                        isSel ? 'bg-blue-600 text-white'
                        : isCurrent ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {year}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setView('month')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* ── Month view ────────────────────────────── */}
          {view === 'month' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setViewYear(y => y - 1)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={14} className="text-gray-500" />
                </button>
                <button type="button"
                  onClick={() => { setYearPageStart(Math.floor(viewYear / 12) * 12); setView('year') }}
                  className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                  {viewYear}
                </button>
                <button type="button" onClick={() => setViewYear(y => y + 1)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MONTH_SHORT.map((name, idx) => {
                  const isSel = idx === viewMonth
                  const isCurrent = idx === nowMonth && viewYear === nowYear
                  return (
                    <button key={idx} type="button"
                      onClick={() => { setViewMonth(idx); setView('day') }}
                      className={`py-2.5 text-xs rounded-lg font-medium transition-colors ${
                        isSel ? 'bg-blue-600 text-white'
                        : isCurrent ? 'text-blue-600 hover:bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                      {name}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setView('day')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* ── Day view ──────────────────────────────── */}
          {view === 'day' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft size={14} className="text-gray-500" />
                </button>
                <button type="button" onClick={() => setView('month')}
                  className="text-sm font-semibold text-gray-800 capitalize hover:text-blue-600 transition-colors">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </button>
                <button type="button" onClick={nextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={14} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`p${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isDisabled = (min && dayStr < min) || (max && dayStr > max)
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!!isDisabled}
                      onClick={() => { if (!isDisabled) handleDayClick(dayStr) }}
                      className={`w-8 h-8 mx-auto flex items-center justify-center text-xs transition-colors ${getDayClass(dayStr)}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Limpiar
                </button>
                <button type="button" onClick={handleToday}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
                  Hoy
                </button>
              </div>
            </>
          )}

        </div>,
        document.body
      )}
    </>
  )
}
