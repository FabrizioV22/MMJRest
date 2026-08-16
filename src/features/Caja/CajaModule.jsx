import React, { useState } from 'react'
import { Loader2, Clock, Banknote, CreditCard, Lock } from 'lucide-react'
import { useCaja } from './useCaja'
import { AperturaView } from './AperturaView'
import { EfectivoPanel } from './EfectivoPanel'
import { FlujosPanel } from './FlujosPanel'
import { CierrePanel } from './CierrePanel'

export function CajaModule() {
  const caja = useCaja()
  const [activeMobileTab, setActiveMobileTab] = useState('EFECTIVO') // 'EFECTIVO' | 'FLUJOS' | 'CIERRE'

  // ── Loading ──
  if (caja.sedeLoading || caja.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="animate-spin text-[#A80F14]" size={36} />
        <span className="text-sm text-[#5D4B47] font-medium">Cargando estado de caja...</span>
      </div>
    )
  }

  if (!caja.activeSede) {
    return <div className="p-12 text-center text-[#5D4B47] font-medium">No hay sede seleccionada.</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-[#2C211F]">Cuadre de Caja</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center space-x-1.5 text-xs text-[#877571]">
              <Clock size={12} />
              <span>
                Apertura: {caja.turnoActivo.fecha_apertura
                  ? new Date(caja.turnoActivo.fecha_apertura).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
                  : '—'}
              </span>
            </span>
            <span className="text-[#D8CBC5] hidden sm:inline">•</span>
            <span className="text-xs text-[#5D4B47] font-medium">{caja.turnoActivo.usuarios?.nombre_completo}</span>
            <span className="text-[#D8CBC5] hidden sm:inline">•</span>
            <span className="text-xs font-bold text-[#3A0F0F] bg-[#FFF9F0] border border-[#E7C77A] px-2.5 py-0.5 rounded-full">{caja.activeSede.nombre}</span>
          </div>
        </div>

        {/* Mobile Tabs Switcher (lg:hidden) */}
        <div className="flex lg:hidden p-1 bg-white border border-[#E9DFD9] rounded-2xl shadow-sm text-xs font-bold mt-2 sm:mt-0">
          <button
            onClick={() => setActiveMobileTab('EFECTIVO')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeMobileTab === 'EFECTIVO' ? 'bg-[#A80F14] text-[#FFF9F0] shadow-sm font-bold' : 'text-[#5D4B47] hover:text-[#2C211F]'
            }`}
          >
            <Banknote size={15} />
            <span>Físico</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('FLUJOS')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeMobileTab === 'FLUJOS' ? 'bg-[#A80F14] text-[#FFF9F0] shadow-sm font-bold' : 'text-[#5D4B47] hover:text-[#2C211F]'
            }`}
          >
            <CreditCard size={15} />
            <span>Flujos</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('CIERRE')}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
              activeMobileTab === 'CIERRE' ? 'bg-[#A80F14] text-[#FFF9F0] shadow-sm font-bold' : 'text-[#5D4B47] hover:text-[#2C211F]'
            }`}
          >
            <Lock size={15} />
            <span>Cierre</span>
          </button>
        </div>
      </div>

      {/* Grid Desktop & Render Condicional Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Panel 1: Efectivo Físico */}
        <div className={`${activeMobileTab === 'EFECTIVO' ? 'block' : 'hidden'} lg:block lg:col-span-4`}>
          <EfectivoPanel
            arqueo={caja.arqueo}
            setArqueo={caja.setArqueo}
            totalEfectivo={caja.totalEfectivo}
          />
        </div>

        {/* Panel 2: Ventas y Flujos */}
        <div className={`${activeMobileTab === 'FLUJOS' ? 'block' : 'hidden'} lg:block lg:col-span-4`}>
          <FlujosPanel
            ventasPOS={caja.ventasPOS} setVentasPOS={caja.setVentasPOS}
            digitales={caja.digitales} setDigitales={caja.setDigitales}
            ingresosExtra={caja.ingresosExtra} setIngresosExtra={caja.setIngresosExtra}
            gastos={caja.gastos} setGastos={caja.setGastos}
            propinas={caja.propinas} setPropinas={caja.setPropinas}
            showPropinas={showPropinas}
          />
        </div>

        {/* Panel 3: Cierre de Caja */}
        <div className={`${activeMobileTab === 'CIERRE' ? 'block' : 'hidden'} lg:block lg:col-span-4`}>
          <CierrePanel
            turno={caja.turnoActivo}
            isAdmin={caja.isAdmin}
            totalEfectivo={caja.totalEfectivo}
            totalDigitales={caja.totalDigitales}
            totalGastos={caja.totalGastos}
            totalPropinas={caja.totalPropinas}
            totalIngresosExtra={caja.totalIngresosExtra}
            ventasPOS={caja.ventasPOS}
            ventasEfectivo={caja.ventasEfectivo}
            montoEsperado={caja.montoEsperado}
            diferencia={caja.diferencia}
            editandoFondo={caja.editandoFondo} setEditandoFondo={caja.setEditandoFondo}
            nuevoFondo={caja.nuevoFondo} setNuevoFondo={caja.setNuevoFondo}
            onGuardarFondo={caja.handleGuardarFondo}
            onCerrarCaja={caja.handleCerrarCaja}
          />
        </div>
      </div>
    </div>
  )
}
