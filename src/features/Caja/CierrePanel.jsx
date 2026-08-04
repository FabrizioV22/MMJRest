import React from 'react'
import { ShieldCheck, Banknote, Edit2, Check, X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Columna oscura de consolidado y cierre de caja (#1F2937).
 */
export function CierrePanel({
  turno, isAdmin,
  totalEfectivo, totalDigitales, totalGastos, totalPropinas, totalIngresosExtra,
  ventasPOS, ventasEfectivo, montoEsperado, diferencia,
  editandoFondo, setEditandoFondo, nuevoFondo, setNuevoFondo,
  onGuardarFondo, onCerrarCaja,
}) {
  const diff = diferencia
  const isOk = diff === 0
  const isPositive = diff > 0

  return (
    <div style={{ backgroundColor: '#1F2937' }} className="lg:col-span-4 text-white rounded-2xl card-soft flex flex-col relative overflow-hidden border border-slate-700/60">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-white/10 text-emerald-400 rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Cierre de Caja</h3>
              <p className="text-[10px] text-slate-400">Consolidado de operaciones</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 px-5 py-4 space-y-2.5">
          {/* Fondo Inicial */}
          <SummaryRow label="Fondo Inicial (Incluido en POS)">
            {editandoFondo ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number" step="0.1" min="0" autoFocus
                  aria-label="Nuevo monto de fondo"
                  value={nuevoFondo} onChange={e => setNuevoFondo(e.target.value)}
                  className="w-20 py-1 px-2 bg-white text-slate-900 rounded-lg font-bold text-xs outline-none"
                />
                <button onClick={onGuardarFondo} aria-label="Guardar fondo" title="Guardar" className="p-1 hover:bg-emerald-500/20 rounded text-[#16A34A] cursor-pointer"><Check size={14} /></button>
                <button onClick={() => setEditandoFondo(false)} aria-label="Cancelar" title="Cancelar" className="p-1 hover:bg-red-500/20 rounded text-[#DC2626] cursor-pointer"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tabular-nums text-amber-300">S/ {fmt(turno.monto_apertura)}</span>
                <button onClick={() => { setNuevoFondo(turno.monto_apertura); setEditandoFondo(true) }} aria-label="Editar fondo" title="Editar" className="text-slate-400 hover:text-white cursor-pointer">
                  <Edit2 size={11} />
                </button>
              </div>
            )}
          </SummaryRow>

          <SummaryRow label="Ventas POS (Total)">
            <span className="text-sm font-bold tabular-nums text-slate-200">S/ {fmt(ventasPOS || 0)}</span>
          </SummaryRow>

          <SummaryRow label="Pagos Digitales">
            <span className="text-sm font-bold tabular-nums text-blue-400">− S/ {fmt(totalDigitales)}</span>
          </SummaryRow>

          <div className="py-1 px-2.5 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Info size={12} className="text-amber-400" />
              <span>Efectivo de POS</span>
            </span>
            <span className="font-bold tabular-nums text-amber-200">S/ {fmt(ventasEfectivo || 0)}</span>
          </div>

          <SummaryRow label="Gastos / Propinas">
            <span className="text-sm font-bold tabular-nums text-[#DC2626]">− S/ {fmt(totalGastos + totalPropinas)}</span>
          </SummaryRow>

          <SummaryRow label="Ingresos Extras" border>
            <span className="text-sm font-bold tabular-nums text-[#16A34A]">+ S/ {fmt(totalIngresosExtra)}</span>
          </SummaryRow>

          {/* Esperado */}
          <div className="pt-1 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-200">Efectivo Esperado</span>
            <span className="text-xl font-black tabular-nums text-white">S/ {fmt(montoEsperado)}</span>
          </div>

          {/* Efectivo Físico */}
          <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-emerald-500/20 mt-1">
            <span className="text-sm font-bold text-[#16A34A] flex items-center space-x-1.5">
              <Banknote size={14} />
              <span>Efectivo Físico</span>
            </span>
            <span className="text-xl font-black text-[#16A34A] tabular-nums">S/ {fmt(totalEfectivo)}</span>
          </div>
        </div>

        {/* Cuadre + Botón */}
        <div className="px-5 pb-5 space-y-4">
          {isAdmin ? (
            <div className={`p-4 rounded-xl border text-center ${
              isOk ? 'bg-emerald-500/10 border-emerald-500/20 text-[#16A34A]' :
              isPositive ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              'bg-rose-500/10 border-rose-500/20 text-[#DC2626]'
            }`}>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Cuadre (Diferencia)</p>
              <p className="text-3xl font-black tabular-nums">
                {diff > 0 ? '+' : ''}{fmt(diff)}
              </p>
              <p className="text-[10px] mt-1 font-medium opacity-80">
                {isOk ? '✓ Caja cuadrada' : isPositive ? 'Sobrante detectado' : 'Faltante detectado'}
              </p>
            </div>
          ) : (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle size={20} className="text-slate-400" />
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Cuadre Ciego Activo</p>
              <p className="text-[10px] text-slate-400">La diferencia se registra internamente.</p>
            </div>
          )}

          {/* Botón Confirmar */}
          <button
            onClick={onCerrarCaja}
            style={{ backgroundColor: '#16A34A' }}
            className="w-full py-4 hover:bg-[#15803D] active:scale-[0.98] text-white rounded-xl font-bold text-base shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer transition-all"
          >
            <CheckCircle size={20} />
            <span>Confirmar Cierre</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, children, border }) {
  return (
    <div className={`flex justify-between items-center ${border ? 'pb-3 border-b border-white/10' : ''}`}>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      {children}
    </div>
  )
}
