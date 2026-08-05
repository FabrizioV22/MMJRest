import React from 'react'
import { Loader2 } from 'lucide-react'
import { useDashboard } from './useDashboard'
import { KpiCards } from './KpiCards'
import { InventoryChart } from './InventoryChart'
import { LowStockAlerts } from './LowStockAlerts'
import { RecentMovements } from './RecentMovements'

export function DashboardModule() {
  const dashboard = useDashboard()

  if (dashboard.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-3">
        <Loader2 className="animate-spin text-[#A16207]" size={38} />
        <span className="text-sm font-medium text-[#6B7280]">Cargando panel de control...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        {/* Título en sans-serif limpia para consistencia ERP */}
        <h2 className="text-2xl font-bold text-[#1F2937]">Panel de Control</h2>
        <p className="text-[#6B7280] text-sm mt-0.5">Resumen general del inventario y estado operativo</p>
      </div>

      {/* KPI CARDS */}
      <KpiCards stats={dashboard.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <InventoryChart 
          chartData={dashboard.chartData}
          filterArea={dashboard.filterArea}
          setFilterArea={dashboard.setFilterArea}
          availableAreas={dashboard.availableAreas}
        />

        {/* LOW STOCK ALERTS */}
        <LowStockAlerts lowStock={dashboard.lowStock} />
      </div>

      {/* RECENT MOVEMENTS */}
      <RecentMovements recentMovements={dashboard.recentMovements} />
    </div>
  )
}
