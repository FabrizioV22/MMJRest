import React from 'react'
import { Loader2, Calendar } from 'lucide-react'
import { useFinanzas } from './useFinanzas'
import { KpiCards } from './KpiCards'
import { ChartsPanel } from './ChartsPanel'
import { HistoryTable } from './HistoryTable'

export function FinanzasDashboardModule() {
  const finanzas = useFinanzas()

  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Dashboard Gerencial</h2>
          <p className="text-slate-400 text-sm mt-1">Análisis financiero e histórico de caja</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Selector de Sede */}
          <select 
            value={finanzas.filterSede}
            onChange={(e) => finanzas.setFilterSede(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">Todas las Sedes</option>
            {finanzas.sedesDisponibles.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>

          {/* Rango de Fechas */}
          <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm focus-within:border-emerald-500">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={finanzas.dateRange.start}
              onChange={(e) => finanzas.setDateRange({...finanzas.dateRange, start: e.target.value})}
              className="bg-transparent text-sm font-medium text-slate-600 outline-none w-32"
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              value={finanzas.dateRange.end}
              onChange={(e) => finanzas.setDateRange({...finanzas.dateRange, end: e.target.value})}
              className="bg-transparent text-sm font-medium text-slate-600 outline-none w-32"
            />
          </div>
        </div>
      </div>

      {finanzas.loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
          <span className="text-sm text-slate-400 font-medium">Analizando datos...</span>
        </div>
      ) : (
        <>
          <KpiCards kpis={finanzas.kpis} />
          
          <ChartsPanel 
            chartSedesData={finanzas.chartSedesData} 
            paymentMethodsData={finanzas.paymentMethodsData} 
          />

          <HistoryTable turnos={finanzas.turnos} />
        </>
      )}
    </div>
  )
}
