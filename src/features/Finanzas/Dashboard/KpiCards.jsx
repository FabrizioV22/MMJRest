import React from 'react'
import { TrendingUp, PieChart, Activity } from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function KpiCards({ kpis }) {
  const isDiffPositive = kpis.promedioDiferencia >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
      <div className="bg-white p-6 rounded-2xl card-soft border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl"></div>
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
          <TrendingUp size={26} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Operativos</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">S/ {fmt(kpis.ingresosTotales)}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl card-soft border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"></div>
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
          <PieChart size={26} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cierres Evaluados</p>
          <h3 className="text-3xl font-black text-slate-900 mt-0.5 tabular-nums">{kpis.totalTurnos}</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl card-soft border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isDiffPositive ? 'bg-blue-500' : 'bg-red-500'}`}></div>
        <div className={`p-3.5 rounded-2xl ${isDiffPositive ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
          <Activity size={26} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Diferencia</p>
          <h3 className={`text-2xl font-black mt-0.5 tabular-nums ${isDiffPositive ? 'text-blue-600' : 'text-red-600'}`}>
            {isDiffPositive ? '+' : ''}S/ {fmt(kpis.promedioDiferencia)}
          </h3>
        </div>
      </div>
    </div>
  )
}
