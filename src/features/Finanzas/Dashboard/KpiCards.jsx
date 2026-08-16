import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function KpiCards({ kpis }) {
  const isDiffPositive = kpis.promedioDiferencia >= 0
  const isNetPositive = kpis.gananciaNeta >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
      {/* Ingresos Operativos */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#15803D] rounded-l-2xl"></div>
        <div className="p-3 bg-emerald-50 text-[#15803D] rounded-2xl shrink-0 border border-emerald-100">
          <TrendingUp size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider truncate">Ingresos Operativos</p>
          <h3 className="text-xl font-black text-[#2C211F] mt-0.5 tabular-nums truncate">S/ {fmt(kpis.ingresosTotales)}</h3>
        </div>
      </div>

      {/* Total Egresos */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B42318] rounded-l-2xl"></div>
        <div className="p-3 bg-rose-50 text-[#B42318] rounded-2xl shrink-0 border border-rose-100">
          <TrendingDown size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider truncate">Total Egresos</p>
          <h3 className="text-xl font-black text-[#B42318] mt-0.5 tabular-nums truncate">S/ {fmt(kpis.egresosTotales)}</h3>
        </div>
      </div>

      {/* Ganancia Neta */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-3.5 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isNetPositive ? 'bg-[#A80F14]' : 'bg-[#B42318]'}`}></div>
        <div className={`p-3 rounded-2xl shrink-0 border ${isNetPositive ? 'bg-rose-50 text-[#A80F14] border-rose-100' : 'bg-rose-50 text-[#B42318] border-rose-100'}`}>
          <DollarSign size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider truncate">Ganancia Neta</p>
          <h3 className={`text-xl font-black mt-0.5 tabular-nums truncate ${isNetPositive ? 'text-[#3A0F0F]' : 'text-[#B42318]'}`}>
            S/ {fmt(kpis.gananciaNeta)}
          </h3>
        </div>
      </div>

      {/* Cierres Evaluados */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3A0F0F] rounded-l-2xl"></div>
        <div className="p-3 bg-[#FAF7F4] text-[#3A0F0F] rounded-2xl shrink-0 border border-[#E9DFD9]">
          <PieChart size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider truncate">Cierres Evaluados</p>
          <h3 className="text-2xl font-black text-[#2C211F] mt-0.5 tabular-nums truncate">{kpis.totalTurnos}</h3>
        </div>
      </div>

      {/* Promedio Diferencia */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-3.5 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isDiffPositive ? 'bg-[#15803D]' : 'bg-[#B42318]'}`}></div>
        <div className={`p-3 rounded-2xl shrink-0 border ${isDiffPositive ? 'bg-emerald-50 text-[#15803D] border-emerald-100' : 'bg-rose-50 text-[#B42318] border-rose-100'}`}>
          <Activity size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#5D4B47] uppercase tracking-wider truncate">Prom. Descuadre</p>
          <h3 className={`text-xl font-black mt-0.5 tabular-nums truncate ${isDiffPositive ? 'text-[#15803D]' : 'text-[#B42318]'}`}>
            {isDiffPositive ? '+' : ''}S/ {fmt(kpis.promedioDiferencia)}
          </h3>
        </div>
      </div>
    </div>
  )
}
