import React from 'react'
import { Loader2, Clock } from 'lucide-react'
import { useCaja } from './useCaja'
import { AperturaView } from './AperturaView'
import { EfectivoPanel } from './EfectivoPanel'
import { FlujosPanel } from './FlujosPanel'
import { CierrePanel } from './CierrePanel'

export function CajaModule() {
  const caja = useCaja()

  // ── Loading ──
  if (caja.sedeLoading || caja.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
        <span className="text-sm text-slate-400 font-medium">Cargando caja...</span>
      </div>
    )
  }

  if (!caja.activeSede) {
    return <div className="p-12 text-center text-slate-500">No hay sede seleccionada.</div>
  }

  // ── Vista: Apertura ──
  if (!caja.turnoActivo) {
    return (
      <AperturaView
        sede={caja.activeSede.nombre}
        monto={caja.montoAperturaInput}
        setMonto={caja.setMontoAperturaInput}
        onSubmit={caja.handleAbrirCaja}
      />
    )
  }

  // ── Vista: Cuadre de Caja ──
  const showPropinas = caja.activeSede.nombre.toLowerCase().includes('pueblo libre') || caja.propinas.length > 0

  return (
    <div className="space-y-5 animate-fade-in-up pb-10">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Cuadre de Caja</h2>
        <div className="flex items-center space-x-3 mt-1">
          <span className="inline-flex items-center space-x-1.5 text-xs text-slate-400">
            <Clock size={12} />
            <span>
              Hora de apertura: {caja.turnoActivo.fecha_apertura
                ? new Date(caja.turnoActivo.fecha_apertura).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
                : '—'}
            </span>
          </span>
          <span className="text-slate-200">•</span>
          <span className="text-xs text-slate-500 font-medium">{caja.turnoActivo.usuarios?.nombre_completo}</span>
          <span className="text-slate-200">•</span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{caja.activeSede.nombre}</span>
        </div>
      </div>

      {/* Grid 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <EfectivoPanel
          arqueo={caja.arqueo}
          setArqueo={caja.setArqueo}
          totalEfectivo={caja.totalEfectivo}
        />

        <FlujosPanel
          ventasPOS={caja.ventasPOS} setVentasPOS={caja.setVentasPOS}
          digitales={caja.digitales} setDigitales={caja.setDigitales}
          ingresosExtra={caja.ingresosExtra} setIngresosExtra={caja.setIngresosExtra}
          gastos={caja.gastos} setGastos={caja.setGastos}
          propinas={caja.propinas} setPropinas={caja.setPropinas}
          showPropinas={showPropinas}
        />

        <CierrePanel
          turno={caja.turnoActivo}
          isAdmin={caja.isAdmin}
          totalEfectivo={caja.totalEfectivo}
          totalDigitales={caja.totalDigitales}
          totalGastos={caja.totalGastos}
          totalPropinas={caja.totalPropinas}
          totalIngresosExtra={caja.totalIngresosExtra}
          ventasPOS={caja.ventasPOS}
          montoEsperado={caja.montoEsperado}
          diferencia={caja.diferencia}
          editandoFondo={caja.editandoFondo} setEditandoFondo={caja.setEditandoFondo}
          nuevoFondo={caja.nuevoFondo} setNuevoFondo={caja.setNuevoFondo}
          onGuardarFondo={caja.handleGuardarFondo}
          onCerrarCaja={caja.handleCerrarCaja}
        />
      </div>
    </div>
  )
}
