import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
  id?: string
  name?: string
  onBlur?: () => void
  searchable?: boolean
}

const PANEL_MAX_H = 240

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className,
  hasError = false,
  id,
  name,
  onBlur,
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const openDrop = () => {
    if (disabled) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom
      const top = spaceBelow < PANEL_MAX_H + 8 ? rect.top - PANEL_MAX_H - 4 : rect.bottom + 4
      const left = Math.min(rect.left, window.innerWidth - rect.width - 8)
      setPos({ top, left, width: rect.width })
    }
    setOpen(true)
  }

  const closeDrop = () => { 
    setOpen(false)
    setSearchQuery('')
    onBlur?.() 
  }

  useEffect(() => {
    if (!open) return
    const onMouse = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) closeDrop()
    }
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return
      closeDrop()
    }
    document.addEventListener('mousedown', onMouse)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); if (!open) openDrop() }
    if (e.key === 'Escape') closeDrop()
  }

  const defaultVisual = disabled
    ? 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 cursor-not-allowed'
    : hasError
      ? 'w-full border border-red-400 bg-red-50/30 rounded-lg px-3 py-2 text-sm cursor-pointer'
      : 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:ring-2 focus:ring-blue-100 focus:border-blue-400'

  const triggerClass = `flex items-center justify-between gap-2 text-left outline-none transition-colors ${className ?? defaultVisual}`

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={open ? closeDrop : openDrop}
        onKeyDown={handleKeyDown}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`flex-1 truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
        />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          role="listbox"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxHeight: PANEL_MAX_H,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto"
        >
          {searchable && (
            <div className="p-2 pb-2 sticky top-0 bg-white z-10 border-b border-gray-100">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => {
                  if (e.key === 'Escape') closeDrop()
                  e.stopPropagation()
                }}
                className="w-full text-sm px-3 py-2 outline-none rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                autoFocus
              />
            </div>
          )}
          <div className="py-1">
          {(searchable ? options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase())) : options).map(opt => {
            const isSel = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSel}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                  isSel ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSel && <Check size={13} className="flex-shrink-0" />}
              </button>
            )
          })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
