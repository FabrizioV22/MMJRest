import React, { useState, useMemo } from 'react'
import { Calendar, Plus, Trash2, Clock, User, Filter, Sparkles, CheckCircle2 } from 'lucide-react'
import { AddShiftModal } from './AddShiftModal'

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
  { id: 0, label: 'Domingo', short: 'Dom' }
]

export function ShiftSchedulerView({
  shifts = [],
  users = [],
  activeSede,
  onSaveShift,
  onDeleteShift,
  isSubmitting = false
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [filterUser, setFilterUser] = useState('ALL')

  // Agrupar turnos por colaborador
  const groupedShifts = useMemo(() => {
    let filteredUsers = users
    if (filterUser !== 'ALL') {
      filteredUsers = users.filter(u => u.id === filterUser)
    }

    return filteredUsers.map(user => {
      const userShifts = shifts.filter(s => s.usuario_id === user.id)
      
      // Mapear turnos por día de la semana (0 a 6)
      const shiftsByDay = {}
      userShifts.forEach(s => {
        shiftsByDay[s.dia_semana] = s
      })

      return {
        user,
        shifts: userShifts,
        shiftsByDay,
        totalDias: userShifts.length
      }
    })
  }, [users, shifts, filterUser])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. BARRA SUPERIOR DE CONTROL */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9DFD9] shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-50 text-[#A80F14] rounded-xl border border-rose-200">
              <Calendar size={18} />
            </div>
            <h3 className="text-base font-bold text-[#2C211F]">
              Horarios Semanales del Equipo
            </h3>
          </div>
          <p className="text-xs text-[#877571] mt-0.5">
            Sede <strong className="text-[#A80F14]">{activeSede?.nombre || 'General'}</strong> • {shifts.length} turnos configurados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por colaborador */}
          {users.length > 0 && (
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3.5 py-2.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-semibold text-[#2C211F] outline-none cursor-pointer"
            >
              <option value="ALL">👥 Todo el personal ({users.length})</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo || u.id} ({u.roles?.[0] || 'Personal'})
                </option>
              ))}
            </select>
          )}

          {/* Botón Asignar Horario */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#A80F14] hover:bg-[#7F0C10] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>Asignar Horario</span>
          </button>
        </div>
      </div>

      {/* 2. MATRIZ VISUAL DE HORARIOS (DESKTOP) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-[#E9DFD9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9DFD9] bg-[#FAF7F4] text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-60">Colaborador</th>
                {DIAS_SEMANA.map(d => (
                  <th key={d.id} className="py-3.5 px-2 text-center">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DFD9] text-xs">
              {groupedShifts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#877571]">
                    No hay colaboradores asignados a esta sede.
                  </td>
                </tr>
              ) : (
                groupedShifts.map(({ user, shiftsByDay, totalDias }) => (
                  <tr key={user.id} className="hover:bg-[#FAF7F4]/40 transition-colors">
                    {/* Info Colaborador */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[#D8CBC5] flex items-center justify-center font-bold text-[#A80F14] shrink-0 text-xs">
                          {(user.nombre_completo || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#2C211F] truncate text-xs">
                            {user.nombre_completo || 'Colaborador'}
                          </div>
                          <div className="text-[10px] text-[#877571] flex items-center space-x-1">
                            <span>{user.roles?.[0] || 'Personal'}</span>
                            <span>•</span>
                            <span className="font-semibold text-amber-900">{totalDias} días</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Días de la Semana (Columnas) */}
                    {DIAS_SEMANA.map(d => {
                      const shift = shiftsByDay[d.id]

                      return (
                        <td key={d.id} className="py-2.5 px-1.5 text-center">
                          {shift ? (
                            <div className="group relative inline-flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 min-w-[96px]">
                              <span className="text-[11px] font-bold">
                                {shift.hora_ingreso?.substring(0, 5)} - {shift.hora_salida?.substring(0, 5)}
                              </span>
                              <span className="text-[9px] text-amber-700 mt-0.5">
                                tol: {shift.tolerancia_minutos}m
                              </span>

                              {/* Botón eliminar al hacer hover */}
                              <button
                                type="button"
                                onClick={() => onDeleteShift(shift.id)}
                                title="Eliminar turno de este día"
                                className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow-xs transition-opacity cursor-pointer"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-1 text-[10px] font-medium text-[#877571] bg-[#FAF7F4] rounded-lg border border-dashed border-[#D8CBC5]">
                              Descanso
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. VISTA MOBILE (TARJETAS COMPACTAS POR COLABORADOR) */}
      <div className="block lg:hidden space-y-3">
        {groupedShifts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E9DFD9] p-8 text-center text-[#877571] text-xs">
            No hay colaboradores registrados.
          </div>
        ) : (
          groupedShifts.map(({ user, shifts: userShifts, totalDias }) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-[#E9DFD9] p-4 space-y-3 shadow-xs"
            >
              {/* Cabecera Colaborador */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#FAF7F4]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F4] border border-[#D8CBC5] flex items-center justify-center font-bold text-[#A80F14] text-xs">
                    {(user.nombre_completo || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#2C211F]">
                      {user.nombre_completo || 'Colaborador'}
                    </div>
                    <div className="text-[10px] text-[#877571]">
                      {user.roles?.[0] || 'Personal'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                  {totalDias} días programados
                </span>
              </div>

              {/* Grid de Días */}
              {userShifts.length === 0 ? (
                <p className="text-xs text-[#877571] italic text-center py-2">
                  Sin turnos asignados esta semana.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {userShifts.map(s => {
                    const dia = DIAS_SEMANA.find(d => d.id === s.dia_semana)
                    return (
                      <div
                        key={s.id}
                        className="p-2 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#A80F14] mr-1.5">{dia?.short}:</span>
                          <span className="font-bold text-[#2C211F]">
                            {s.hora_ingreso?.substring(0, 5)} - {s.hora_salida?.substring(0, 5)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteShift(s.id)}
                          className="p-1 text-[#877571] hover:text-rose-600 cursor-pointer"
                          title="Eliminar este turno"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Minimalista de Asignación */}
      <AddShiftModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        users={users}
        activeSede={activeSede}
        onSave={async (payloads) => {
          await onSaveShift(payloads)
          setIsAddModalOpen(false)
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
