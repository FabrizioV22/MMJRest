import React from 'react'
import { CreditCard, Plus, Trash2, TrendingDown, Receipt } from 'lucide-react'
import { METODOS_DIGITALES } from './useCaja'

/**
 * Columna de ventas, flujos digitales, gastos y propinas.
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
    <div className="bg-white rounded-2xl card-soft border border-[#E9DFD9] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E9DFD9] flex items-center space-x-2.5 bg-[#FAF7F4] rounded-t-2xl">
        <div className="w-8 h-8 bg-[#FFF9F0] border border-[#E7C77A] text-[#D6A24A] rounded-lg flex items-center justify-center">
          <CreditCard size={16} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-[#2C211F] text-sm">Ventas y Flujos</h3>
          <p className="text-[10px] text-[#877571]">Digitales, gastos y extras</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Ventas POS */}
        <section>
          <label htmlFor="ventas-pos" className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2">
            Ventas del Sistema (POS)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A80F14] font-bold text-sm select-none">S/</span>
            <input
              id="ventas-pos"
              type="number" 
              inputMode="decimal"
              step="0.1" 
              min="0" 
              placeholder="Total de ventas..."
              value={ventasPOS} 
              onChange={e => setVentasPOS(e.target.value)}
              className="w-full py-3 pl-10 pr-3 bg-[#FFF9F0] border-2 border-[#D6A24A]/50 rounded-xl font-black text-lg outline-none focus:border-[#A80F14] focus:bg-white text-[#2C211F] min-h-[44px]"
            />
          </div>
          <p className="text-[10px] text-[#877571] mt-1.5 ml-0.5">Ingresa el total que marca el reporte del sistema POS (incluye fondo de apertura).</p>
        </section>

        {/* Digitales */}
        <section>
          <h4 className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2.5">Desglose Digital</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {METODOS_DIGITALES.map(metodo => (
              <div key={metodo}>
                <label htmlFor={`digital-${metodo}`} className="block text-[10px] font-bold text-[#877571] mb-1">{metodo}</label>
                <input
                  id={`digital-${metodo}`}
                  type="number" 
                  inputMode="decimal"
                  step="0.1" 
                  min="0" 
                  placeholder="0.00"
                  value={digitales[metodo]} 
                  onChange={e => setDigitales({ ...digitales, [metodo]: e.target.value })}
                  className="w-full py-2 px-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl font-bold text-sm outline-none focus:border-[#A80F14] focus:ring-2 focus:ring-[#A80F14]/10 min-h-[40px] text-[#2C211F]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Ingresos Extra */}
        <section>
          <h4 className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2.5">Ingresos Extra (Efectivo)</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(ingresosExtra).map(k => (
              <div key={k}>
                <label htmlFor={`extra-${k}`} className="block text-[10px] font-bold text-[#877571] mb-1">{k}</label>
                <input
                  id={`extra-${k}`}
                  type="number" 
                  inputMode="decimal"
                  step="0.1" 
                  min="0" 
                  placeholder="0.00"
                  value={ingresosExtra[k]} 
                  onChange={e => setIngresosExtra({ ...ingresosExtra, [k]: e.target.value })}
                  className="w-full py-2 px-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl font-bold text-sm outline-none focus:border-[#A80F14] text-[#2C211F] min-h-[40px]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Gastos */}
        <ListaMovimientos
          titulo="Gastos (Efectivo)"
          icon={<TrendingDown size={12} className="text-[#B42318]" />}
          items={gastos}
          setItems={setGastos}
          placeholderDesc="Detalle del gasto..."
          emptyText="Sin gastos registrados"
        />

        {/* Propinas */}
        {showPropinas && (
          <ListaMovimientos
            titulo="Propinas Meseros"
            icon={<Receipt size={12} className="text-[#D6A24A]" />}
            items={propinas}
            setItems={setPropinas}
            placeholderDesc="Nombre del mesero..."
          />
        )}
      </div>
    </div>
  )
}

/**
 * Componente reutilizable para listas dinámicas (gastos / propinas).
 */
function ListaMovimientos({ titulo, icon, items, setItems, placeholderDesc, emptyText }) {
  const addItem = () => setItems([...items, { desc: '', monto: '' }])
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx, field, value) => {
    const updated = [...items]
    updated[idx][field] = value
    setItems(updated)
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-2.5">
        <h4 className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider flex items-center space-x-1.5">
          {icon}
          <span>{titulo}</span>
        </h4>
        <button
          onClick={addItem}
          className="text-[10px] bg-[#FFF9F0] hover:bg-[#F8EEDF] text-[#3A0F0F] border border-[#E7C77A] px-2.5 py-1 rounded-lg font-bold flex items-center cursor-pointer transition-colors"
        >
          <Plus size={10} className="mr-1" /> Agregar
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <input
              type="text" 
              placeholder={placeholderDesc}
              aria-label={`${titulo} descripción ${i + 1}`}
              value={item.desc}
              onChange={e => updateItem(i, 'desc', e.target.value)}
              className="flex-1 py-2 px-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-medium outline-none focus:border-[#A80F14] focus:ring-2 focus:ring-[#A80F14]/10 min-h-[40px] text-[#2C211F]"
            />
            <div className="relative w-24 shrink-0">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#877571] text-[10px] font-bold select-none">S/</span>
              <input
                type="number" 
                inputMode="decimal"
                placeholder="0.00"
                aria-label={`${titulo} monto ${i + 1}`}
                value={item.monto}
                onChange={e => updateItem(i, 'monto', e.target.value)}
                className="w-full py-2 pl-7 pr-2 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-bold outline-none focus:border-[#A80F14] text-right min-h-[40px] text-[#2C211F]"
              />
            </div>
            <button
              onClick={() => removeItem(i)}
              aria-label={`Eliminar ${titulo} ${i + 1}`}
              className="p-2 text-[#877571] hover:text-[#B42318] hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && emptyText && <p className="text-xs text-[#877571] text-center py-2 font-medium">{emptyText}</p>}
      </div>
    </section>
  )
}
