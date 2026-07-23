import { useState, useEffect, useMemo } from 'react'
import { finanzasService } from '../../../services/finanzasService'
import { cajaService } from '../../../services/cajaService'

export function useFinanzas() {
  const [loading, setLoading] = useState(true)
  const [turnos, setTurnos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  
  // Filtros
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterSede, setFilterSede] = useState('ALL')
  const [sedesDisponibles, setSedesDisponibles] = useState([])

  useEffect(() => {
    // Load sedes
    cajaService.getSedes().then(setSedesDisponibles).catch(console.error)
  }, [])

  useEffect(() => {
    fetchData()
  }, [dateRange, filterSede])

  const fetchData = async () => {
    setLoading(true)
    try {
      const start = dateRange.start ? new Date(dateRange.start).toISOString() : null;
      // Para end date incluimos todo el día
      let end = null;
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        end = endDate.toISOString();
      }

      const turnosData = await finanzasService.getHistoricalTurnos(start, end, filterSede)
      setTurnos(turnosData)

      const turnoIds = turnosData.map(t => t.id)
      const movsData = await finanzasService.getMovimientosByTurnos(turnoIds)
      setMovimientos(movsData)
      
    } catch (error) {
      console.error("Error fetching finanzas data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos Memoizados
  const kpis = useMemo(() => {
    if (!turnos.length) return { ingresosTotales: 0, promedioDiferencia: 0, totalMovimientos: 0 }
    
    // Total ingresos (sum of ventas in movimientos or just monto_cierre_esperado - diff)
    // Para ser precisos, sumamos los ingresos operativos de cajas_movimientos (categoria Ventas y Extras)
    const ingresos = movimientos
      .filter(m => m.tipo === 'INGRESO' && (m.categoria === 'Ventas' || m.categoria === 'Extras'))
      .reduce((sum, m) => sum + Number(m.monto), 0)

    // Diferencia promedio (absoluta o neta)
    const sumaDiferencias = turnos.reduce((sum, t) => sum + Number(t.diferencia || 0), 0)
    const promedioDiferencia = sumaDiferencias / turnos.length

    return {
      ingresosTotales: ingresos,
      promedioDiferencia: promedioDiferencia,
      totalTurnos: turnos.length
    }
  }, [turnos, movimientos])

  const chartSedesData = useMemo(() => {
    if (!turnos.length) return []
    // Comparativa de Sedes (Bar Chart Agrupado): Eje X (Dias), Y (Ingresos), Series (Lince, Pueblo Libre)
    const dataMap = {} // { '2026-07-23': { date: '23/07', Lince: 1500, 'Pueblo Libre': 2000 } }

    // Necesitamos mapear movimientos a su sede (vía turno)
    const turnoMap = turnos.reduce((acc, t) => {
      acc[t.id] = t
      return acc
    }, {})

    movimientos.forEach(m => {
      if (m.tipo === 'INGRESO' && (m.categoria === 'Ventas' || m.categoria === 'Extras')) {
        const turno = turnoMap[m.turno_id]
        if (!turno) return
        
        const sedeNombre = turno.sedes.nombre
        // Extract day
        const dateKey = new Date(turno.fecha_cierre).toISOString().split('T')[0]
        
        if (!dataMap[dateKey]) {
          dataMap[dateKey] = { 
            name: new Date(turno.fecha_cierre).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), 
            dateKey 
          }
        }
        dataMap[dateKey][sedeNombre] = (dataMap[dateKey][sedeNombre] || 0) + Number(m.monto)
      }
    })

    return Object.values(dataMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  }, [turnos, movimientos])

  const paymentMethodsData = useMemo(() => {
    const methods = {}
    movimientos.forEach(m => {
      if (m.tipo === 'INGRESO' && (m.categoria === 'Ventas' || m.categoria === 'Extras')) {
        methods[m.metodo_pago] = (methods[m.metodo_pago] || 0) + Number(m.monto)
      }
    })

    const COLORS = {
      'Efectivo': '#10B981', // emerald-500
      'Yape': '#8B5CF6',     // violet-500
      'Plin': '#14B8A6',     // teal-500
      'Visa': '#3B82F6',     // blue-500
      'Transferencia': '#6366F1' // indigo-500
    }

    return Object.entries(methods).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name] || '#94A3B8'
    }))
  }, [movimientos])

  return {
    loading,
    turnos,
    kpis,
    chartSedesData,
    paymentMethodsData,
    dateRange, setDateRange,
    filterSede, setFilterSede,
    sedesDisponibles
  }
}
