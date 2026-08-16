import React from 'react'
import { CreditCard, Plus, Trash2, TrendingDown, Receipt, Sparkles, Smartphone, Banknote } from 'lucide-react'
import { METODOS_DIGITALES } from './useCaja'

/**
 * Columna 2: Azul Tecnológico / Ventas POS, Pasarelas Digitales, Extras y Gastos.
 */
export function FlujosPanel({
  ventasPOS, setVentasPOS,
  digitales, setDigitales,
  ingresosExtra, setIngresosExtra,
  gastos, setGastos,
  propinas, setPropinas,
  showPropinas,
}) {
  return (
    <div className="bg-white rounded-3xl card-soft border border-blue-200/80 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header Diferenciado — Azul Tecnológico / Digital */}
      <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-white border border-blue-200 text-[#2563EB] rounded-xl flex items-center justify-center shadow-xs">
            <CreditCard size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[#2563EB] text-sm tracking-tight">2. Ventas y Flujos</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-[#2563EB] rounded-full">
                POS & Operaciones
              </span>
            </div>
            <p className="text-[11px] text-[#5D4B47]">Reporte del sistema, pasarelas y movimientos</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* 1. Ventas POS */}
        <section className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/80 space-y-2">
          <label htmlFor="ventas-pos" className="block text-xs font-bold text-[#1E40AF] uppercase tracking-wider">
            Ventas del Sistema (Reporte POS)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2563EB] font-bold text-base select-none">S/</span>
            <input
              id="ventas-pos"
              type="number" 
              inputMode="decimal"
              step="0.1" 
              min="0" 
              placeholder="0.00"
              value={ventasPOS} 
              onChange={e => setVentasPOS(e.target.value)}
              className="w-full py-3 pl-10 pr-4 bg-white border-2 border-blue-200 rounded-xl font-black text-xl outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-500/10 text-[#1E293B] shadow-2xs min-h-[46px]"
            />
          </div>
          <p className="text-[11px] text-[#64748B]">Total del reporte Z/X que emite el software POS (incluye fondo de apertura).</p>
        </section>

        {/* 2. Pasarelas Digitales */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={14} className="text-[#2563EB]" />
              <span>Desglose Digital (POS)</span>
            </h4>
            <span className="text-[10px] text-[#877571] font-semibold">Se descuentan del efectivo</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {METODOS_DIGITALES.map(metodo => {
              const tagColor = 
                metodo === 'Yape' ? 'text-purple-700 bg-purple-50 border-purple-200' :
                metodo === 'Plin' ? 'text-sky-700 bg-sky-50 border-sky-200' :
                metodo === 'Visa' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                'text-slate-700 bg-slate-50 border-slate-200'

              return (
                <div key={metodo} className="p-2.5 rounded-xl border border-[#E9DFD9] bg-[#FAF7F4]/50 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor={`digital-${metodo}`} className="text-xs font-bold text-[#2C211F]">{metodo}</label>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${tagColor}`}>
                      {metodo}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#877571] text-xs font-bold select-none">S/</span>
                    <input
                      id={`digital-${metodo}`}
                      type="number" 
                      inputMode="decimal"
                      step="0.1" 
                      min="0" 
                      placeholder="0.00"
                      value={digitales[metodo] || ''} 
                      onChange={e => setDigitales({ ...digitales, [metodo]: e.target.value })}
                      className="w-full py-1.5 pl-7 pr-2.5 bg-white border border-[#D8CBC5] rounded-lg font-bold text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 min-h-[38px] text-[#2C211F] text-right"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. Ingresos Extra (con selector Físico / Digital) */}
        <ListaMovimientosFlexible
          titulo="Ingresos Extras"
          subtitulo="Baño, propinas, fresquitos u otros"
          icon={<Sparkles size={14} className="text-[#D6A24A]" />}
          items={ingresosExtra}
          setItems={setIngresosExtra}
          placeholderDesc="Concepto (ej: Baño, Bebidas)..."
          defaultItem={{ desc: '', monto: '', metodo: 'Efectivo' }}
          accentColor="amber"
        />

        {/* 4. Gastos (con selector Físico / Digital) */}
        <ListaMovimientosFlexible
          titulo="Gastos Operativos"
          subtitulo="Compras menores, insumos, movilidades"
          icon={<TrendingDown size={14} className="text-[#B42318]" />}
          items={gastos}
          setItems={setGastos}
          placeholderDesc="Detalle del gasto (ej: Limones, Hielo)..."
          defaultItem={{ desc: '', monto: '', metodo: 'Efectivo' }}
          accentColor="rose"
        />

        {/* 5. Propinas (Opcional según sede) */}
        {showPropinas && (
          <ListaMovimientosFlexible
            titulo="Propinas a Personal"
            subtitulo="Reparto o anticipos de propina"
            icon={<Receipt size={14} className="text-[#15803D]" />}
            items={propinas}
            setItems={setPropinas}
            placeholderDesc="Nombre del mesero..."
            defaultItem={{ desc: '', monto: '', metodo: 'Efectivo' }}
            accentColor="emerald"
          />
        )}
      </div>
    </div>
  )
}

/**
 * Componente dinámico de lista con selector de método de pago:
 * [ 💵 Efectivo (Afecta cajón) ] | [ 📱 Digital (No afecta cajón) ]
 */
function ListaMovimientosFlexible({ titulo, subtitulo, icon, items, setItems, placeholderDesc, defaultItem, accentColor }) {
  const addItem = () => setItems([...items, { ...defaultItem }])
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx, field, value) => {
    const updated = [...items]
    updated[idx][field] = value
    setItems(updated)
  }

  const btnBg = 
    accentColor === 'rose' ? 'bg-rose-50 hover:bg-rose-100 text-[#B42318] border-rose-200' :
    accentColor === 'emerald' ? 'bg-emerald-50 hover:bg-emerald-100 text-[#15803D] border-emerald-200' :
    'bg-[#FFF9F0] hover:bg-[#F8EEDF] text-[#3A0F0F] border-[#E7C77A]'

  return (
    <section className="space-y-3 pt-2 border-t border-[#E9DFD9]/70">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider flex items-center space-x-1.5">
            {icon}
            <span>{titulo}</span>
          </h4>
          {subtitulo && <p className="text-[10px] text-[#877571]">{subtitulo}</p>}
        </div>
        <button
          onClick={addItem}
          className={`text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center cursor-pointer transition-colors border shadow-2xs ${btnBg}`}
        >
          <Plus size={12} className="mr-1" /> Agregar
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item, i) => {
          const isEfectivo = (item.metodo || 'Efectivo') === 'Efectivo'
          return (
            <div key={i} className="p-3 bg-[#FAF7F4] rounded-2xl border border-[#E9DFD9] space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text" 
                  placeholder={placeholderDesc}
                  aria-label={`${titulo} descripción ${i + 1}`}
                  value={item.desc}
                  onChange={e => updateItem(i, 'desc', e.target.value)}
                  className="flex-1 py-1.5 px-3 bg-white border border-[#D8CBC5] rounded-xl text-xs font-semibold outline-none focus:border-[#2563EB] min-h-[38px] text-[#2C211F]"
                />
                <div className="relative w-28 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#877571] text-xs font-bold select-none">S/</span>
                  <input
                    type="number" 
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-label={`${titulo} monto ${i + 1}`}
                    value={item.monto}
                    onChange={e => updateItem(i, 'monto', e.target.value)}
                    className="w-full py-1.5 pl-7 pr-2.5 bg-white border border-[#D8CBC5] rounded-xl text-xs font-black outline-none focus:border-[#2563EB] text-right min-h-[38px] text-[#2C211F]"
                  />
                </div>
                <button
                  onClick={() => removeItem(i)}
                  aria-label={`Eliminar ${titulo} ${i + 1}`}
                  className="p-2 text-[#877571] hover:text-[#B42318] hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Selector de Medio: Físico vs Digital */}
              <div className="flex items-center justify-between pt-1 border-t border-[#E9DFD9]/50 text-[11px]">
                <span className="text-[#877571] text-[10px] font-bold uppercase">Medio de Pago:</span>
                <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-[#D8CBC5]">
                  <button
                    type="button"
                    onClick={() => updateItem(i, 'metodo', 'Efectivo')}
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                      isEfectivo 
                        ? 'bg-emerald-100 text-[#15803D] shadow-xs' 
                        : 'text-[#877571] hover:text-[#2C211F]'
                    }`}
                    title="Afecta directamente el dinero físico del cajón"
                  >
                    <Banknote size={11} />
                    <span>💵 Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(i, 'metodo', 'Digital')}
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                      !isEfectivo 
                        ? 'bg-blue-100 text-[#2563EB] shadow-xs' 
                        : 'text-[#877571] hover:text-[#2C211F]'
                    }`}
                    title="Transferencia / Yape / Banco (No sale del cajón físico)"
                  >
                    <Smartphone size={11} />
                    <span>📱 Digital</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="text-xs text-[#877571] text-center py-2 italic bg-[#FAF7F4] rounded-xl border border-dashed border-[#E9DFD9]">
            Sin registros en esta sección
          </p>
        )}
      </div>
    </section>
  )
}
