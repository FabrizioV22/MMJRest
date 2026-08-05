import React from 'react'
import { Package, AlertTriangle, FolderOpen } from 'lucide-react'

export function KpiCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
      {/* 📦 Productos: Ícono Mostaza */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-200/80 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A16207] rounded-l-2xl"></div>
        <div className="p-3 bg-amber-50 text-[#A16207] rounded-2xl shrink-0">
          <Package size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Productos</p>
          <h3 className="text-2xl font-black text-[#1F2937] mt-0.5 tabular-nums">{stats?.totalProducts}</h3>
        </div>
      </div>

      {/* ⚠️ Alertas: Ícono Rojo */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-200/80 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A16207] rounded-l-2xl"></div>
        <div className="p-3 bg-rose-50 text-[#DC2626] rounded-2xl shrink-0">
          <AlertTriangle size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Alertas de Stock</p>
          <h3 className="text-2xl font-black text-[#1F2937] mt-0.5 tabular-nums">{stats?.lowStockItems}</h3>
        </div>
      </div>

      {/* 📂 Categorías: Ícono Azul */}
      <div className="bg-white p-5 rounded-2xl card-soft border border-slate-200/80 flex items-center space-x-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A16207] rounded-l-2xl"></div>
        <div className="p-3 bg-blue-50 text-[#2563EB] rounded-2xl shrink-0">
          <FolderOpen size={24} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Categorías Activas</p>
          <h3 className="text-2xl font-black text-[#1F2937] mt-0.5 tabular-nums">{stats?.totalCategories}</h3>
        </div>
      </div>
    </div>
  )
}
