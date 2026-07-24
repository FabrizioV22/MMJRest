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
    <div className="lg:col-span-4 bg-white rounded-2xl card-soft border border-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center space-x-2.5">
        <div className="w-8 h-8 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center">
          <CreditCard size={16} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Ventas y Flujos</h3>
          <p className="text-[10px] text-slate-400">Digitales, gastos y extras</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Ventas POS */}
        <section>
          <label htmlFor="ventas-pos" className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Ventas del Sistema (POS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-sm select-none">S/</span>
            <input
              id="ventas-pos"
              type="number" 
              inputMode="decimal"
              step="0.1" 
              min="0" 
              placeholder="Total de ventas..."
              value={ventasPOS} 
              onChange={e => setVentasPOS(e.target.value)}
              className="w-full py-3 pl-10 pr-3 bg-amber-50/40 border-2 border-amber-200/70 rounded-xl font-bold text-lg outline-none focus:border-amber-600 focus:bg-white text-slate-900 min-h-[44px]"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 ml-0.5">Ingresa el total que marca el reporte del sistema POS.</p>
        </section>

        {/* Digitales */}
        <section>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Desglose Digital</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {METODOS_DIGITALES.map(metodo => (
              <div key={metodo}>
                <label htmlFor={`digital-${metodo}`} className="block text-[10px] font-bold text-slate-500 mb-1">{metodo}</label>
                <input
                  id={`digital-${metodo}`}
                  type="number" 
                  inputMode="decimal"
                  step="0.1" 
                  min="0" 
                  placeholder="0.00"
                  value={digitales[metodo]} 
                  onChange={e => setDigitales({ ...digitales, [metodo]: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 min-h-[40px]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Ingresos Extra */}
        <section>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Ingresos Extra (Efectivo)</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(ingresosExtra).map(k => (
              <div key={k}>
                <label htmlFor={`extra-${k}`} className="block text-[10px] font-bold text-slate-500 mb-1">{k}</label>
                <input
                  id={`extra-${k}`}
                  type="number" 
                  inputMode="decimal"
                  step="0.1" 
                  min="0" 
                  placeholder="0.00"
                  value={ingresosExtra[k]} 
                  onChange={e => setIngresosExtra({ ...ingresosExtra, [k]: e.target.value })}
                  className="w-full py-2 px-3 bg-amber-50/40 border border-amber-200/60 rounded-xl font-bold text-sm outline-none focus:border-amber-600 text-slate-900 min-h-[40px]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Gastos */}
        <ListaMovimientos
          titulo="Gastos (Efectivo)"
          icon={<TrendingDown size={12} className="text-rose-500" />}
          items={gastos}
          setItems={setGastos}
          color="rose"
          placeholderDesc="Detalle del gasto..."
          emptyText="Sin gastos registrados"
        />

        {/* Propinas */}
        {showPropinas && (
          <ListaMovimientos
            titulo="Propinas Meseros"
            icon={<Receipt size={12} className="text-amber-600" />}
            items={propinas}
            setItems={setPropinas}
            color="amber"
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
function ListaMovimientos({ titulo, icon, items, setItems, color, placeholderDesc, emptyText }) {
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
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
          {icon}
          <span>{titulo}</span>
        </h4>
        <button
          onClick={addItem}
          className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg font-bold flex items-center cursor-pointer transition-colors"
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
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 min-h-[40px]"
            />
            <div className="relative w-24 shrink-0">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-bold select-none">S/</span>
              <input
                type="number" 
                inputMode="decimal"
                placeholder="0.00"
                aria-label={`${titulo} monto ${i + 1}`}
                value={item.monto}
                onChange={e => updateItem(i, 'monto', e.target.value)}
                className="w-full py-2 pl-7 pr-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-600 text-right min-h-[40px]"
              />
            </div>
            <button
              onClick={() => removeItem(i)}
              aria-label={`Eliminar ${titulo} ${i + 1}`}
              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && emptyText && <p className="text-xs text-slate-400 text-center py-2 font-medium">{emptyText}</p>}
      </div>
    </section>
  )
}
