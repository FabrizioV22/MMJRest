import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function KpiCards({ kpis }) {
  const isDiffPositive = kpis.promedioDiferencia >= 0
  const isNetPositive = kpis.gananciaNeta >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
      {/* Ingresos Operativos */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600 rounded-l-2xl"></div>
        <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl shrink-0">
          <TrendingUp size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Ingresos Operativos</p>
          <h3 className="text-xl font-black text-slate-900 mt-0.5 tabular-nums truncate">S/ {fmt(kpis.ingresosTotales)}</h3>
        </div>
      </div>

      {/* Total Egresos */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-600 rounded-l-2xl"></div>
        <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl shrink-0">
          <TrendingDown size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Egresos</p>
          <h3 className="text-xl font-black text-rose-700 mt-0.5 tabular-nums truncate">S/ {fmt(kpis.egresosTotales)}</h3>
        </div>
      </div>

      {/* Ganancia Neta */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-3.5 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isNetPositive ? 'bg-amber-600' : 'bg-rose-600'}`}></div>
        <div className={`p-3 rounded-2xl shrink-0 ${isNetPositive ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-700'}`}>
          <DollarSign size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Ganancia Neta</p>
          <h3 className={`text-xl font-black mt-0.5 tabular-nums truncate ${isNetPositive ? 'text-amber-900' : 'text-rose-700'}`}>
            S/ {fmt(kpis.gananciaNeta)}
          </h3>
        </div>
      </div>

      {/* Cierres Evaluados */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-3.5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-700 rounded-l-2xl"></div>
        <div className="p-3 bg-stone-100 text-stone-700 rounded-2xl shrink-0">
          <PieChart size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Cierres Evaluados</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums truncate">{kpis.totalTurnos}</h3>
        </div>
      </div>

      {/* Promedio Diferencia */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-3.5 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isDiffPositive ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
        <div className={`p-3 rounded-2xl shrink-0 ${isDiffPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          <Activity size={22} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Prom. Descuadre</p>
          <h3 className={`text-xl font-black mt-0.5 tabular-nums truncate ${isDiffPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
            {isDiffPositive ? '+' : ''}S/ {fmt(kpis.promedioDiferencia)}
          </h3>
        </div>
      </div>
    </div>
  )
}
