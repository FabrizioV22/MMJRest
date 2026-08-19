import React from 'react'
import { Banknote } from 'lucide-react'
import { DENOMINACIONES } from './useCaja'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function EfectivoPanel({ arqueo, setArqueo, totalEfectivo }) {
  return (
    <div className="bg-white rounded-2xl card-soft border border-emerald-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header Compacto Verde Esmeralda */}
      <div className="px-4 py-3 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/70">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white border border-emerald-200 text-[#15803D] rounded-lg flex items-center justify-center shadow-2xs">
            <Banknote size={16} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-bold text-[#15803D] text-sm leading-tight">1. Efectivo Físico</h3>
            <p className="text-[10px] text-[#5D4B47]">Arqueo en caja</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100/80 text-[#15803D] rounded-md">
          Cajón
        </span>
      </div>

      {/* Grid Denominaciones */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E9DFD9]/40">
        {DENOMINACIONES.map((den, idx) => {
          const qty = arqueo[den] || 0
          const subtotal = den * qty
          return (
            <div
              key={den}
              className={`px-3 py-2 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 group hover:bg-emerald-50/20 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F4]/40'}`}
            >
              <div className="w-16 text-right">
                <span className="text-xs font-bold tabular-nums text-[#2C211F]">
                  S/ {den.toFixed(2)}
                </span>
              </div>
              <span className="text-[#877571] text-xs font-bold w-2 text-center">×</span>
              <input
                type="number" 
                inputMode="decimal"
                min="0" 
                placeholder="0"
                aria-label={`Cantidad de S/ ${den.toFixed(2)}`}
                value={qty || ''}
                onChange={e => setArqueo({ ...arqueo, [den]: parseInt(e.target.value) || 0 })}
                className="w-full max-w-[4.2rem] mx-auto py-1 px-2 bg-white border border-[#D8CBC5] rounded-lg text-center font-bold text-sm outline-none focus:border-[#15803D] focus:ring-2 focus:ring-emerald-500/10 min-h-[36px] text-[#2C211F]"
              />
              <span className="text-[#877571] text-xs font-bold w-2 text-center">=</span>
              <div className="w-18 text-right">
                <span className={`text-xs sm:text-sm font-black tabular-nums ${subtotal > 0 ? 'text-[#15803D]' : 'text-[#877571]'}`}>
                  S/ {fmt(subtotal)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Total */}
      <div className="p-3.5 border-t-2 border-emerald-200 bg-emerald-50/80 flex justify-between items-center">
        <span className="text-xs font-bold text-[#15803D] uppercase tracking-wider">Total en Cajón</span>
        <span className="text-xl font-black text-[#15803D] tabular-nums">S/ {fmt(totalEfectivo)}</span>
      </div>
    </div>
  )
}
