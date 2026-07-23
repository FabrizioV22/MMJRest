import React from 'react'
import { Banknote, CheckCircle } from 'lucide-react'

/**
 * Vista de apertura de caja cuando no hay turno activo.
 */
export function AperturaView({ sede, monto, setMonto, onSubmit }) {
  return (
    <div className="max-w-sm mx-auto mt-16 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl card-soft border border-slate-100 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Banknote size={36} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-1">Apertura de Caja</h2>
        <p className="text-slate-400 text-sm mb-8">
          Sede <strong className="text-slate-600">{sede}</strong> — Sin turno activo
        </p>

        <form onSubmit={onSubmit} className="space-y-5 text-left">
          <div>
            <label htmlFor="fondo-apertura" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Monto de Apertura (Fondo)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg select-none">S/</span>
              <input
                id="fondo-apertura"
                type="number" step="0.1" min="0" required autoFocus
                value={monto} onChange={e => setMonto(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-800 text-2xl outline-none focus:border-emerald-500 focus:bg-white text-center"
                placeholder="0.00"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2.5 cursor-pointer">
            <CheckCircle size={20} />
            <span>Abrir Turno</span>
          </button>
        </form>
      </div>
    </div>
  )
}
