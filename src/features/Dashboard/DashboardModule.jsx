import React, { useState, useEffect } from 'react'
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, FolderOpen, Activity, Loader2, ArrowRight, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '../../services/dashboardService'
import { Link } from 'react-router-dom'
import { catalogService } from '../../services/catalogService'

export function DashboardModule() {
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
  }, [])

  useEffect(() => {
    if (allMovements.length > 0) {
      processChartData(allMovements, filterArea)
    }
  }, [filterArea, allMovements])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [globalStats, lowItems, recentMovs, rawMovs, areas] = await Promise.all([
        dashboardService.getGlobalStats(),
        dashboardService.getLowStockProducts(),
        dashboardService.getRecentMovements(),
        dashboardService.getMovementsForChart(),
        catalogService.getAreas()
      ])
      
      setStats(globalStats)
      setLowStock(lowItems)
      setRecentMovements(recentMovs)
      setAllMovements(rawMovs)
      setAvailableAreas(areas || [])

    } catch (error) {
      console.error(error)
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
      const date = new Date(mov.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
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
        dataMap[date].details.push(`${mov.tipo_movimiento === 'EGRESO' ? '-' : '+'}${amount} ${mov.productos.nombre}`)
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
            <p className="text-emerald-600 font-bold">Ingresos: {data.ingresos}</p>
            <p className="text-rose-600 font-bold">Egresos: {data.egresos}</p>
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
        <Loader2 className="animate-spin text-amber-700" size={38} />
        <span className="text-sm font-medium text-slate-500">Cargando panel de control...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Panel de Control</h2>
        <p className="text-slate-500 text-sm mt-0.5">Resumen general del inventario y estado operativo</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
        <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600 rounded-l-2xl"></div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl shrink-0">
            <Package size={24} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Productos</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">{stats?.totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600 rounded-l-2xl"></div>
          <div className="p-3 bg-orange-50 text-orange-700 rounded-2xl shrink-0">
            <AlertTriangle size={24} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alertas de Stock</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">{stats?.lowStockItems}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl card-soft border border-slate-100 flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-700 rounded-l-2xl"></div>
          <div className="p-3 bg-stone-100 text-stone-700 rounded-2xl shrink-0">
            <FolderOpen size={24} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Categorías Activas</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">{stats?.totalCategories}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl card-soft border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="text-amber-700" size={20} />
              <h3 className="text-base font-bold text-slate-800">Flujo de Movimiento de Kardex</h3>
            </div>
            <select 
              value={filterArea} 
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
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Karla'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Karla'}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Ingresos" dataKey="ingresos" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" name="Egresos" dataKey="egresos" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEgresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="bg-white rounded-2xl card-soft border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-rose-600" size={18} />
              <h3 className="font-bold text-rose-950 text-sm">Stock Crítico</h3>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">{lowStock.length}</span>
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
                    key={item.id} 
                    className="p-4 hover:bg-rose-50/30 flex justify-between items-center block cursor-pointer group transition-colors"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 group-hover:text-rose-600 uppercase tracking-wider">{item.categorias?.nombre}</p>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-rose-900">{item.nombre}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-rose-600">{item.stock_actual}</span>
                      <span className="text-[10px] text-slate-400 ml-1 font-medium">{item.unidad_medida}</span>
                    </div>
                  </Link>
                ))}
              </ul>
            )}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <Link to="/inventario" className="w-full text-center text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center justify-center py-1 cursor-pointer">
              Ir al Inventario <ArrowRight size={14} className="ml-1.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* RECENT MOVEMENTS */}
      <div className="bg-white rounded-2xl card-soft border border-slate-100 overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50">
          <Clock className="text-slate-400" size={18} />
          <h3 className="font-bold text-slate-800 text-sm">Actividad Reciente en Kardex</h3>
        </div>
        
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No hay movimientos recientes.</div>
          ) : (
            recentMovements.map(mov => (
              <div key={mov.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{mov.productos?.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{mov.productos?.categorias?.nombre}</p>
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                    mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' :
                    mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={12} />}
                    {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={12} />}
                    <span>{mov.tipo_movimiento}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <span>Hora: {new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`font-black text-sm ${
                    mov.tipo_movimiento === 'INGRESO' ? 'text-emerald-600' :
                    mov.tipo_movimiento === 'EGRESO' ? 'text-rose-600' :
                    'text-slate-700'
                  }`}>
                    {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                    {mov.cantidad} {mov.productos?.unidad_medida}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          {recentMovements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No hay movimientos recientes registrados.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="p-4 font-bold">Producto</th>
                  <th className="p-4 font-bold">Operación</th>
                  <th className="p-4 font-bold text-right">Cant.</th>
                  <th className="p-4 font-bold">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentMovements.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-slate-800">{mov.productos?.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{mov.productos?.categorias?.nombre}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' :
                        mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={13} />}
                        {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={13} />}
                        <span>{mov.tipo_movimiento}</span>
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-black text-right ${
                        mov.tipo_movimiento === 'INGRESO' ? 'text-emerald-600' :
                        mov.tipo_movimiento === 'EGRESO' ? 'text-rose-600' :
                        'text-slate-700'
                      }`}>
                      {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                      {mov.cantidad} <span className="text-[10px] font-normal text-slate-400">{mov.productos?.unidad_medida}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-400">
                      {new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  )
}
