import React, { useState } from 'react'
import { ShieldCheck, Banknote, Edit2, Check, X, CheckCircle, AlertTriangle, Calculator, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Columna 3: Consolidado & Cierre de Caja Simplificado en 3 Pasos Claros.
 */
export function CierrePanel({
  turno, isAdmin,
  totalEfectivo, totalDigitales, totalGastos, totalPropinas, totalIngresosExtra,
  ventasPOS, ventasEfectivo, montoEsperado, diferencia,
  extrasEfectivo = 0, gastosEfectivo = 0, propinasEfectivo = 0,
  editandoFondo, setEditandoFondo, nuevoFondo, setNuevoFondo,
  onGuardarFondo, onCerrarCaja,
}) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false)
  const diff = diferencia
  const isOk = Math.abs(diff) < 0.01
  const isPositive = diff > 0.01
  const isNegative = diff < -0.01

  return (
    <div style={{ backgroundColor: '#211716' }} className="rounded-3xl card-soft flex flex-col relative overflow-hidden border border-[#3A0F0F] shadow-lg text-white h-full">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Diferenciado — Ejecutivo Oscuro */}
        <div className="px-5 py-4 border-b border-[#3A0F0F] flex items-center justify-between bg-[#1A1211]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-[#3A0F0F] border border-[#D6A24A]/40 text-[#E7C77A] rounded-xl flex items-center justify-center shadow-xs">
              <ShieldCheck size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[#FFF9F0] text-sm tracking-tight">3. Consolidado & Cierre</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#D6A24A]/20 text-[#E7C77A] rounded-full border border-[#D6A24A]/30">
                  Auditoría
                </span>
              </div>
              <p className="text-[11px] text-[#D8CBC5]">Cuadre matemático del cajón físico</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {/* PASO 1: Resumen de Flujo de Efectivo en Cajón */}
          <section className="bg-[#2C211F] p-4 rounded-2xl border border-[#5D4B47]/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E7C77A] flex items-center gap-1.5">
                <Calculator size={13} />
                <span>Paso 1: Cálculo del Cajón</span>
              </span>
              <button 
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-[10px] text-[#D8CBC5] hover:text-[#FFF9F0] flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded-md border border-white/10"
              >
                <span>{showFormulaDetails ? 'Ocultar' : 'Ver'} detalles</span>
                {showFormulaDetails ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Fondo Inicial editable */}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
              <span className="text-[#D8CBC5]">Fondo Inicial (Apertura):</span>
              {editandoFondo ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="number" step="0.1" min="0" autoFocus
                    aria-label="Nuevo monto de fondo"
                    value={nuevoFondo} onChange={e => setNuevoFondo(e.target.value)}
                    className="w-20 py-0.5 px-2 bg-white text-[#2C211F] rounded font-bold text-xs outline-none"
                  />
                  <button onClick={onGuardarFondo} aria-label="Guardar fondo" title="Guardar" className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 cursor-pointer"><Check size={14} /></button>
                  <button onClick={() => setEditandoFondo(false)} aria-label="Cancelar" title="Cancelar" className="p-1 hover:bg-rose-500/20 rounded text-rose-400 cursor-pointer"><X size={14} /></button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold tabular-nums text-[#E7C77A]">S/ {fmt(turno?.monto_apertura)}</span>
                  <button onClick={() => { setNuevoFondo(turno?.monto_apertura); setEditandoFondo(true) }} aria-label="Editar fondo" title="Editar fondo inicial" className="text-[#877571] hover:text-white cursor-pointer">
                    <Edit2 size={11} />
                  </button>
                </div>
              )}
            </div>

            {/* Desglose desplegable opcional */}
            {showFormulaDetails && (
              <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-[#D8CBC5] bg-black/20 p-2.5 rounded-xl">
                <div className="flex justify-between">
                  <span>Ventas POS (Total):</span>
                  <span className="font-bold text-white tabular-nums">S/ {fmt(ventasPOS)}</span>
                </div>
                <div className="flex justify-between text-sky-400">
                  <span>− Pasarelas Digitales (Yape/Tarjetas):</span>
                  <span className="font-bold tabular-nums">− S/ {fmt(totalDigitales)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#E7C77A] border-t border-white/10 pt-1">
                  <span>= Efectivo de Ventas POS:</span>
                  <span className="tabular-nums">S/ {fmt(ventasEfectivo)}</span>
                </div>
              </div>
            )}

            {/* Resumen simplificado de entradas y salidas físicas */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-[#D8CBC5]">💵 Efectivo de Ventas (POS):</span>
                <span className="font-bold text-[#FFF9F0] tabular-nums">S/ {fmt(ventasEfectivo)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>+ Extras en Efectivo:</span>
                <span className="font-bold tabular-nums">+ S/ {fmt(extrasEfectivo || totalIngresosExtra)}</span>
              </div>
              <div className="flex justify-between items-center text-rose-400">
                <span>− Gastos/Propinas en Efectivo:</span>
                <span className="font-bold tabular-nums">− S/ {fmt((gastosEfectivo || 0) + (propinasEfectivo || 0) || (totalGastos + totalPropinas))}</span>
              </div>
            </div>
          </section>

          {/* PASO 2: Comparativa Visual Directa (Esperado vs Físico Contado) */}
          <section className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8CBC5] block">
              Paso 2: Comparativa Directa
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Tarjeta Esperado */}
              <div className="bg-[#2C211F] p-3 rounded-2xl border border-white/10 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#D8CBC5] uppercase block">
                  📋 Esperado en Cajón
                </span>
                <span className="text-lg sm:text-xl font-black text-white tabular-nums block">
                  S/ {fmt(montoEsperado)}
                </span>
                <span className="text-[9px] text-[#877571] block">Cálculo del sistema</span>
              </div>

              {/* Tarjeta Contado en Caja 1 */}
              <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-center gap-1">
                  <Banknote size={12} />
                  <span>Físico Contado</span>
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums block">
                  S/ {fmt(totalEfectivo)}
                </span>
                <span className="text-[9px] text-emerald-300/80 block">Arqueo de Caja 1</span>
              </div>
            </div>
          </section>

          {/* PASO 3: Resultado de Auditoría (Diferencia) */}
          <section className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8CBC5] block">
              Paso 3: Resultado del Cuadre
            </span>

            {isAdmin ? (
              <div className={`p-4 rounded-2xl border text-center transition-all ${
                isOk ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' :
                isPositive ? 'bg-blue-950/40 border-blue-500/40 text-sky-400' :
                'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}>
                <p className="text-[10px] text-[#D8CBC5] uppercase tracking-widest font-bold">
                  Diferencia de Cuadre
                </p>
                <p className="text-3xl font-black tabular-nums my-1">
                  {diff > 0.001 ? '+' : ''}{fmt(diff)}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                  {isOk && <span className="text-emerald-400">✓ Caja Cuadrada Exacta</span>}
                  {isPositive && <span className="text-sky-400">⚠️ Sobrante en Cajón (+S/ {fmt(diff)})</span>}
                  {isNegative && <span className="text-rose-400">⚠️ Faltante en Cajón (−S/ {fmt(Math.abs(diff))})</span>}
                </div>
              </div>
            ) : (
              <div className="bg-[#2C211F] p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1.5">
                <AlertTriangle size={18} className="text-[#D6A24A]" />
                <p className="text-xs text-[#FFF9F0] font-bold uppercase tracking-wider">Cuadre Ciego Activo</p>
                <p className="text-[11px] text-[#D8CBC5]">El sistema registrará el arqueo y calculará la diferencia automáticamente.</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer: Botón de Cierre */}
        <div className="p-5 border-t border-[#3A0F0F] bg-[#1A1211]">
          <button
            onClick={onCerrarCaja}
            style={{ backgroundColor: '#15803D' }}
            className="w-full py-4 hover:bg-[#166534] active:scale-[0.98] text-white rounded-2xl font-black text-base shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer transition-all border border-emerald-500/30"
          >
            <CheckCircle size={20} />
            <span>Confirmar Cierre de Turno</span>
            <ArrowRight size={18} className="ml-1 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  )
}
