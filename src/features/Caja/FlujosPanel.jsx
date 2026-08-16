import React from 'react'
import { CreditCard, Plus, Trash2, TrendingDown, Receipt, Sparkles } from 'lucide-react'
import { METODOS_DIGITALES } from './useCaja'

/**
 * Columna 2: Ventas POS, Pasarelas Digitales, Extras y Gastos (Compacto y Responsive).
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
    <div className="bg-white rounded-2xl card-soft border border-blue-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header Compacto Azul Tecnológico */}
      <div className="px-4 py-3 border-b border-blue-100 flex items-center justify-between bg-blue-50/70">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white border border-blue-200 text-[#2563EB] rounded-lg flex items-center justify-center shadow-2xs">
            <CreditCard size={16} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-bold text-[#2563EB] text-sm leading-tight">2. Ventas y Flujos</h3>
            <p className="text-[10px] text-[#5D4B47]">POS & Operaciones</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100/80 text-[#2563EB] rounded-md">
          Digital/Gastos
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Ventas POS */}
        <div className="space-y-1">
          <label htmlFor="ventas-pos" className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">
            Ventas del Sistema (POS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2563EB] font-bold text-sm select-none">S/</span>
            <input
              id="ventas-pos"
              type="number" 
              inputMode="decimal"
              step="0.1" 
              min="0" 
              placeholder="0.00"
              value={ventasPOS} 
              onChange={e => setVentasPOS(e.target.value)}
              className="w-full py-2 pl-8 pr-3 bg-white border-2 border-blue-100 focus:border-[#2563EB] rounded-xl font-black text-base outline-none text-[#2C211F] min-h-[40px]"
            />
          </div>
        </div>

        {/* 2. Pasarelas Digitales (Inputs compactos de una sola fila) */}
        <div className="space-y-1.5">
          <span className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">
            Desglose Digital
          </span>
          <div className="grid grid-cols-2 gap-2">
            {METODOS_DIGITALES.map(metodo => (
              <div key={metodo} className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#877571] select-none pointer-events-none">
                  {metodo} S/
                </span>
                <input
                  id={`digital-${metodo}`}
                  type="number" 
                  inputMode="decimal"
                  step="0.1" 
                  min="0" 
                  placeholder="0.00"
                  value={digitales[metodo] || ''} 
                  onChange={e => setDigitales({ ...digitales, [metodo]: e.target.value })}
                  className="w-full py-1.5 pl-16 pr-2 bg-[#FAF7F4] border border-[#D8CBC5] rounded-lg font-bold text-xs outline-none focus:border-[#2563EB] focus:bg-white text-right text-[#2C211F] min-h-[36px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. Ingresos Extras (Compacto) */}
        <ListaMovimientosCompacta
          titulo="Ingresos Extras"
          icon={<Sparkles size={13} className="text-[#D6A24A]" />}
          items={ingresosExtra}
          setItems={setIngresosExtra}
          placeholderDesc="Concepto (ej: Baño)..."
          defaultItem={{ desc: '', monto: '', metodo: 'Efectivo' }}
        />

        {/* 4. Gastos (Compacto) */}
        <ListaMovimientosCompacta
          titulo="Gastos Operativos"
          icon={<TrendingDown size={13} className="text-[#B42318]" />}
          items={gastos}
          setItems={setGastos}
          placeholderDesc="Detalle (ej: Limones)..."
          defaultItem={{ desc: '', monto: '', metodo: 'Efectivo' }}
        />

        {/* 5. Propinas (Opcional) */}
        {showPropinas && (
          <ListaMovimientosCompacta
            titulo="Propinas Meseros"
            icon={<Receipt size={13} className="text-[#15803D]" />}
            items={propinas}
            setItems={setPropinas}
            placeholderDesc="Nombre mesero..."
            defaultItem={{ desc: '', monto: '', metodo: 'Efectivo' }}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Fila compacta de lista con botón toggle de 1 solo clic [ 💵 Efectivo / 📱 Digital ]
 */
function ListaMovimientosCompacta({ titulo, icon, items, setItems, placeholderDesc, defaultItem }) {
  const addItem = () => setItems([...items, { ...defaultItem }])
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx, field, value) => {
    const updated = [...items]
    updated[idx][field] = value
    setItems(updated)
  }

  return (
    <div className="space-y-1.5 pt-2 border-t border-[#E9DFD9]/70">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider flex items-center space-x-1">
          {icon}
          <span>{titulo}</span>
        </h4>
        <button
          type="button"
          onClick={addItem}
          className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#FAF7F4] hover:bg-white text-[#5D4B47] border border-[#D8CBC5] cursor-pointer transition-colors"
        >
          <Plus size={11} className="inline mr-0.5" /> Agregar
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isEfectivo = (item.metodo || 'Efectivo') === 'Efectivo'
          return (
            <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1.5 bg-[#FAF7F4] rounded-xl border border-[#E9DFD9]">
              <input
                type="text" 
                placeholder={placeholderDesc}
                aria-label={`${titulo} concepto ${i + 1}`}
                value={item.desc}
                onChange={e => updateItem(i, 'desc', e.target.value)}
                className="flex-1 min-w-[110px] py-1 px-2.5 bg-white border border-[#D8CBC5] rounded-lg text-xs font-semibold outline-none focus:border-[#2563EB] min-h-[32px] text-[#2C211F]"
              />
              <div className="relative w-20 shrink-0">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[#877571] text-[10px] font-bold select-none">S/</span>
                <input
                  type="number" 
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-label={`${titulo} monto ${i + 1}`}
                  value={item.monto}
                  onChange={e => updateItem(i, 'monto', e.target.value)}
                  className="w-full py-1 pl-5 pr-1.5 bg-white border border-[#D8CBC5] rounded-lg text-xs font-black outline-none focus:border-[#2563EB] text-right min-h-[32px] text-[#2C211F]"
                />
              </div>
              <button
                type="button"
                onClick={() => updateItem(i, 'metodo', isEfectivo ? 'Digital' : 'Efectivo')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border shrink-0 min-h-[32px] flex items-center gap-1 ${
                  isEfectivo 
                    ? 'bg-emerald-50 text-[#15803D] border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-blue-50 text-[#2563EB] border-blue-200 hover:bg-blue-100'
                }`}
                title="Clic para cambiar entre Efectivo (cajón) y Digital (banco)"
              >
                <span>{isEfectivo ? '💵 Efectivo' : '📱 Digital'}</span>
              </button>
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label={`Eliminar ${titulo} ${i + 1}`}
                className="p-1.5 text-[#877571] hover:text-[#B42318] hover:bg-rose-50 rounded-lg cursor-pointer transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="text-[11px] text-[#877571] text-center py-1 italic bg-[#FAF7F4] rounded-lg border border-dashed border-[#E9DFD9]">
            Sin registros
          </p>
        )}
      </div>
    </div>
  )
}
