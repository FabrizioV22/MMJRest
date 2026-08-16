import React from 'react'
import { Banknote, Coins } from 'lucide-react'
import { DENOMINACIONES } from './useCaja'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function EfectivoPanel({ arqueo, setArqueo, totalEfectivo }) {
  return (
    <div className="bg-white rounded-3xl card-soft border border-emerald-200/80 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header Diferenciado — Verde Esmeralda Cash */}
      <div className="px-5 py-4 border-b border-emerald-100 flex items-center justify-between bg-emerald-50/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-white border border-emerald-200 text-[#15803D] rounded-xl flex items-center justify-center shadow-xs">
            <Banknote size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[#15803D] text-sm tracking-tight">1. Efectivo Físico</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-[#15803D] rounded-full">
                Cajón
              </span>
            </div>
            <p className="text-[11px] text-[#5D4B47]">Arqueo de billetes y monedas en gaveta</p>
          </div>
        </div>
        <Coins size={18} className="text-emerald-400" />
      </div>

      {/* Grid header */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 text-[10px] font-bold text-[#877571] uppercase tracking-wider border-b border-[#E9DFD9]/60 bg-[#FAF7F4]">
          <span className="text-right pr-1">Denom.</span>
          <span></span>
          <span className="text-center">Cant.</span>
          <span></span>
          <span className="text-right">Subtotal</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E9DFD9]/40">
          {DENOMINACIONES.map((den, idx) => {
            const qty = arqueo[den] || 0
            const subtotal = den * qty
            const isBillete = den >= 10
            return (
              <div
                key={den}
                className={`px-4 py-2.5 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 group hover:bg-emerald-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F4]/30'}`}
              >
                <div className="w-[4.8rem] text-right flex items-center justify-end gap-1.5">
                  <span className={`text-[10px] font-bold px-1 rounded ${isBillete ? 'bg-emerald-100/70 text-[#15803D]' : 'bg-amber-100/60 text-amber-800'}`}>
                    {isBillete ? 'Billete' : 'Moneda'}
                  </span>
                  <span className="text-xs font-black tabular-nums text-[#2C211F]">
                    {den.toFixed(2)}
                  </span>
                </div>
                <span className="text-[#877571] text-[10px] font-bold w-3 text-center">×</span>
                <input
                  type="number" 
                  inputMode="decimal"
                  min="0" 
                  placeholder="0"
                  aria-label={`Cantidad de ${isBillete ? 'billetes' : 'monedas'} de ${den}`}
                  value={qty || ''}
                  onChange={e => setArqueo({ ...arqueo, [den]: parseInt(e.target.value) || 0 })}
                  className="w-full max-w-[4.5rem] mx-auto py-1.5 bg-white border border-[#D8CBC5] rounded-xl text-center font-black text-sm outline-none focus:border-[#15803D] focus:ring-3 focus:ring-emerald-500/10 min-h-[40px] text-[#2C211F] shadow-2xs"
                />
                <span className="text-[#877571] text-[10px] font-bold w-3 text-center">=</span>
                <div className="w-[5.2rem] text-right">
                  <span className={`text-sm font-black tabular-nums ${subtotal > 0 ? 'text-[#15803D]' : 'text-[#877571]'}`}>
                    S/ {fmt(subtotal)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Total Físico */}
      <div className="p-4 border-t-2 border-emerald-200 bg-emerald-50/90 flex justify-between items-center">
        <div>
          <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block">Total Efectivo Físico</span>
          <span className="text-[10px] text-[#5D4B47]">Conteo de billetes y monedas</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[#15803D] tabular-nums">S/ {fmt(totalEfectivo)}</span>
        </div>
      </div>
    </div>
  )
}
