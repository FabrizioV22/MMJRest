import React from 'react'
import { Package, AlertTriangle, FolderOpen } from 'lucide-react'

export function KpiCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
      {/* 📦 Productos: Ícono Rojo Marca */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A80F14] rounded-l-2xl"></div>
        <div className="p-3 bg-rose-50 text-[#A80F14] rounded-2xl shrink-0 border border-rose-100">
          <Package size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Total Productos</p>
          <h3 className="text-2xl font-black text-[#2C211F] mt-0.5 tabular-nums">{stats?.totalProducts}</h3>
        </div>
      </div>

      {/* ⚠️ Alertas: Ícono Ámbar / Rojo Semántico */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B45309] rounded-l-2xl"></div>
        <div className="p-3 bg-amber-50 text-[#B45309] rounded-2xl shrink-0 border border-amber-100">
          <AlertTriangle size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Alertas de Stock</p>
          <h3 className="text-2xl font-black text-[#2C211F] mt-0.5 tabular-nums">{stats?.lowStockItems}</h3>
        </div>
      </div>

      {/* 📂 Categorías: Ícono Dorado Acento */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D6A24A] rounded-l-2xl"></div>
        <div className="p-3 bg-[#FFF9F0] text-[#D6A24A] rounded-2xl shrink-0 border border-[#E7C77A]">
          <FolderOpen size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Categorías Activas</p>
          <h3 className="text-2xl font-black text-[#2C211F] mt-0.5 tabular-nums">{stats?.totalCategories}</h3>
        </div>
      </div>
    </div>
  )
}
