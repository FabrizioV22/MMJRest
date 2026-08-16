import React from 'react'
import { Banknote, CheckCircle } from 'lucide-react'

/**
 * Vista de apertura de caja cuando no hay turno activo.
 */
export function AperturaView({ sede, monto, setMonto, onSubmit }) {
  return (
    <div className="max-w-sm mx-auto mt-12 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl card-soft border border-[#E9DFD9] text-center shadow-lg">
        <div className="w-20 h-20 bg-[#FFF9F0] border border-[#E7C77A] text-[#D6A24A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Banknote size={36} strokeWidth={1.75} />
        </div>
        <h2 className="text-2xl font-bold text-[#2C211F] mb-1">Apertura de Caja</h2>
        <p className="text-[#5D4B47] text-sm mb-6">
          Sede <strong className="text-[#A80F14]">{sede}</strong> — Sin turno activo
        </p>

        <form onSubmit={onSubmit} className="space-y-5 text-left">
          <div>
            <label htmlFor="fondo-apertura" className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2 text-center">
              Monto de Apertura (Fondo Inicial)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#877571] font-bold text-lg select-none">S/</span>
              <input
                id="fondo-apertura"
                type="number" step="0.1" min="0" required autoFocus
                value={monto} onChange={e => setMonto(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#FAF7F4] border-2 border-[#D8CBC5] rounded-2xl font-black text-[#2C211F] text-2xl outline-none focus:border-[#A80F14] focus:bg-white text-center"
                placeholder="0.00"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-[#A80F14] hover:bg-[#7F0C10] active:scale-[0.98] text-[#FFF9F0] rounded-2xl font-bold text-base shadow-md hover:shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer transition-all">
            <CheckCircle size={20} />
            <span>Abrir Turno de Caja</span>
          </button>
        </form>
      </div>
    </div>
  )
}
