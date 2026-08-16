import React from 'react'
import { Banknote } from 'lucide-react'
import { DENOMINACIONES } from './useCaja'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function EfectivoPanel({ arqueo, setArqueo, totalEfectivo }) {
  return (
    <div className="bg-white rounded-2xl card-soft border border-[#E9DFD9] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E9DFD9] flex items-center space-x-2.5 bg-[#FAF7F4] rounded-t-2xl">
        <div className="w-8 h-8 bg-[#FFF9F0] border border-[#E7C77A] text-[#D6A24A] rounded-lg flex items-center justify-center">
          <Banknote size={16} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-[#2C211F] text-sm">Efectivo Físico</h3>
          <p className="text-[10px] text-[#877571]">Arqueo de billetes y monedas</p>
        </div>
      </div>

      {/* Grid header */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-1.5 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 text-[10px] font-bold text-[#877571] uppercase tracking-wider border-b border-[#E9DFD9]/60">
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
              className={`px-4 py-2 grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-x-2 group border-b border-[#E9DFD9]/50 hover:bg-[#FFF9F0]/60 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F4]/40'}`}
            >
              <div className="w-[4.5rem] text-right">
                <span className={`text-xs font-bold tabular-nums ${isBillete ? 'text-[#2C211F]' : 'text-[#5D4B47]'}`}>
                  S/ {den.toFixed(2)}
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
                className="w-full max-w-[4.5rem] mx-auto py-1.5 bg-white border border-[#D8CBC5] rounded-xl text-center font-bold text-sm outline-none focus:border-[#A80F14] focus:ring-2 focus:ring-[#A80F14]/10 min-h-[40px] text-[#2C211F]"
              />
              <span className="text-[#877571] text-[10px] font-bold w-3 text-center">=</span>
              <div className="w-[5rem] text-right">
                <span className={`text-sm font-black tabular-nums ${subtotal > 0 ? 'text-[#2C211F]' : 'text-[#877571]'}`}>
                  {fmt(subtotal)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t-2 border-[#D6A24A]/40 bg-[#FFF9F0] flex justify-between items-center rounded-b-2xl">
        <span className="text-xs font-bold text-[#3A0F0F] uppercase tracking-wider">Total en Caja Físico</span>
        <span className="text-2xl font-black text-[#A80F14] tabular-nums">S/ {fmt(totalEfectivo)}</span>
      </div>
    </div>
  )
}
