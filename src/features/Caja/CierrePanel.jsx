import React, { useState } from 'react'
import { ShieldCheck, Banknote, Edit2, Check, X, CheckCircle, AlertTriangle, Calculator, ChevronDown, ChevronUp, ArrowRight, Smartphone } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Columna 3: Consolidado & Cierre de Caja.
 */
export function CierrePanel({
  turno, isAdmin,
  totalEfectivo = 0, totalDigitales = 0, totalGastos = 0, totalPropinas = 0, totalIngresosExtra = 0,
  ventasPOS = 0, ventasEfectivo = 0, montoEsperado = 0, diferencia = 0,
  extrasEfectivo = 0, extrasDigital = 0,
  gastosEfectivo = 0, gastosDigital = 0,
  propinasEfectivo = 0, propinasDigital = 0,
  editandoFondo, setEditandoFondo, nuevoFondo, setNuevoFondo,
  onGuardarFondo, onCerrarCaja,
}) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false)
  const diff = Number(diferencia || 0)
  const isOk = Math.abs(diff) < 0.01
  const isPositive = diff > 0.01
  const isNegative = diff < -0.01

  // Total digital neto en cuentas
  const totalDigitalNeto = Number(totalDigitales || 0) + Number(extrasDigital || 0) - Number(gastosDigital || 0) - Number(propinasDigital || 0)

  return (
    <div style={{ backgroundColor: '#211716' }} className="rounded-2xl card-soft flex flex-col relative overflow-hidden border border-[#3A0F0F] shadow-lg text-white h-full">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Diferenciado — Ejecutivo Oscuro */}
        <div className="px-4 py-3 border-b border-[#3A0F0F] flex items-center justify-between bg-[#1A1211]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#3A0F0F] border border-[#D6A24A]/40 text-[#E7C77A] rounded-lg flex items-center justify-center shadow-2xs">
              <ShieldCheck size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-bold text-[#FFF9F0] text-sm leading-tight">3. Consolidado & Cierre</h3>
              <p className="text-[10px] text-[#D8CBC5]">Cuadre de caja física</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#D6A24A]/20 text-[#E7C77A] rounded-md border border-[#D6A24A]/30">
            Auditoría
          </span>
        </div>

        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
          {/* PASO 1: Resumen de Flujo de Efectivo en Cajón */}
          <section className="bg-[#2C211F] p-3.5 rounded-xl border border-[#5D4B47]/30 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E7C77A] flex items-center gap-1">
                <Calculator size={13} />
                <span>1. Flujo de Gaveta Física</span>
              </span>
              <button 
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-[10px] text-[#D8CBC5] hover:text-[#FFF9F0] flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded border border-white/10"
              >
                <span>{showFormulaDetails ? 'Ocultar' : 'Ver'} POS</span>
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
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-[#D8CBC5] bg-black/25 p-2 rounded-lg">
                <div className="flex justify-between">
                  <span>Ventas POS (Total):</span>
                  <span className="font-bold text-white tabular-nums">S/ {fmt(ventasPOS)}</span>
                </div>
                <div className="flex justify-between text-sky-400">
                  <span>− Pagos Digitales (POS):</span>
                  <span className="font-bold tabular-nums">− S/ {fmt(totalDigitales)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#E7C77A] border-t border-white/10 pt-1">
                  <span>= Efectivo de Ventas POS:</span>
                  <span className="tabular-nums">S/ {fmt(ventasEfectivo)}</span>
                </div>
              </div>
            )}

            {/* Entradas y salidas físicas reales */}
            <div className="space-y-1 text-xs pt-1 border-t border-white/10">
              <div className="flex justify-between items-center text-[#D8CBC5]">
                <span>🏦 Fondo Inicial:</span>
                <span className="font-bold text-[#E7C77A] tabular-nums">S/ {fmt(turno?.monto_apertura)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D8CBC5]">💵 Efectivo de Ventas:</span>
                <span className="font-bold text-[#FFF9F0] tabular-nums">+ S/ {fmt(ventasEfectivo)}</span>
              </div>
              {Number(extrasEfectivo) > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>+ Extras en Efectivo:</span>
                  <span className="font-bold tabular-nums">+ S/ {fmt(extrasEfectivo)}</span>
                </div>
              )}
              {Number(gastosEfectivo) > 0 && (
                <div className="flex justify-between items-center text-rose-400">
                  <span>− Gastos en Efectivo:</span>
                  <span className="font-bold tabular-nums">− S/ {fmt(gastosEfectivo)}</span>
                </div>
              )}
              {Number(propinasEfectivo) > 0 && (
                <div className="flex justify-between items-center text-amber-300">
                  <span>− Propinas en Efectivo:</span>
                  <span className="font-bold tabular-nums">− S/ {fmt(propinasEfectivo)}</span>
                </div>
              )}
            </div>

            {/* Sección Digital (Banco) */}
            {(Number(totalDigitales) > 0 || Number(extrasDigital) > 0 || Number(gastosDigital) > 0 || Number(propinasDigital) > 0) && (
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-sky-300 bg-sky-950/30 px-2 py-1 rounded">
                <span className="flex items-center gap-1">
                  <Smartphone size={11} />
                  <span>Flujo Digital (Bancos/Yape):</span>
                </span>
                <span className="font-bold tabular-nums">S/ {fmt(totalDigitalNeto)}</span>
              </div>
            )}
          </section>

          {/* PASO 2: Comparativa Directa (Esperado en Cajón vs Contado en Caja 1) */}
          <section className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8CBC5] block">
              2. Comparativa de Efectivo en Cajón
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Tarjeta Esperado */}
              <div className="bg-[#2C211F] p-2.5 rounded-xl border border-white/10 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-[#D8CBC5] uppercase block">
                  📋 Esperado en Cajón
                </span>
                <span className="text-base sm:text-lg font-black text-white tabular-nums block">
                  S/ {fmt(montoEsperado)}
                </span>
                <span className="text-[9px] text-[#877571] block">Cálculo del sistema</span>
              </div>

              {/* Tarjeta Contado en Caja 1 */}
              <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-center gap-1">
                  <Banknote size={11} />
                  <span>Físico Contado</span>
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-400 tabular-nums block">
                  S/ {fmt(totalEfectivo)}
                </span>
                <span className="text-[9px] text-emerald-300/80 block">Arqueo de Caja 1</span>
              </div>
            </div>
          </section>

          {/* PASO 3: Resultado de Auditoría (Diferencia) */}
          <section className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8CBC5] block">
              3. Resultado del Cuadre
            </span>

            {isAdmin ? (
              <div className={`p-3 rounded-xl border text-center transition-all ${
                isOk ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' :
                isPositive ? 'bg-blue-950/40 border-blue-500/40 text-sky-400' :
                'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}>
                <p className="text-[10px] text-[#D8CBC5] uppercase tracking-widest font-bold">
                  Diferencia (Contado − Esperado)
                </p>
                <p className="text-2xl font-black tabular-nums my-0.5">
                  {diff > 0.001 ? '+' : ''}{fmt(diff)}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs font-bold">
                  {isOk && <span className="text-emerald-400">✓ Caja Cuadrada Exacta</span>}
                  {isPositive && <span className="text-sky-400">⚠️ Sobrante en Cajón (+S/ {fmt(diff)})</span>}
                  {isNegative && <span className="text-rose-400">⚠️ Faltante en Cajón (−S/ {fmt(Math.abs(diff))})</span>}
                </div>
              </div>
            ) : (
              <div className="bg-[#2C211F] p-3 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
                <AlertTriangle size={16} className="text-[#D6A24A]" />
                <p className="text-xs text-[#FFF9F0] font-bold uppercase tracking-wider">Cuadre Ciego Activo</p>
                <p className="text-[10px] text-[#D8CBC5]">El sistema registrará el arqueo y calculará la diferencia al guardar.</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer: Botón de Cierre */}
        <div className="p-4 border-t border-[#3A0F0F] bg-[#1A1211]">
          <button
            onClick={onCerrarCaja}
            style={{ backgroundColor: '#15803D' }}
            className="w-full py-3.5 hover:bg-[#166534] active:scale-[0.98] text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all border border-emerald-500/30"
          >
            <CheckCircle size={18} />
            <span>Confirmar Cierre de Turno</span>
            <ArrowRight size={16} className="ml-1 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  )
}
