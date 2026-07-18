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
  
  // Data for chart and filtering
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
      alert('Error cargando el Dashboard.')
    } finally {
      setIsLoading(false)
    }
  }

  const processChartData = (rawMovs, areaId) => {
    const dataMap = {}
    
    // Filter by Area if not 'ALL'
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
      
      // Keep track of products moved for the tooltip
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

  // Custom Tooltip for Recharts to show product details
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Deduplicate and limit details
      const uniqueDetails = Array.from(new Set(data.details)).slice(0, 5);
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-sm">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          <div className="flex space-x-4 mb-2">
            <p className="text-green-600 font-bold">Ingresos: {data.ingresos}</p>
            <p className="text-red-600 font-bold">Egresos: {data.egresos}</p>
          </div>
          {uniqueDetails.length > 0 && (
            <div className="text-xs text-gray-500 border-t pt-2">
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
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel de Control</h2>
        <p className="text-gray-500 text-sm mt-1">Resumen general del inventario y alertas</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Productos</p>
            <h3 className="text-3xl font-black text-gray-900">{stats?.totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Alertas de Stock</p>
            <h3 className="text-3xl font-black text-gray-900">{stats?.lowStockItems}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <FolderOpen size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Áreas Activas</p>
            <h3 className="text-3xl font-black text-gray-900">{stats?.totalCategories}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold text-gray-800">Flujo de Inventario</h3>
            </div>
            <select 
              value={filterArea} 
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none"
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
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Ingresos" dataKey="ingresos" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" name="Egresos" dataKey="egresos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorEgresos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/30">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h3 className="font-bold text-red-900">Por Agotarse</h3>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">{lowStock.length} ítems</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            {lowStock.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Todo el stock está en niveles óptimos.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {lowStock.map(item => (
                  <Link 
                    to="/inventario" 
                    state={{ openCategoryId: item.categorias?.id || item.categoria_id, openProductId: item.id }} 
                    key={item.id} 
                    className="p-4 hover:bg-red-50 transition-colors flex justify-between items-center block cursor-pointer group"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-400 group-hover:text-red-400 uppercase tracking-wide">{item.categorias?.nombre}</p>
                      <h4 className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors">{item.nombre}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-red-600">{item.stock_actual}</span>
                      <span className="text-xs text-gray-500 ml-1">{item.unidad_medida}</span>
                    </div>
                  </Link>
                ))}
              </ul>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Link to="/inventario" className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center py-1">
              Ir al Inventario <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* RECENT MOVEMENTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 flex items-center space-x-2">
          <Clock className="text-gray-400" size={20} />
          <h3 className="font-bold text-gray-800">Actividad Reciente (En tiempo real)</h3>
        </div>
        <div className="overflow-x-auto">
          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay movimientos recientes registrados.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Operación</th>
                  <th className="p-4 font-semibold text-right">Cant.</th>
                  <th className="p-4 font-semibold">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentMovements.map(mov => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{mov.productos?.nombre}</p>
                      <p className="text-xs text-gray-500">{mov.productos?.categorias?.nombre}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                        mov.tipo_movimiento === 'INGRESO' ? 'bg-green-100 text-green-700' :
                        mov.tipo_movimiento === 'EGRESO' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={14} />}
                        {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={14} />}
                        <span>{mov.tipo_movimiento}</span>
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-black text-right ${
                        mov.tipo_movimiento === 'INGRESO' ? 'text-green-600' :
                        mov.tipo_movimiento === 'EGRESO' ? 'text-red-600' :
                        'text-gray-700'
                      }`}>
                      {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                      {mov.cantidad} <span className="text-xs font-normal text-gray-400">{mov.productos?.unidad_medida}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-500">
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
