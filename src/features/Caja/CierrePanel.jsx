import React from 'react'
import { ShieldCheck, Banknote, Edit2, Check, X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Columna consolidada y cierre de caja con paleta oscura de Mama Julia (#211716).
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
    <div style={{ backgroundColor: '#211716' }} className="lg:col-span-4 text-white rounded-2xl card-soft flex flex-col relative overflow-hidden border border-[#3A0F0F]">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#3A0F0F] flex items-center justify-between bg-[#1A1211]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#3A0F0F] border border-[#D6A24A]/40 text-[#E7C77A] rounded-lg flex items-center justify-center">
              <ShieldCheck size={16} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-[#FFF9F0] text-sm">Cierre de Caja</h3>
              <p className="text-[10px] text-[#D8CBC5]">Consolidado de operaciones</p>
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
                  className="w-20 py-1 px-2 bg-white text-[#2C211F] rounded-lg font-bold text-xs outline-none"
                />
                <button onClick={onGuardarFondo} aria-label="Guardar fondo" title="Guardar" className="p-1 hover:bg-emerald-500/20 rounded text-[#15803D] cursor-pointer"><Check size={14} /></button>
                <button onClick={() => setEditandoFondo(false)} aria-label="Cancelar" title="Cancelar" className="p-1 hover:bg-red-500/20 rounded text-[#B42318] cursor-pointer"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tabular-nums text-[#E7C77A]">S/ {fmt(turno.monto_apertura)}</span>
                <button onClick={() => { setNuevoFondo(turno.monto_apertura); setEditandoFondo(true) }} aria-label="Editar fondo" title="Editar" className="text-[#877571] hover:text-white cursor-pointer">
                  <Edit2 size={11} />
                </button>
              </div>
            )}
          </SummaryRow>

          <SummaryRow label="Ventas POS (Total)">
            <span className="text-sm font-bold tabular-nums text-[#FFF9F0]">S/ {fmt(ventasPOS || 0)}</span>
          </SummaryRow>

          <SummaryRow label="Pagos Digitales">
            <span className="text-sm font-bold tabular-nums text-sky-400">− S/ {fmt(totalDigitales)}</span>
          </SummaryRow>

          <div className="py-1 px-2.5 bg-[#2C211F] rounded-lg border border-[#5D4B47]/30 flex justify-between items-center text-xs">
            <span className="text-[#D8CBC5] font-medium flex items-center gap-1">
              <Info size={12} className="text-[#D6A24A]" />
              <span>Efectivo de POS</span>
            </span>
            <span className="font-bold tabular-nums text-[#E7C77A]">S/ {fmt(ventasEfectivo || 0)}</span>
          </div>

          <SummaryRow label="Gastos / Propinas">
            <span className="text-sm font-bold tabular-nums text-rose-400">− S/ {fmt(totalGastos + totalPropinas)}</span>
          </SummaryRow>

          <SummaryRow label="Ingresos Extras" border>
            <span className="text-sm font-bold tabular-nums text-emerald-400">+ S/ {fmt(totalIngresosExtra)}</span>
          </SummaryRow>

          {/* Esperado */}
          <div className="pt-1 flex justify-between items-center">
            <span className="text-sm font-bold text-[#D8CBC5]">Efectivo Esperado</span>
            <span className="text-xl font-black tabular-nums text-[#FFF9F0]">S/ {fmt(montoEsperado)}</span>
          </div>

          {/* Efectivo Físico */}
          <div className="bg-[#2C211F] p-3 rounded-xl flex justify-between items-center border border-emerald-500/30 mt-1">
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
            <div className={`p-4 rounded-xl border text-center ${
              isOk ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' :
              isPositive ? 'bg-blue-950/30 border-blue-500/30 text-sky-400' :
              'bg-rose-950/30 border-rose-500/30 text-rose-400'
            }`}>
              <p className="text-[10px] text-[#D8CBC5] uppercase tracking-widest mb-1 font-bold">Cuadre (Diferencia)</p>
              <p className="text-3xl font-black tabular-nums">
                {diff > 0 ? '+' : ''}{fmt(diff)}
              </p>
              <p className="text-[10px] mt-1 font-medium opacity-90">
                {isOk ? '✓ Caja cuadrada exacta' : isPositive ? 'Sobrante detectado' : 'Faltante detectado'}
              </p>
            </div>
          ) : (
            <div className="bg-[#2C211F] p-4 rounded-xl border border-[#5D4B47]/30 flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle size={20} className="text-[#D6A24A]" />
              <p className="text-[10px] text-[#FFF9F0] font-bold uppercase tracking-widest">Cuadre Ciego Activo</p>
              <p className="text-[10px] text-[#D8CBC5]">La diferencia se calcula internamente al cerrar.</p>
            </div>
          )}

          {/* Botón Confirmar */}
          <button
            onClick={onCerrarCaja}
            style={{ backgroundColor: '#15803D' }}
            className="w-full py-4 hover:bg-[#166534] active:scale-[0.98] text-white rounded-xl font-bold text-base shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer transition-all"
          >
            <CheckCircle size={20} />
            <span>Confirmar Cierre de Turno</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, children, border }) {
  return (
    <div className={`flex justify-between items-center ${border ? 'pb-3 border-b border-[#3A0F0F]' : ''}`}>
      <span className="text-xs text-[#D8CBC5] font-medium">{label}</span>
      {children}
    </div>
  )
}
