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
    <div className="space-y-6 animate-fade-in-up pb-8">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C211F]">Dashboard Gerencial</h2>
          <p className="text-[#5D4B47] text-xs sm:text-sm mt-0.5">Inteligencia de negocios, tendencias e historial analítico</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Presets Rápidos de Fecha (Scrolleable en móvil) */}
          <div className="flex items-center p-1 bg-white border border-[#E9DFD9] rounded-xl text-xs font-bold text-[#5D4B47] shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'ALL', label: 'Todo' },
              { id: 'HOY', label: 'Hoy' },
              { id: 'SEMANA', label: 'Semana' },
              { id: 'MES', label: 'Este Mes' },
              { id: 'MES_ANTERIOR', label: 'Mes Ant.' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activePreset === p.id 
                    ? 'bg-[#A80F14] text-[#FFF9F0] shadow-sm font-black' 
                    : 'hover:text-[#2C211F] hover:bg-[#FAF7F4]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Selector de Sede */}
            <div className="flex-1 sm:flex-none flex items-center space-x-2 bg-white border border-[#E9DFD9] rounded-xl px-3 py-2 sm:py-1.5 shadow-sm focus-within:border-[#A80F14]">
              <Filter size={15} className="text-[#877571] shrink-0" />
              <select 
                value={finanzas.filterSede}
                aria-label="Filtrar por sede"
                onChange={(e) => finanzas.setFilterSede(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#2C211F] outline-none cursor-pointer w-full pr-2"
              >
                <option value="ALL">Todas las Sedes</option>
                {finanzas.sedesDisponibles.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            {/* Custom Date Range Picker */}
            <div className="flex items-center space-x-1 bg-white border border-[#E9DFD9] rounded-xl px-2.5 py-2 sm:py-1.5 shadow-sm text-xs">
              <Calendar size={14} className="text-[#877571] shrink-0" />
              <input 
                type="date" 
                aria-label="Fecha de inicio"
                value={finanzas.dateRange.start}
                onChange={(e) => {
                  setActivePreset('CUSTOM')
                  finanzas.setDateRange({...finanzas.dateRange, start: e.target.value})
                }}
                className="bg-transparent font-semibold text-[#2C211F] outline-none w-24 sm:w-28 text-[11px] sm:text-xs"
              />
              <span className="text-[#877571]">-</span>
              <input 
                type="date" 
                aria-label="Fecha de fin"
                value={finanzas.dateRange.end}
                onChange={(e) => {
                  setActivePreset('CUSTOM')
                  finanzas.setDateRange({...finanzas.dateRange, end: e.target.value})
                }}
                className="bg-transparent font-semibold text-[#2C211F] outline-none w-24 sm:w-28 text-[11px] sm:text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {finanzas.loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="animate-spin text-[#A80F14]" size={36} />
          <span className="text-sm text-[#5D4B47] font-medium">Procesando analítica financiera...</span>
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
