import React from 'react'
import { Banknote } from 'lucide-react'
import { DENOMINACIONES } from './useCaja'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Columna de conteo de efectivo físico (billetes y monedas).
 */
export function EfectivoPanel({ arqueo, setArqueo, totalEfectivo }) {
  return (
    <div className="lg:col-span-4 bg-white rounded-2xl card-soft border border-slate-100 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
          <Banknote size={16} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Efectivo Físico</h3>
          <p className="text-[10px] text-slate-400">Billetes y monedas</p>
        </div>
      </div>

      {/* Grid header */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-1.5 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-50">
          <span className="text-right pr-1">Denom.</span>
          <span></span>
          <span className="text-center">Cant.</span>
          <span></span>
          <span className="text-right">Subtotal</span>
        </div>

        {/* Rows */}
        {DENOMINACIONES.map((den, idx) => {
          const qty = arqueo[den] || 0
          const subtotal = den * qty
          const isBillete = den >= 10
          return (
            <div
              key={den}
              className={`px-4 py-2 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 group border-b border-slate-50/80 hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
            >
              <div className="w-[4.5rem] text-right">
                <span className={`text-xs font-bold tabular-nums ${isBillete ? 'text-slate-800' : 'text-slate-500'}`}>
                  S/ {den.toFixed(2)}
                </span>
              </div>
              <span className="text-slate-300 text-[10px] font-bold w-3 text-center">×</span>
              <input
                type="number" min="0" placeholder="0"
                aria-label={`Cantidad de ${isBillete ? 'billetes' : 'monedas'} de ${den}`}
                value={qty || ''}
                onChange={e => setArqueo({ ...arqueo, [den]: parseInt(e.target.value) || 0 })}
                className="w-full max-w-[4rem] mx-auto py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
              />
              <span className="text-slate-300 text-[10px] font-bold w-3 text-center">=</span>
              <div className="w-[5rem] text-right">
                <span className={`text-sm font-black tabular-nums ${subtotal > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
                  {fmt(subtotal)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t-2 border-emerald-100 bg-emerald-50/40 flex justify-between items-center rounded-b-2xl">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total en Caja</span>
        <span className="text-2xl font-black text-emerald-600 tabular-nums">S/ {fmt(totalEfectivo)}</span>
      </div>
    </div>
  )
}
