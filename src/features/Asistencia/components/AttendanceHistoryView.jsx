import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Calendar, Download, Clock, AlertTriangle, CheckCircle2, 
  Smartphone, Monitor, Search, Loader2 
} from 'lucide-react'
import { asistenciaService } from '../../../services/asistenciaService'
import { formatLimaTime, getLimaDateString } from '../../../utils/dateUtils'
import { useToast } from '../../../context/ToastContext'

export function AttendanceHistoryView({ activeSede, users = [] }) {
  const toast = useToast()
  
  // Rango de fechas por defecto: Esta Semana
  const [datePreset, setDatePreset] = useState('THIS_WEEK')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => getLimaDateString())
  const [selectedUser, setSelectedUser] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [rawMarks, setRawMarks] = useState([])

  // Ajustar fechas según preset seleccionado
  const handlePresetChange = (preset) => {
    setDatePreset(preset)
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (preset) {
      case 'TODAY':
        start = today
        end = today
        break
      case 'THIS_WEEK': {
        const day = today.getDay()
        const diff = today.getDate() - day + (day === 0 ? -6 : 1)
        start = new Date(today.setDate(diff))
        end = new Date()
        break
      }
      case 'LAST_WEEK': {
        const day = today.getDay()
        const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7
        start = new Date(today.getFullYear(), today.getMonth(), diff)
        end = new Date(today.getFullYear(), today.getMonth(), diff + 6)
        break
      }
      case 'THIS_MONTH': {
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date()
        break
      }
      case 'LAST_MONTH': {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      }
      case 'CUSTOM':
      default:
        return
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const loadHistory = useCallback(async () => {
    if (!activeSede?.id) return
    setIsLoading(true)
    try {
      const data = await asistenciaService.getHistorialMarcaciones({
        sedeId: activeSede.id,
        fechaInicio: startDate,
        fechaFin: endDate,
        usuarioId: selectedUser
      })
      setRawMarks(data || [])
    } catch (err) {
      console.error('Error cargando historial de asistencia:', err)
      toast.error('Error al cargar historial de asistencia.')
    } finally {
      setIsLoading(false)
    }
  }, [activeSede?.id, startDate, endDate, selectedUser, toast])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Consolidar marcaciones por jornada (usuario + fecha)
  const consolidatedJourneys = useMemo(() => {
    const journeysMap = new Map()

    rawMarks.forEach((m) => {
      const key = `${m.usuario_id}_${m.fecha}`
      if (!journeysMap.has(key)) {
        journeysMap.set(key, {
          key,
          usuarioId: m.usuario_id,
          nombre: m.usuarios?.nombre_completo || 'Colaborador',
          rol: m.usuarios?.roles?.[0] || 'Personal',
          fecha: m.fecha,
          ingreso: null,
          inicioRef: null,
          finRef: null,
          salida: null,
          minutosTardanza: 0,
          estadoPuntualidad: 'A_TIEMPO',
          medioMarcacion: null,
          distanciaMetros: null,
          observaciones: null
        })
      }

      const item = journeysMap.get(key)
      if (m.tipo_marca === 'INGRESO') {
        item.ingreso = m.hora_evento
        item.minutosTardanza = m.minutos_tardanza || 0
        item.estadoPuntualidad = m.estado_puntualidad || 'A_TIEMPO'
        item.medioMarcacion = m.medio_marcacion
        item.distanciaMetros = m.distancia_metros
        item.observaciones = m.observaciones
      } else if (m.tipo_marca === 'INICIO_REFRIGERIO') {
        item.inicioRef = m.hora_evento
      } else if (m.tipo_marca === 'FIN_REFRIGERIO') {
        item.finRef = m.hora_evento
      } else if (m.tipo_marca === 'SALIDA') {
        item.salida = m.hora_evento
      }
    })

    let list = Array.from(journeysMap.values())

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(j => j.nombre.toLowerCase().includes(q) || j.rol.toLowerCase().includes(q))
    }

    return list
  }, [rawMarks, searchTerm])

  // KPIs del Período
  const metrics = useMemo(() => {
    const totalJornadas = consolidatedJourneys.length
    let totalTardanzaMins = 0
    let aTiempoCount = 0
    let tardanzasCount = 0
    let justificadosCount = 0

    consolidatedJourneys.forEach(j => {
      totalTardanzaMins += j.minutosTardanza || 0
      if (j.estadoPuntualidad === 'A_TIEMPO') aTiempoCount++
      else if (j.estadoPuntualidad === 'TARDANZA') tardanzasCount++
      else if (j.estadoPuntualidad === 'JUSTIFICADO') justificadosCount++
    })

    const puntualidadRate = totalJornadas > 0 
      ? Math.round(((aTiempoCount + justificadosCount) / totalJornadas) * 100) 
      : 100

    return {
      totalJornadas,
      totalTardanzaMins,
      aTiempoCount,
      tardanzasCount,
      justificadosCount,
      puntualidadRate
    }
  }, [consolidatedJourneys])

  // Exportar a CSV (Compatible con Excel Perú)
  const handleExportCSV = () => {
    if (consolidatedJourneys.length === 0) {
      toast.info('No hay datos en el rango seleccionado para exportar.')
      return
    }

    const headers = [
      'Fecha',
      'Colaborador',
      'Rol',
      'Hora Ingreso',
      'Inicio Refrigerio',
      'Fin Refrigerio',
      'Hora Salida',
      'Minutos Refrigerio',
      'Estado Puntualidad',
      'Minutos Tardanza',
      'Medio Marcacion',
      'Distancia GPS (m)',
      'Observaciones'
    ]

    const rows = consolidatedJourneys.map(j => {
      let minsRef = '—'
      if (j.inicioRef && j.finRef) {
        minsRef = Math.round((new Date(j.finRef) - new Date(j.inicioRef)) / 60000)
      }

      return [
        j.fecha,
        `"${(j.nombre || '').replace(/"/g, '""')}"`,
        `"${j.rol || ''}"`,
        j.ingreso ? formatLimaTime(j.ingreso) : '—',
        j.inicioRef ? formatLimaTime(j.inicioRef) : '—',
        j.finRef ? formatLimaTime(j.finRef) : '—',
        j.salida ? formatLimaTime(j.salida) : '—',
        minsRef,
        j.estadoPuntualidad,
        j.minutosTardanza || 0,
        j.medioMarcacion || '—',
        j.distanciaMetros !== null ? j.distanciaMetros : '—',
        `"${(j.observaciones || '').replace(/"/g, '""')}"`
      ]
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `asistencia_${activeSede?.nombre || 'sede'}_${startDate}_al_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte de asistencia exportado exitosamente.')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. BARRA SUPERIOR DE FILTROS & PRESETS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9DFD9] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#FAF7F4]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2C211F] flex items-center space-x-2">
              <Calendar size={18} className="text-[#A80F14]" />
              <span>Historial Consolidado y Reportes</span>
            </h3>
            <p className="text-xs text-[#877571] mt-0.5">
              Auditoría de jornadas laborales, puntualidad y exportación para planillas
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={consolidatedJourneys.length === 0}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <Download size={15} />
            <span>Exportar a Excel / CSV</span>
          </button>
        </div>

        {/* Presets Rápidos y Date Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'TODAY', label: 'Hoy' },
              { id: 'THIS_WEEK', label: 'Esta Semana' },
              { id: 'LAST_WEEK', label: 'Semana Anterior' },
              { id: 'THIS_MONTH', label: 'Este Mes' },
              { id: 'LAST_MONTH', label: 'Mes Anterior' },
              { id: 'CUSTOM', label: 'Personalizado' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetChange(p.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  datePreset === p.id
                    ? 'bg-[#A80F14] text-white border-[#A80F14] shadow-xs'
                    : 'bg-[#FAF7F4] text-[#5D4B47] border-[#D8CBC5] hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Rango de Fechas & Colaborador */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-[#FAF7F4] p-1 rounded-xl border border-[#D8CBC5]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM')
                  setStartDate(e.target.value)
                }}
                className="px-2 py-1 bg-transparent text-xs font-semibold text-[#2C211F] outline-none cursor-pointer"
              />
              <span className="text-xs text-[#877571] font-bold">a</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setDatePreset('CUSTOM')
                  setEndDate(e.target.value)
                }}
                className="px-2 py-1 bg-transparent text-xs font-semibold text-[#2C211F] outline-none cursor-pointer"
              />
            </div>

            {/* Selector de Colaborador */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-semibold text-[#2C211F] outline-none cursor-pointer"
            >
              <option value="ALL">👥 Todos los colaboradores</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo || u.id} ({u.roles?.[0] || 'Personal'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE KPIS DEL PERÍODO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9DFD9] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">Jornadas Registradas</span>
            <div className="p-2 bg-rose-50 text-[#A80F14] rounded-xl border border-rose-100">
              <Calendar size={16} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#2C211F] mt-2 tabular-nums">{metrics.totalJornadas}</h3>
          <p className="text-[11px] text-[#877571] mt-0.5">Asistencias en el rango</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9DFD9] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">Puntualidad</span>
            <div className="p-2 bg-emerald-50 text-[#15803D] rounded-xl border border-emerald-100">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#15803D] mt-2 tabular-nums">{metrics.puntualidadRate}%</h3>
          <p className="text-[11px] text-[#877571] mt-0.5">{metrics.aTiempoCount} a tiempo • {metrics.justificadosCount} justificadas</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9DFD9] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">Tardanzas Totales</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-800 mt-2 tabular-nums">{metrics.tardanzasCount}</h3>
          <p className="text-[11px] text-[#877571] mt-0.5">Incidentes de retraso</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9DFD9] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">Minutos Retraso</span>
            <div className="p-2 bg-rose-50 text-[#B42318] rounded-xl border border-rose-100">
              <AlertTriangle size={16} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#B42318] mt-2 tabular-nums">{metrics.totalTardanzaMins} min</h3>
          <p className="text-[11px] text-[#877571] mt-0.5">Acumulado en el período</p>
        </div>
      </div>

      {/* 3. TABLA CONSOLIDADA / HISTORIAL */}
      <div className="bg-white rounded-2xl border border-[#E9DFD9] shadow-xs overflow-hidden">
        {/* Cabecera & Buscador */}
        <div className="p-4 sm:p-5 border-b border-[#E9DFD9] flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#FAF7F4]/50">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#2C211F] uppercase tracking-wider">
              Detalle de Asistencia por Jornada
            </h4>
            <p className="text-[11px] text-[#877571]">
              Mostrando {consolidatedJourneys.length} registros desde el {startDate} al {endDate}
            </p>
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#877571]" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-3.5 py-1.5 bg-white border border-[#D8CBC5] rounded-xl text-xs text-[#2C211F] outline-none placeholder-[#877571]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 size={28} className="animate-spin text-[#A80F14] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#877571]">Cargando historial de marcaciones...</p>
          </div>
        ) : consolidatedJourneys.length === 0 ? (
          <div className="p-12 text-center text-[#877571] space-y-2">
            <Calendar size={32} className="mx-auto text-gray-300" />
            <p className="text-xs font-semibold">No se encontraron registros en el rango de fechas seleccionado.</p>
          </div>
        ) : (
          <>
            {/* 📱 Vista Mobile (Cards) */}
            <div className="block md:hidden divide-y divide-[#E9DFD9]">
              {consolidatedJourneys.map(j => {
                let minsRef = '—'
                if (j.inicioRef && j.finRef) {
                  minsRef = `${Math.round((new Date(j.finRef) - new Date(j.inicioRef)) / 60000)} min`
                } else if (j.inicioRef) {
                  minsRef = 'En refrigerio'
                }

                return (
                  <div key={j.key} className="p-4 space-y-3 hover:bg-[#FAF7F4]/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-[#2C211F]">{j.nombre}</div>
                        <div className="text-[10px] text-[#877571] font-medium">
                          {j.fecha} • {j.rol}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        j.estadoPuntualidad === 'A_TIEMPO' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : j.estadoPuntualidad === 'JUSTIFICADO'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {j.estadoPuntualidad === 'TARDANZA' ? `Tardanza (+${j.minutosTardanza}m)` : j.estadoPuntualidad}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="p-2 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9]">
                        <span className="text-[9px] font-bold text-[#877571] uppercase block">Ingreso</span>
                        <span className="font-bold text-[#2C211F] block mt-0.5">
                          {j.ingreso ? formatLimaTime(j.ingreso) : '—'}
                        </span>
                      </div>
                      <div className="p-2 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9]">
                        <span className="text-[9px] font-bold text-[#877571] uppercase block">Refrigerio</span>
                        <span className="font-bold text-[#2C211F] block mt-0.5 truncate">
                          {minsRef}
                        </span>
                      </div>
                      <div className="p-2 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9]">
                        <span className="text-[9px] font-bold text-[#877571] uppercase block">Salida</span>
                        <span className="font-bold text-[#2C211F] block mt-0.5">
                          {j.salida ? formatLimaTime(j.salida) : '—'}
                        </span>
                      </div>
                    </div>

                    {j.observaciones && (
                      <div className="text-[11px] text-[#5D4B47] bg-[#FAF7F4] p-2 rounded-lg border border-[#E9DFD9]">
                        <strong>Obs:</strong> {j.observaciones}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 💻 Vista Desktop (Tabla Completa) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E9DFD9] bg-[#FAF7F4] text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4 text-center">Ingreso</th>
                    <th className="py-3 px-4 text-center">Refrigerio</th>
                    <th className="py-3 px-4 text-center">Salida</th>
                    <th className="py-3 px-4 text-center">Puntualidad</th>
                    <th className="py-3 px-4 text-center">Medio / GPS</th>
                    <th className="py-3 px-4">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9DFD9] text-xs">
                  {consolidatedJourneys.map(j => {
                    let minsRef = '—'
                    if (j.inicioRef && j.finRef) {
                      minsRef = `${Math.round((new Date(j.finRef) - new Date(j.inicioRef)) / 60000)} min`
                    } else if (j.inicioRef) {
                      minsRef = 'En refrigerio'
                    }

                    const MethodIcon = j.medioMarcacion === 'MOVIL_GPS' ? Smartphone : Monitor

                    return (
                      <tr key={j.key} className="hover:bg-[#FAF7F4]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#2C211F] whitespace-nowrap">
                          {j.fecha}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#2C211F]">{j.nombre}</div>
                          <div className="text-[10px] text-[#877571]">{j.rol}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#2C211F]">
                          {j.ingreso ? (
                            <span className="bg-[#FAF7F4] px-2 py-0.5 rounded border border-[#E9DFD9]">
                              {formatLimaTime(j.ingreso)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-[#5D4B47]">
                          {minsRef}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#2C211F]">
                          {j.salida ? (
                            <span className="bg-[#FAF7F4] px-2 py-0.5 rounded border border-[#E9DFD9]">
                              {formatLimaTime(j.salida)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            j.estadoPuntualidad === 'A_TIEMPO' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : j.estadoPuntualidad === 'JUSTIFICADO'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {j.estadoPuntualidad === 'TARDANZA' ? `Tardanza (+${j.minutosTardanza}m)` : j.estadoPuntualidad}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {j.medioMarcacion ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] text-[#5D4B47] bg-[#FAF7F4] px-2 py-0.5 rounded border border-[#E9DFD9]">
                              <MethodIcon size={11} className="text-[#877571]" />
                              <span>{j.medioMarcacion === 'MOVIL_GPS' ? 'Móvil' : 'Kiosko'}</span>
                              {j.distanciaMetros !== null && <span>({j.distanciaMetros}m)</span>}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[#5D4B47] max-w-xs truncate">
                          {j.observaciones || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
