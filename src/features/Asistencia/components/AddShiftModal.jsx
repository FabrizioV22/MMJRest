import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Calendar, Plus, Loader2, Sparkles, Clock, Check } from 'lucide-react'

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
  { id: 0, label: 'Domingo', short: 'Dom' }
]

const PRESET_TEMPLATES = [
  { label: '☀️ Mañana (08:00 - 16:30)', ingreso: '08:00', salida: '16:30', tol: 10 },
  { label: '🌙 Noche (15:30 - 23:30)', ingreso: '15:30', salida: '23:30', tol: 10 },
  { label: '⏱️ Part-Time (12:00 - 16:30)', ingreso: '12:00', salida: '16:30', tol: 10 },
  { label: '👨‍🍳 Cocina (07:30 - 16:00)', ingreso: '07:30', salida: '16:00', tol: 5 }
]

export function AddShiftModal({
  isOpen,
  onClose,
  users = [],
  activeSede,
  onSave,
  isSubmitting = false
}) {
  const [selectedUser, setSelectedUser] = useState('ALL')
  const [horaIngreso, setHoraIngreso] = useState('08:00')
  const [horaSalida, setHoraSalida] = useState('16:30')
  const [tolerancia, setTolerancia] = useState(10)
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5, 6]) // Lun-Sáb por defecto
  const [activeTemplate, setActiveTemplate] = useState('☀️ Mañana (08:00 - 16:30)')

  if (!isOpen) return null

  const applyTemplate = (tpl) => {
    setHoraIngreso(tpl.ingreso)
    setHoraSalida(tpl.salida)
    setTolerancia(tpl.tol)
    setActiveTemplate(tpl.label)
  }

  const toggleDay = (dayId) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    )
  }

  const selectDayRange = (days) => {
    setSelectedDays(days)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedDays.length === 0) return

    const targetUserIds = selectedUser === 'ALL' ? users.map(u => u.id) : [selectedUser]
    const payloads = []

    targetUserIds.forEach(uid => {
      selectedDays.forEach(dia => {
        payloads.push({
          usuario_id: uid,
          sede_id: activeSede?.id,
          dia_semana: dia,
          hora_ingreso: `${horaIngreso}:00`,
          hora_salida: `${horaSalida}:00`,
          tolerancia_minutos: Number(tolerancia) || 10,
          activo: true
        })
      })
    })

    onSave(payloads)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E9DFD9] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col my-auto max-h-[92dvh]">
        
        {/* Header Limpio */}
        <div className="p-4 sm:p-5 border-b border-[#E9DFD9] bg-[#FAF7F4] flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-50 text-[#A80F14] rounded-xl border border-rose-200">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C211F]">Asignar Horario Semanal</h3>
              <p className="text-[11px] text-[#877571]">Sede: <strong className="text-[#A80F14]">{activeSede?.nombre || 'General'}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#877571] hover:bg-black/5 rounded-full cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario Ágil */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* 1. Colaborador */}
          <div>
            <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-1.5">
              1. Colaborador Destino
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-semibold text-[#2C211F] outline-none cursor-pointer"
            >
              {users.length > 0 && (
                <option value="ALL">👥 Toda la sede ({users.length} colaboradores)</option>
              )}
              <optgroup label="Colaborador Individual">
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo || u.id} ({u.roles?.[0] || 'Personal'})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Plantillas de Turno Rápidas */}
          <div>
            <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Sparkles size={13} className="text-amber-600" />
              <span>2. Selecciona Turno o Horario</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_TEMPLATES.map(tpl => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold cursor-pointer transition-all ${
                    activeTemplate === tpl.label
                      ? 'bg-rose-50 border-[#A80F14] text-[#A80F14] shadow-xs'
                      : 'bg-[#FAF7F4] border-[#D8CBC5] text-[#5D4B47] hover:bg-white'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Inputs de Horas */}
            <div className="grid grid-cols-3 gap-2 mt-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#877571] uppercase mb-1">Ingreso</label>
                <input
                  type="time"
                  value={horaIngreso}
                  onChange={(e) => {
                    setHoraIngreso(e.target.value)
                    setActiveTemplate('Personalizado')
                  }}
                  required
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-bold text-[#2C211F] outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#877571] uppercase mb-1">Salida</label>
                <input
                  type="time"
                  value={horaSalida}
                  onChange={(e) => {
                    setHoraSalida(e.target.value)
                    setActiveTemplate('Personalizado')
                  }}
                  required
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-bold text-[#2C211F] outline-none text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#877571] uppercase mb-1">Tolerancia</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={tolerancia}
                  onChange={(e) => setTolerancia(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-bold text-[#2C211F] outline-none text-center"
                />
              </div>
            </div>
          </div>

          {/* 3. Días de la semana */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">
                3. Días aplicables ({selectedDays.length})
              </label>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#A80F14]">
                <button type="button" onClick={() => selectDayRange([1, 2, 3, 4, 5, 6])} className="hover:underline">Lun-Sáb</button>
                <span>•</span>
                <button type="button" onClick={() => selectDayRange([1, 2, 3, 4, 5])} className="hover:underline">Lun-Vie</button>
                <span>•</span>
                <button type="button" onClick={() => selectDayRange([0, 1, 2, 3, 4, 5, 6])} className="hover:underline">Todos</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {DIAS_SEMANA.map(d => {
                const isSelected = selectedDays.includes(d.id)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#A80F14] text-white border-[#A80F14] shadow-xs'
                        : 'bg-[#FAF7F4] text-[#5D4B47] border-[#D8CBC5] hover:bg-white'
                    }`}
                  >
                    <span>{d.short}</span>
                    {isSelected && <Check size={11} className="mt-0.5" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer del Formulario */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-[#D8CBC5] rounded-xl text-xs font-bold text-[#5D4B47] hover:bg-gray-50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedDays.length === 0}
              className="flex-1 py-3 bg-[#A80F14] hover:bg-[#7F0C10] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              <span>Guardar Horario</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
