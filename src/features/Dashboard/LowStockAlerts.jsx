import React from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LowStockAlerts({ lowStock }) {
  return (
    <div className="bg-white rounded-2xl card-soft border border-slate-200/80 flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="text-[#DC2626]" size={18} />
          <h3 className="font-bold text-rose-950 text-sm">Stock Crítico</h3>
        </div>
        <span className="text-xs font-bold text-[#DC2626] bg-rose-100 px-2.5 py-0.5 rounded-full">{lowStock.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {lowStock.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <p>Niveles de stock óptimos. ✓</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {lowStock.map(item => (
              <Link 
                to="/inventario" 
                state={{ openCategoryId: item.categorias?.id || item.categoria_id, openProductId: item.id }} 
                key={`${item.id}-${item.sede_nombre || 'def'}`} 
                className="p-4 hover:bg-rose-50/30 flex justify-between items-center block cursor-pointer group transition-colors"
              >
                <div>
                  <p className="text-[10px] font-bold text-slate-500 group-hover:text-[#DC2626] uppercase tracking-wider">
                    {item.categorias?.nombre} {item.sede_nombre ? `• ${item.sede_nombre}` : ''}
                  </p>
                  <h4 className="font-bold text-sm text-[#1F2937] group-hover:text-[#DC2626]">{item.nombre}</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#DC2626]">{item.stock_actual}</span>
                  <span className="text-[10px] text-slate-400 ml-1 font-medium">{item.unidad_medida}</span>
                </div>
              </Link>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <Link to="/inventario" className="w-full text-center text-xs font-bold text-[#A16207] hover:text-[#9A3412] flex items-center justify-center py-1 cursor-pointer">
          Ir al Inventario <ArrowRight size={14} className="ml-1.5" />
        </Link>
      </div>
    </div>
  )
}
