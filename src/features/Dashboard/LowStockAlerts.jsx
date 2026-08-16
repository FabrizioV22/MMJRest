import React from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LowStockAlerts({ lowStock }) {
  return (
    <div className="bg-white rounded-2xl card-soft border border-[#E9DFD9] flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[#E9DFD9] flex items-center justify-between bg-[#FFF9F0]">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="text-[#B42318]" size={18} />
          <h3 className="font-bold text-[#3A0F0F] text-sm">Stock Crítico</h3>
        </div>
        <span className="text-xs font-bold text-[#B42318] bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">{lowStock.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {lowStock.length === 0 ? (
          <div className="p-8 text-center text-[#877571] text-sm">
            <p className="text-[#15803D] font-medium">Niveles de stock óptimos. ✓</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E9DFD9]/60">
            {lowStock.map(item => (
              <Link 
                to="/inventario" 
                state={{ openCategoryId: item.categorias?.id || item.categoria_id, openProductId: item.id }} 
                key={`${item.id}-${item.sede_nombre || 'def'}`} 
                className="p-4 hover:bg-rose-50/40 flex justify-between items-center block cursor-pointer group transition-colors"
              >
                <div>
                  <p className="text-[10px] font-bold text-[#877571] group-hover:text-[#A80F14] uppercase tracking-wider">
                    {item.categorias?.nombre} {item.sede_nombre ? `• ${item.sede_nombre}` : ''}
                  </p>
                  <h4 className="font-bold text-sm text-[#2C211F] group-hover:text-[#A80F14]">{item.nombre}</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#B42318]">{item.stock_actual}</span>
                  <span className="text-[10px] text-[#877571] ml-1 font-medium">{item.unidad_medida}</span>
                </div>
              </Link>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 border-t border-[#E9DFD9] bg-[#FAF7F4]">
        <Link to="/inventario" className="w-full text-center text-xs font-bold text-[#A80F14] hover:text-[#7F0C10] flex items-center justify-center py-1 cursor-pointer">
          Ir al Inventario <ArrowRight size={14} className="ml-1.5" />
        </Link>
      </div>
    </div>
  )
}
