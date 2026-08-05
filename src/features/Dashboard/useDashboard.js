import { useState, useEffect } from 'react'
import { dashboardService } from '../../services/dashboardService'
import { catalogService } from '../../services/catalogService'
import { useSede } from '../../context/SedeContext'

export function useDashboard() {
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

  return {
    isLoading,
    stats,
    lowStock,
    recentMovements,
    chartData,
    availableAreas,
    filterArea,
    setFilterArea
  }
}
