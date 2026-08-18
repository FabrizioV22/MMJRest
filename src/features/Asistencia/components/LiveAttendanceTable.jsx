import React from 'react'
import { CheckCircle2, Clock, MinusCircle, Smartphone, Monitor, ShieldCheck, User } from 'lucide-react'

export function LiveAttendanceTable({
  attendanceList = [],
  isLoading = false,
  onJustify = null,
  isAdmin = false
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E9DFD9] p-8 text-center shadow-xs">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-[#FAF7F4] rounded w-1/4 mx-auto" />
          <div className="h-10 bg-[#FAF7F4] rounded" />
          <div className="h-10 bg-[#FAF7F4] rounded" />
          <div className="h-10 bg-[#FAF7F4] rounded" />
        </div>
      </div>
    )
  }

  if (attendanceList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E9DFD9] p-10 text-center shadow-xs">
        <div className="w-14 h-14 bg-[#FAF7F4] rounded-full flex items-center justify-center mx-auto text-[#877571] mb-3">
          <User size={28} />
        </div>
        <h3 className="text-base font-bold text-[#2C211F]">No hay personal programado hoy</h3>
        <p className="text-xs text-[#877571] mt-1 max-w-sm mx-auto">
          Asigna turnos de trabajo en la pestaña "Horarios y Turnos" para comenzar la supervisión.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E9DFD9] shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E9DFD9] flex justify-between items-center bg-[#FAF7F4]/50">
        <div>
          <h2 className="text-sm font-bold text-[#2C211F] uppercase tracking-wider">
            Supervisión en Vivo de Asistencias
          </h2>
          <p className="text-xs text-[#877571] mt-0.5">Control y registro diario de entradas y salidas</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-[#FAF7F4] border border-[#D8CBC5] text-[#5D4B47] rounded-full">
          {attendanceList.length} Colaboradores
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E9DFD9] bg-[#FAF7F4] text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">
              <th className="py-3.5 px-4 md:px-6">Personal</th>
              <th className="py-3.5 px-4 text-center">Horario</th>
              <th className="py-3.5 px-4 text-center">Llegada</th>
              <th className="py-3.5 px-4 text-center hidden md:table-cell">Refrigerio</th>
              <th className="py-3.5 px-4 text-center hidden sm:table-cell">Salida</th>
              <th className="py-3.5 px-4 text-center">Estado</th>
              <th className="py-3.5 px-4 text-center hidden lg:table-cell">Medio</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9DFD9] text-xs">
            {attendanceList.map((item) => {
              const statusBadge = getStatusBadge(item.estadoPuntualidad, item.minutosTardanza)
              const MethodIcon = item.medioMarcacion === 'MOVIL_GPS' ? Smartphone : Monitor

              return (
                <tr key={item.usuarioId} className="hover:bg-[#FAF7F4]/40 transition-colors">
                  {/* Personal */}
                  <td className="py-3.5 px-4 md:px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#FAF7F4] border border-[#D8CBC5] flex items-center justify-center font-bold text-[#A80F14] shrink-0 text-xs">
                        {item.nombre ? item.nombre.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#2C211F] truncate text-sm">
                          {item.nombre || 'Personal'}
                        </div>
                        <div className="text-[11px] text-[#877571] flex items-center space-x-1.5">
                          <span>{item.rol || 'Personal'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Horario Programado */}
                  <td className="py-3.5 px-4 text-center font-medium text-[#5D4B47]">
                    {item.horarioProgramado || '—'}
                  </td>

                  {/* Hora de Llegada */}
                  <td className="py-3.5 px-4 text-center font-bold text-[#2C211F]">
                    {item.horaIngreso ? (
                      <span className="bg-[#FAF7F4] px-2.5 py-1 rounded-lg border border-[#E9DFD9]">
                        {item.horaIngreso}
                      </span>
                    ) : (
                      <span className="text-[#877571]">—</span>
                    )}
                  </td>

                  {/* Refrigerio */}
                  <td className="py-3.5 px-4 text-center hidden md:table-cell text-[#5D4B47]">
                    {item.estadoRefrigerio || '—'}
                  </td>

                  {/* Salida */}
                  <td className="py-3.5 px-4 text-center hidden sm:table-cell text-[#5D4B47]">
                    {item.horaSalida ? (
                      <span className="bg-[#FAF7F4] px-2.5 py-1 rounded-lg border border-[#E9DFD9]">
                        {item.horaSalida}
                      </span>
                    ) : (
                      <span className="text-[#877571]">—</span>
                    )}
                  </td>

                  {/* Estado Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        <statusBadge.icon size={13} className="shrink-0" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>
                  </td>

                  {/* Medio de Marcación y Ubicación */}
                  <td className="py-3.5 px-4 text-center hidden lg:table-cell">
                    {item.medioMarcacion ? (
                      <div className="flex flex-col items-center space-y-1">
                        <span
                          title={item.observaciones || (item.medioMarcacion === 'MOVIL_GPS' ? 'Marcó vía Móvil con GPS' : 'Marcó en Terminal de Sede')}
                          className="inline-flex items-center space-x-1 text-[11px] text-[#5D4B47] bg-[#FAF7F4] px-2 py-0.5 rounded-md border border-[#E9DFD9]"
                        >
                          <MethodIcon size={12} className="text-[#877571]" />
                          <span>{item.medioMarcacion === 'MOVIL_GPS' ? 'Móvil' : 'Kiosko'}</span>
                        </span>
                        {item.medioMarcacion === 'MOVIL_GPS' && item.distanciaMetros !== null && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              item.distanciaMetros > 100
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'text-[#877571]'
                            }`}
                          >
                            {item.distanciaMetros > 100 ? `⚠️ a ${item.distanciaMetros}m` : `📍 ${item.distanciaMetros}m`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#877571]">—</span>
                    )}
                  </td>

                  {/* Acciones */}
                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right">
                      {item.ingresoMarcaId && (
                        <button
                          onClick={() => onJustify && onJustify(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#A80F14] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Justificar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getStatusBadge(estado, minutosTardanza = 0) {
  switch (estado) {
    case 'A_TIEMPO':
      return {
        label: 'A TIEMPO',
        icon: CheckCircle2,
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200'
      }
    case 'TARDANZA':
      return {
        label: minutosTardanza > 0 ? `TARDANZA (+${minutosTardanza}m)` : 'TARDANZA',
        icon: Clock,
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200'
      }
    case 'JUSTIFICADO':
      return {
        label: 'JUSTIFICADO',
        icon: ShieldCheck,
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200'
      }
    default:
      return {
        label: 'SIN MARCAR',
        icon: MinusCircle,
        bg: 'bg-stone-50',
        text: 'text-stone-600',
        border: 'border-stone-200'
      }
  }
}
