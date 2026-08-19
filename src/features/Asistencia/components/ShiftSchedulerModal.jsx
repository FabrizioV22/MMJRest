import React, { useState } from 'react'
import { X, Calendar, Plus, Trash2, Loader2, Clock } from 'lucide-react'

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' }
]

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
  const [form, setForm] = useState({
    usuario_id: '',
    dia_semana: 1,
    hora_ingreso: '08:00',
    hora_salida: '16:30',
    tolerancia_minutos: 10
  })

  if (!isOpen) return null

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.usuario_id || !form.hora_ingreso || !form.hora_salida) return

    await onSaveShift({
      usuario_id: form.usuario_id,
      sede_id: activeSede?.id,
      dia_semana: Number(form.dia_semana),
      hora_ingreso: form.hora_ingreso,
      hora_salida: form.hora_salida,
      tolerancia_minutos: Number(form.tolerancia_minutos)
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E9DFD9] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DFD9]">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C211F]">
                Programación de Horarios y Turnos
              </h3>
              <p className="text-xs text-[#877571]">
                Sede: <strong>{activeSede?.nombre || 'General'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#877571] hover:bg-[#FAF7F4] rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario de Nuevo Turno */}
        <form onSubmit={handleAdd} className="mt-4 p-4 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9] space-y-3">
          <div className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">
            Asignar Nuevo Horario
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Colaborador */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Colaborador</label>
              <select
                value={form.usuario_id}
                onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-medium outline-none cursor-pointer"
              >
                <option value="">Selecciona personal</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo || u.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Día de la semana */}
            <div>
              <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Día</label>
              <select
                value={form.dia_semana}
                onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-medium outline-none cursor-pointer"
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tolerancia */}
            <div>
              <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Tolerancia (min)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={form.tolerancia_minutos}
                onChange={(e) => setForm({ ...form, tolerancia_minutos: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-medium outline-none"
              />
            </div>

            {/* Hora Ingreso */}
            <div>
              <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Hora Ingreso</label>
              <input
                type="time"
                value={form.hora_ingreso}
                onChange={(e) => setForm({ ...form, hora_ingreso: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-medium outline-none"
              />
            </div>

            {/* Hora Salida */}
            <div>
              <label className="block text-[11px] font-bold text-[#5D4B47] mb-1">Hora Salida</label>
              <input
                type="time"
                value={form.hora_salida}
                onChange={(e) => setForm({ ...form, hora_salida: e.target.value })}
                required
                className="w-full px-3 py-2 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] font-medium outline-none"
              />
            </div>

            {/* Botón Guardar */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting || !form.usuario_id}
                className="w-full py-2.5 px-4 bg-[#A80F14] hover:bg-[#7F0C10] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                <span>Asignar Turno</span>
              </button>
            </div>
          </div>
        </form>

        {/* Lista de Turnos Existentes */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2">
            Turnos Configurados ({shifts.length})
          </div>

          {shifts.length === 0 ? (
            <div className="text-center py-8 text-[#877571] text-xs">
              No hay turnos registrados para esta sede.
            </div>
          ) : (
            <div className="divide-y divide-[#E9DFD9] border border-[#E9DFD9] rounded-xl overflow-hidden bg-white">
              {shifts.map((s) => {
                const diaNombre = DIAS_SEMANA.find((d) => d.id === s.dia_semana)?.label || 'Día'
                return (
                  <div
                    key={s.id}
                    className="p-3 flex items-center justify-between hover:bg-[#FAF7F4] transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#2C211F]">
                        {s.usuarios?.nombre_completo || 'Colaborador'}
                      </div>
                      <div className="text-[11px] text-[#877571] flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {diaNombre}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{s.hora_ingreso} - {s.hora_salida}</span>
                        </span>
                        <span>(Tol: {s.tolerancia_minutos || 10}m)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteShift(s.id)}
                      title="Eliminar horario"
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
