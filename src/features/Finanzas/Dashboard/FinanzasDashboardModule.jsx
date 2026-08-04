import React, { useState } from 'react'
import { Loader2, Calendar, Filter } from 'lucide-react'
import { useFinanzas } from './useFinanzas'
import { KpiCards } from './KpiCards'
import { ChartsPanel } from './ChartsPanel'
import { HistoryTable } from './HistoryTable'

export function FinanzasDashboardModule() {
  const finanzas = useFinanzas()
  const [activePreset, setActivePreset] = useState('ALL')

  const applyPreset = (preset) => {
    setActivePreset(preset)
    const now = new Date()
    const formatDate = (d) => d.toISOString().split('T')[0]

    if (preset === 'HOY') {
      const todayStr = formatDate(now)
      finanzas.setDateRange({ start: todayStr, end: todayStr })
    } else if (preset === 'SEMANA') {
      const dayOfWeek = now.getDay() || 7 // Monday is 1, Sunday is 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - (dayOfWeek - 1))
      finanzas.setDateRange({ start: formatDate(monday), end: formatDate(now) })
    } else if (preset === 'MES') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      finanzas.setDateRange({ start: formatDate(firstDay), end: formatDate(now) })
    } else if (preset === 'MES_ANTERIOR') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      finanzas.setDateRange({ start: formatDate(firstDayLastMonth), end: formatDate(lastDayLastMonth) })
    } else if (preset === 'ALL') {
      finanzas.setDateRange({ start: '', end: '' })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Dashboard Gerencial</h2>
          <p className="text-[#6B7280] text-sm mt-0.5">Inteligencia de negocios, tendencias e historial analítico</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Presets Rápidos de Fecha */}
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
            {[
              { id: 'ALL', label: 'Todo' },
              { id: 'HOY', label: 'Hoy' },
              { id: 'SEMANA', label: 'Esta Semana' },
              { id: 'MES', label: 'Este Mes' },
              { id: 'MES_ANTERIOR', label: 'Mes Anterior' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activePreset === p.id 
                    ? 'bg-[#A16207] text-white shadow-sm font-black' 
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Selector de Sede */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm focus-within:border-amber-600">
            <Filter size={15} className="text-slate-400" />
            <select 
              value={finanzas.filterSede}
              aria-label="Filtrar por sede"
              onChange={(e) => finanzas.setFilterSede(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-2"
            >
              <option value="ALL">Todas las Sedes</option>
              {finanzas.sedesDisponibles.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Range Picker */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <input 
              type="date" 
              aria-label="Fecha de inicio"
              value={finanzas.dateRange.start}
              onChange={(e) => {
                setActivePreset('CUSTOM')
                finanzas.setDateRange({...finanzas.dateRange, start: e.target.value})
              }}
              className="bg-transparent font-semibold text-slate-700 outline-none w-28 text-xs"
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              aria-label="Fecha de fin"
              value={finanzas.dateRange.end}
              onChange={(e) => {
                setActivePreset('CUSTOM')
                finanzas.setDateRange({...finanzas.dateRange, end: e.target.value})
              }}
              className="bg-transparent font-semibold text-slate-700 outline-none w-28 text-xs"
            />
          </div>
        </div>
      </div>

      {finanzas.loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
          <span className="text-sm text-slate-400 font-medium">Procesando analítica de datos...</span>
        </div>
      ) : (
        <>
          <KpiCards kpis={finanzas.kpis} />
          
          <ChartsPanel 
            chartSedesData={finanzas.chartSedesData} 
            monthlyTrendData={finanzas.monthlyTrendData}
            paymentMethodsData={finanzas.paymentMethodsData} 
            paymentMethodsTrendData={finanzas.paymentMethodsTrendData}
            sedes={finanzas.sedesDisponibles}
          />

          <HistoryTable 
            turnos={finanzas.turnos} 
            turnoFlowsMap={finanzas.turnoFlowsMap}
          />
        </>
      )}
    </div>
  )
}
