import React from 'react'
import { ShieldCheck, Banknote, Edit2, Check, X, CheckCircle, AlertTriangle } from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Columna oscura de consolidado y cierre de caja.
 */
export function CierrePanel({
  turno, isAdmin,
  totalEfectivo, totalDigitales, totalGastos, totalPropinas, totalIngresosExtra,
  ventasPOS, montoEsperado, diferencia,
  editandoFondo, setEditandoFondo, nuevoFondo, setNuevoFondo,
  onGuardarFondo, onCerrarCaja,
}) {
  const diff = diferencia
  const diffColor = diff === 0 ? 'emerald' : diff > 0 ? 'blue' : 'red'

  const diffBgMap = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    red: 'bg-red-500/10 border-red-500/20',
  }
  const diffTextMap = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
  }

  return (
    <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl card-soft flex flex-col relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-white/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Cierre de Caja</h3>
            <p className="text-[10px] text-slate-400">Consolidado de operaciones</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 px-5 py-4 space-y-2.5">
          {/* Fondo Inicial */}
          <SummaryRow label="Fondo Inicial">
            {editandoFondo ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number" step="0.1" min="0" autoFocus
                  aria-label="Nuevo monto de fondo"
                  value={nuevoFondo} onChange={e => setNuevoFondo(e.target.value)}
                  className="w-20 py-1 px-2 bg-white text-slate-900 rounded-lg font-bold text-xs outline-none"
                />
                <button onClick={onGuardarFondo} aria-label="Guardar fondo" className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 cursor-pointer"><Check size={14} /></button>
                <button onClick={() => setEditandoFondo(false)} aria-label="Cancelar" className="p-1 hover:bg-red-500/20 rounded text-red-400 cursor-pointer"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tabular-nums">S/ {fmt(turno.monto_apertura)}</span>
                <button onClick={() => { setNuevoFondo(turno.monto_apertura); setEditandoFondo(true) }} aria-label="Editar fondo" className="text-slate-500 hover:text-white cursor-pointer">
                  <Edit2 size={11} />
                </button>
              </div>
            )}
          </SummaryRow>

          <SummaryRow label="Ventas (POS)">
            <span className="text-sm font-bold tabular-nums text-slate-300">S/ {fmt(ventasPOS || 0)}</span>
          </SummaryRow>

          <SummaryRow label="Flujos Digitales">
            <span className="text-sm font-bold tabular-nums text-blue-400">− S/ {fmt(totalDigitales)}</span>
          </SummaryRow>

          <SummaryRow label="Gastos / Propinas">
            <span className="text-sm font-bold tabular-nums text-red-400">− S/ {fmt(totalGastos + totalPropinas)}</span>
          </SummaryRow>

          <SummaryRow label="Ingresos Extras" border>
            <span className="text-sm font-bold tabular-nums text-emerald-400">+ S/ {fmt(totalIngresosExtra)}</span>
          </SummaryRow>

          {/* Esperado */}
          <div className="pt-1 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-200">Efectivo Esperado</span>
            <span className="text-xl font-black tabular-nums text-white">S/ {fmt(montoEsperado)}</span>
          </div>

          {/* Efectivo Físico */}
          <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-emerald-500/20 mt-1">
            <span className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
              <Banknote size={14} />
              <span>Efectivo Físico</span>
            </span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">S/ {fmt(totalEfectivo)}</span>
          </div>
        </div>

        {/* Cuadre + Botón */}
        <div className="px-5 pb-5 space-y-4">
          {isAdmin ? (
            <div className={`p-4 rounded-xl border text-center ${diffBgMap[diffColor]}`}>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Cuadre (Diferencia)</p>
              <p className={`text-3xl font-black tabular-nums ${diffTextMap[diffColor]}`}>
                {diff > 0 ? '+' : ''}{fmt(diff)}
              </p>
              <p className={`text-[10px] mt-1 font-medium ${diffTextMap[diffColor]} opacity-70`}>
                {diff === 0 ? '✓ Caja cuadrada' : diff > 0 ? 'Sobrante detectado' : 'Faltante detectado'}
              </p>
            </div>
          ) : (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle size={20} className="text-slate-500" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cuadre Ciego Activo</p>
              <p className="text-[10px] text-slate-500">La diferencia se registra internamente.</p>
            </div>
          )}

          <button
            onClick={onCerrarCaja}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <CheckCircle size={20} />
            <span>Confirmar Cierre</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/** Fila reutilizable del resumen financiero */
function SummaryRow({ label, children, border }) {
  return (
    <div className={`flex justify-between items-center ${border ? 'pb-3 border-b border-white/10' : ''}`}>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      {children}
    </div>
  )
}
