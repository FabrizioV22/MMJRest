import React, { useState, useEffect } from 'react'
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, FolderOpen, Activity, Loader2, ArrowRight, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '../../services/dashboardService'
import { Link } from 'react-router-dom'
import { catalogService } from '../../services/catalogService'
import { useSede } from '../../context/SedeContext'

export function DashboardModule() {
  const { activeSede } = useSede()
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  
  const [allMovements, setAllMovements] = useState([])
  const [chartData, setChartData] = useState([])
  const [availableAreas, setAvailableAreas] = useState([])
  const [filterArea, setFilterArea] = useState('ALL')
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [activeSede?.id])

  useEffect(() => {
    if (allMovements.length > 0) {
      processChartData(allMovements, filterArea)
    }
  }, [filterArea, allMovements])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const results = await Promise.allSettled([
        dashboardService.getGlobalStats(activeSede?.id),
        dashboardService.getLowStockProducts(activeSede?.id),
        dashboardService.getRecentMovements(activeSede?.id),
        dashboardService.getMovementsForChart(activeSede?.id),
        catalogService.getAreas()
      ])

      const [statsRes, lowRes, recentRes, chartRes, areasRes] = results

      if (statsRes.status === 'fulfilled') setStats(statsRes.value || { totalProducts: 0, totalCategories: 0, lowStockItems: 0 })
      if (lowRes.status === 'fulfilled') setLowStock(lowRes.value || [])
      if (recentRes.status === 'fulfilled') setRecentMovements(recentRes.value || [])
      if (chartRes.status === 'fulfilled') setAllMovements(chartRes.value || [])
      if (areasRes.status === 'fulfilled') setAvailableAreas(areasRes.value || [])

    } catch (error) {
      console.error("Dashboard fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }


  const processChartData = (rawMovs, areaId) => {
    const dataMap = {}
    
    const filtered = areaId === 'ALL' 
      ? rawMovs 
      : rawMovs.filter(m => m.productos?.categorias?.area_id === areaId)

    filtered.forEach(mov => {
      const rawDate = mov.fecha || mov.created_at
      const date = rawDate ? new Date(rawDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin fecha'
      if (!dataMap[date]) {
        dataMap[date] = { name: date, ingresos: 0, egresos: 0, details: [] }
      }
      
      const amount = Number(mov.cantidad)
      if (mov.tipo_movimiento === 'INGRESO' || mov.tipo_movimiento === 'SALDO_INICIAL') {
        dataMap[date].ingresos += amount
      } else if (mov.tipo_movimiento === 'EGRESO') {
        dataMap[date].egresos += amount
      }
      
      if (mov.productos?.nombre) {
        const sedeInfo = mov.sedes?.nombre ? ` (${mov.sedes.nombre})` : ''
        dataMap[date].details.push(`${mov.tipo_movimiento === 'EGRESO' ? '-' : '+'}${amount} ${mov.productos.nombre}${sedeInfo}`)
      }
    })
    
    const chartArray = Object.values(dataMap).reverse().slice(-7)
    
    if (chartArray.length === 0) {
      setChartData([
        { name: 'Lun', ingresos: 0, egresos: 0, details: [] },
        { name: 'Mar', ingresos: 0, egresos: 0, details: [] }
      ])
    } else {
      setChartData(chartArray)
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const uniqueDetails = Array.from(new Set(data.details)).slice(0, 5);
      return (
        <div className="bg-white p-3.5 rounded-xl shadow-xl border border-slate-100 text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="flex space-x-4 mb-2">
            <p className="text-[#16A34A] font-bold">Ingresos: {data.ingresos}</p>
            <p className="text-[#DC2626] font-bold">Egresos: {data.egresos}</p>
          </div>
          {uniqueDetails.length > 0 && (
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-2">
              <p className="font-semibold mb-1">Movimientos destacados:</p>
              <ul className="space-y-1">
                {uniqueDetails.map((det, i) => (
                  <li key={i}>{det}</li>
                ))}
                {data.details.length > 5 && <li>... y más</li>}
              </ul>
            </div>
          )}
        </div>
      )
    }
    return null;
  }

  if (isLoading) {
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

      {/* KPI CARDS — Unificados con borde mostaza (#A16207) e íconos temáticos */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION — Líneas limpias sin degradado pesado */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl card-soft border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="text-[#A16207]" size={20} />
              <h3 className="text-base font-bold text-[#1F2937]">Flujo de Movimiento de Kardex</h3>
            </div>
            <select 
              value={filterArea} 
              aria-label="Filtrar por área"
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Áreas</option>
              {availableAreas.map(area => (
                <option key={area.id} value={area.id}>{area.nombre}</option>
              ))}
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontFamily: 'Karla'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontFamily: 'Karla'}} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" name="Ingresos" dataKey="ingresos" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A34A' }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Egresos" dataKey="egresos" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 4, fill: '#DC2626' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
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

      </div>

      {/* RECENT MOVEMENTS */}
      <div className="bg-white rounded-2xl card-soft border border-slate-200/80 overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50">
          <Clock className="text-slate-400" size={18} />
          <h3 className="font-bold text-[#1F2937] text-sm">Actividad Reciente en Kardex</h3>
        </div>
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No hay movimientos recientes.</div>
          ) : (
            recentMovements.map(mov => {
              const rawDate = mov.fecha || mov.created_at
              return (
                <div key={mov.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-[#1F2937]">{mov.productos?.nombre}</p>
                      <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
                        {mov.productos?.categorias?.nombre} {mov.sedes?.nombre ? `• ${mov.sedes.nombre}` : ''}
                      </p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                      mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-[#16A34A]' :
                      mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-100 text-[#DC2626]' :
                      'bg-amber-100 text-[#A16207]'
                    }`}>
                      {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={12} />}
                      {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={12} />}
                      <span>{mov.tipo_movimiento}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#6B7280] pt-1">
                    <span>Hora: {rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                    <span className={`font-black text-sm ${
                      mov.tipo_movimiento === 'INGRESO' ? 'text-[#16A34A]' :
                      mov.tipo_movimiento === 'EGRESO' ? 'text-[#DC2626]' :
                      'text-[#1F2937]'
                    }`}>
                      {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                      {mov.cantidad} {mov.productos?.unidad_medida}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          {recentMovements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No hay movimientos recientes registrados.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-slate-100">
                  <th className="p-4 font-bold">Producto</th>
                  <th className="p-4 font-bold">Operación</th>
                  <th className="p-4 font-bold text-right">Cant.</th>
                  <th className="p-4 font-bold">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMovements.map(mov => {
                  const rawDate = mov.fecha_movimiento || mov.created_at
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm text-[#1F2937]">{mov.productos?.nombre}</p>
                        <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                          {mov.productos?.categorias?.nombre} {mov.sedes?.nombre ? `• ${mov.sedes.nombre}` : ''}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-[#16A34A]' :
                          mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-100 text-[#DC2626]' :
                          'bg-amber-100 text-[#A16207]'
                        }`}>
                          {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={13} />}
                          {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={13} />}
                          <span>{mov.tipo_movimiento}</span>
                        </span>
                      </td>
                      <td className={`p-4 text-sm font-black text-right ${
                          mov.tipo_movimiento === 'INGRESO' ? 'text-[#16A34A]' :
                          mov.tipo_movimiento === 'EGRESO' ? 'text-[#DC2626]' :
                          'text-[#1F2937]'
                        }`}>
                        {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                        {mov.cantidad} <span className="text-[10px] font-normal text-[#6B7280]">{mov.productos?.unidad_medida}</span>
                      </td>
                      <td className="p-4 text-sm font-medium text-[#6B7280]">
                        {rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
