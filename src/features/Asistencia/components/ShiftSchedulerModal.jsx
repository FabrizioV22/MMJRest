import React, { useState, useMemo } from 'react'
import { X, Calendar, Plus, Trash2, Loader2, Clock, Check, Sparkles, User, ChevronDown } from 'lucide-react'

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
  { label: '🌙 Tarde/Noche (15:30 - 23:30)', ingreso: '15:30', salida: '23:30', tol: 10 },
  { label: '⏱️ Part-Time (12:00 - 16:30)', ingreso: '12:00', salida: '16:30', tol: 10 },
  { label: '👨‍🍳 Cocina (07:30 - 16:00)', ingreso: '07:30', salida: '16:00', tol: 5 }
]

function normalizeUser(userCandidate, fallbackUid) {
  if (!userCandidate) return { id: fallbackUid || 'unknown', nombre_completo: 'Colaborador', roles: ['Personal'] }
  const raw = Array.isArray(userCandidate) ? userCandidate[0] : userCandidate
  return {
    id: raw?.id || fallbackUid || 'unknown',
    nombre_completo: typeof raw?.nombre_completo === 'string' ? raw.nombre_completo : 'Colaborador',
    roles: Array.isArray(raw?.roles) ? raw.roles : ['Personal']
  }
}

export function ShiftSchedulerModal({
  isOpen,
  onClose,
  users = [],
  shifts = [],
  activeSede,
  onSaveShift,
  onDeleteShift,
  isSubmitting = false
}) {
  const userList = useMemo(() => (Array.isArray(users) ? users : []), [users])
  const shiftList = useMemo(() => (Array.isArray(shifts) ? shifts : []), [shifts])

  const [selectedUser, setSelectedUser] = useState('') // '' o 'ALL' o userId
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5, 6]) // Default: Lun-Sáb
  const [horaIngreso, setHoraIngreso] = useState('08:00')
  const [horaSalida, setHoraSalida] = useState('16:30')
  const [tolerancia, setTolerancia] = useState(10)
  const [filterUser, setFilterUser] = useState('ALL')

  // Agrupar turnos por colaborador para una vista limpia y segura
  const groupedShifts = useMemo(() => {
    const map = new Map()
    shiftList.forEach((s) => {
      if (!s) return
      const uid = s.usuario_id || 'unknown'
      if (!map.has(uid)) {
        const foundUser = s.usuarios || userList.find((u) => u.id === uid)
        map.set(uid, {
          usuario: normalizeUser(foundUser, uid),
          shifts: []
        })
      }
      map.get(uid).shifts.push(s)
    })

    let list = Array.from(map.values())
    if (filterUser !== 'ALL') {
      list = list.filter((g) => g.usuario?.id === filterUser)
    }
    return list
  }, [shiftList, userList, filterUser])

  if (!isOpen) return null

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId))
    } else {
      setSelectedDays([...selectedDays, dayId])
    }
  }

  const selectDayRange = (days) => {
    setSelectedDays(days)
  }

  const applyTemplate = (tpl) => {
    setHoraIngreso(tpl.ingreso)
    setHoraSalida(tpl.salida)
    setTolerancia(tpl.tol)
  }

  const handleBatchSave = async (e) => {
    e.preventDefault()
    if (!selectedUser || selectedDays.length === 0 || !horaIngreso || !horaSalida) return

    const targetUsers = selectedUser === 'ALL' ? userList.map((u) => u.id) : [selectedUser]
    const payloads = []

    targetUsers.forEach((uid) => {
      selectedDays.forEach((dia) => {
        payloads.push({
          usuario_id: uid,
          sede_id: activeSede?.id,
          dia_semana: dia,
          hora_ingreso: horaIngreso,
          hora_salida: horaSalida,
          tolerancia_minutos: Number(tolerancia),
          activo: true
        })
      })
    })

    await onSaveShift(payloads)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E9DFD9] animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Fijo */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E9DFD9] shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 shrink-0">
              <Calendar size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2C211F] leading-tight">
                Turnos y Horarios Semanales
              </h3>
              <p className="text-[11px] sm:text-xs text-[#877571] mt-0.5">
                Sede: <strong className="text-[#A80F14]">{activeSede?.nombre || 'General'}</strong> (Recurrencia automática)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#877571] hover:bg-[#FAF7F4] rounded-full cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo con Scroll Fluido para Mobile */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 pb-12 sm:pb-6 space-y-5 overscroll-contain">
          
          {/* Formulario de Asignación Rápida / Masiva */}
          <form onSubmit={handleBatchSave} className="p-4 sm:p-5 bg-[#FAF7F4] rounded-2xl border border-[#E9DFD9] space-y-4">
            
            {/* Header del Formulario y Plantillas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles size={14} className="text-amber-600 shrink-0" />
                  <span>Asignar Horario</span>
                </span>
                <span className="text-[10px] text-[#877571] font-semibold hidden sm:inline">
                  Plantillas rápidas:
                </span>
              </div>

              {/* Botones de Plantillas (Wrap adaptado para touch) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-white hover:bg-amber-50 active:bg-amber-100 text-[#5D4B47] hover:text-amber-900 rounded-lg border border-[#D8CBC5] cursor-pointer transition-all shadow-2xs"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Principales */}
            <div className="space-y-3">
              {/* Colaborador Destino */}
              <div>
                <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">
                  Colaborador Destino
                </label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-semibold outline-none cursor-pointer appearance-none pr-8 shadow-2xs"
                  >
                    <option value="">Selecciona a quién asignar</option>
                    {userList.length > 0 && (
                      <option value="ALL">👥 Toda la sede ({userList.length} colaboradores)</option>
                    )}
                    <optgroup label="Colaboradores Individuales">
                      {userList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre_completo || u.id} ({u.roles?.[0] || 'Personal'})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#877571] pointer-events-none" />
                </div>
              </div>

              {/* Horas y Tolerancia (Grid responsivo) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Hora Ingreso</label>
                  <input
                    type="time"
                    value={horaIngreso}
                    onChange={(e) => setHoraIngreso(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-semibold outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Hora Salida</label>
                  <input
                    type="time"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-semibold outline-none shadow-2xs"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Tolerancia (minutos)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={tolerancia}
                    onChange={(e) => setTolerancia(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-semibold outline-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Selector de Días Semanales */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="text-[11px] font-bold text-[#5D4B47]">
                  Días a programar ({selectedDays.length} seleccionados):
                </label>
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#A80F14]">
                  <button
                    type="button"
                    onClick={() => selectDayRange([1, 2, 3, 4, 5, 6])}
                    className="hover:underline cursor-pointer py-0.5 px-1 rounded hover:bg-rose-50"
                  >
                    Lun-Sáb
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => selectDayRange([1, 2, 3, 4, 5])}
                    className="hover:underline cursor-pointer py-0.5 px-1 rounded hover:bg-rose-50"
                  >
                    Lun-Vie
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => selectDayRange([6, 0])}
                    className="hover:underline cursor-pointer py-0.5 px-1 rounded hover:bg-rose-50"
                  >
                    Fines de Sem.
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => selectDayRange([0, 1, 2, 3, 4, 5, 6])}
                    className="hover:underline cursor-pointer py-0.5 px-1 rounded hover:bg-rose-50"
                  >
                    Todos (7)
                  </button>
                </div>
              </div>

              {/* Botones de Días (7 columnas compactas) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {DIAS_SEMANA.map((d) => {
                  const isSelected = selectedDays.includes(d.id)
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDay(d.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer flex flex-col items-center justify-center select-none active:scale-95 ${
                        isSelected
                          ? 'bg-[#A80F14] text-white border-[#A80F14] shadow-xs'
                          : 'bg-white text-[#5D4B47] border-[#D8CBC5] hover:bg-gray-50'
                      }`}
                    >
                      <span>{d.short}</span>
                      {isSelected ? (
                        <Check size={11} className="mt-0.5" />
                      ) : (
                        <span className="text-[9px] text-gray-400 mt-0.5">—</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Botón de Asignación Principal */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedUser || selectedDays.length === 0}
                className="w-full py-3 px-4 bg-[#A80F14] hover:bg-[#7F0C10] active:bg-[#60080B] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                <span>
                  {selectedUser === 'ALL'
                    ? `Guardar para ${userList.length} Colaboradores (${selectedDays.length * userList.length} turnos)`
                    : `Guardar Turno Semanal (${selectedDays.length} días)`}
                </span>
              </button>
            </div>
          </form>

          {/* Lista Visual de Turnos Agrupados por Colaborador */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">
                Turnos Configurados ({shiftList.length} registros)
              </div>
              {userList.length > 0 && (
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs text-[#5D4B47] font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">Ver todo el personal</option>
                  {userList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo || u.id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {groupedShifts.length === 0 ? (
              <div className="text-center py-10 text-[#877571] text-xs bg-[#FAF7F4] rounded-2xl border border-dashed border-[#D8CBC5] p-6">
                No hay turnos configurados para los filtros seleccionados.
              </div>
            ) : (
              <div className="space-y-3">
                {groupedShifts.map((group, idx) => {
                  const u = group.usuario
                  const initialLetter = (u?.nombre_completo || 'U').charAt(0).toUpperCase()
                  const sortedShifts = [...(group.shifts || [])].sort(
                    (a, b) => (a.dia_semana === 0 ? 7 : a.dia_semana) - (b.dia_semana === 0 ? 7 : b.dia_semana)
                  )

                  return (
                    <div
                      key={u?.id || `group-${idx}`}
                      className="p-3.5 sm:p-4 bg-white border border-[#E9DFD9] rounded-2xl hover:border-[#D8CBC5] transition-all shadow-xs"
                    >
                      {/* Cabecera del Colaborador */}
                      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#FAF7F4]">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[#D8CBC5] flex items-center justify-center text-xs font-bold text-[#A80F14] shrink-0">
                            {initialLetter}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-[#2C211F] truncate">
                              {u?.nombre_completo || 'Colaborador'}
                            </div>
                            <div className="text-[10px] text-[#877571]">
                              {u?.roles?.[0] || 'Personal'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                          {sortedShifts.length} días
                        </span>
                      </div>

                      {/* Grilla de Días y Horarios */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {sortedShifts.map((s) => {
                          const dia = DIAS_SEMANA.find((d) => d.id === s.dia_semana)
                          return (
                            <div
                              key={s.id || `shift-${s.usuario_id}-${s.dia_semana}`}
                              className="p-2.5 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9] flex items-center justify-between shadow-2xs"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                                    {dia?.short || 'Día'}
                                  </span>
                                  <span className="text-xs font-bold text-[#2C211F] truncate">
                                    {s.hora_ingreso?.substring(0, 5)} - {s.hora_salida?.substring(0, 5)}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#877571] mt-0.5 font-medium">
                                  Tolerancia: {s.tolerancia_minutos || 10} min
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => onDeleteShift(s.id)}
                                title="Eliminar este turno"
                                className="p-2 text-[#877571] hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg cursor-pointer transition-colors shrink-0 ml-1"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
