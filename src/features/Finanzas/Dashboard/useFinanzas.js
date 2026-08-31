import { useState, useEffect, useMemo } from 'react'
import { finanzasService } from '../../../services/finanzasService'
import { cajaService } from '../../../services/cajaService'
import { useSede } from '../../../context/SedeContext'

export function useFinanzas() {
  const { activeSede } = useSede()
  const [loading, setLoading] = useState(true)
  const [turnos, setTurnos] = useState([])
  const [movimientos, setMovimientos] = useState([])
  
  // Filtros
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [filterSede, setFilterSede] = useState(activeSede?.id || 'ALL')
  const [sedesDisponibles, setSedesDisponibles] = useState([])

  // Sincronizar filterSede cuando cambia la sede activa global (del sidebar)
  useEffect(() => {
    if (activeSede?.id) {
      setFilterSede(activeSede.id)
    }
  }, [activeSede])

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
      const start = dateRange.start ? new Date(dateRange.start).toISOString() : null
      let end = null
      if (dateRange.end) {
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        end = endDate.toISOString()
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

  // Mapa de turno_id -> { ingresos, egresos }
  const turnoFlowsMap = useMemo(() => {
    const map = {}
    movimientos.forEach(m => {
      if (!map[m.turno_id]) {
        map[m.turno_id] = { ingresos: 0, egresos: 0 }
      }
      const monto = Number(m.monto || 0)
      if (m.tipo === 'INGRESO') {
        map[m.turno_id].ingresos += monto
      } else if (m.tipo === 'EGRESO') {
        map[m.turno_id].egresos += monto
      }
    })
    return map
  }, [movimientos])

  // KPIs Memoizados completos
  const kpis = useMemo(() => {
    if (!turnos.length) {
      return { ingresosTotales: 0, egresosTotales: 0, gananciaNeta: 0, promedioDiferencia: 0, totalTurnos: 0 }
    }

    const ingresos = movimientos
      .filter(m => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + Number(m.monto || 0), 0)

    const egresos = movimientos
      .filter(m => m.tipo === 'EGRESO')
      .reduce((sum, m) => sum + Number(m.monto || 0), 0)

    const gananciaNeta = ingresos - egresos

    const sumaDiferencias = turnos.reduce((sum, t) => sum + Number(t.diferencia || 0), 0)
    const promedioDiferencia = sumaDiferencias / turnos.length

    return {
      ingresosTotales: ingresos,
      egresosTotales: egresos,
      gananciaNeta,
      promedioDiferencia,
      totalTurnos: turnos.length
    }
  }, [turnos, movimientos])

  // Comparativa Diaria por Sede (Bar Chart)
  const chartSedesData = useMemo(() => {
    if (!turnos.length) return []
    const dataMap = {}

    const turnoMap = turnos.reduce((acc, t) => {
      acc[t.id] = t
      return acc
    }, {})

    movimientos.forEach(m => {
      if (m.tipo === 'INGRESO') {
        const turno = turnoMap[m.turno_id]
        if (!turno || !turno.fecha_cierre) return
        
        const sedeNombre = turno.sedes?.nombre || 'Sede'
        const dateObj = new Date(turno.fecha_cierre)
        if (isNaN(dateObj.getTime())) return
        const dateKey = dateObj.toISOString().split('T')[0]
        
        if (!dataMap[dateKey]) {
          dataMap[dateKey] = { 
            name: dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }), 
            dateKey 
          }
        }
        dataMap[dateKey][sedeNombre] = (dataMap[dateKey][sedeNombre] || 0) + Number(m.monto)
      }
    })

    return Object.values(dataMap).sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  }, [turnos, movimientos])

  // Tendencia Mensual de Ganancias por Sede (AreaChart / LineChart)
  const monthlyTrendData = useMemo(() => {
    if (!turnos.length) return []
    const dataMap = {}
    const turnoMap = turnos.reduce((acc, t) => {
      acc[t.id] = t
      return acc
    }, {})

    movimientos.forEach(m => {
      const turno = turnoMap[m.turno_id]
      if (!turno || !turno.fecha_cierre) return

      const dateObj = new Date(turno.fecha_cierre)
      if (isNaN(dateObj.getTime())) return

      const yearMonthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = dateObj.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      const sedeNombre = turno.sedes?.nombre || 'Sede'
      const monto = Number(m.monto || 0)
      const delta = m.tipo === 'INGRESO' ? monto : -monto

      if (!dataMap[yearMonthKey]) {
        dataMap[yearMonthKey] = {
          name: monthLabel,
          key: yearMonthKey,
          total: 0
        }
      }

      dataMap[yearMonthKey][sedeNombre] = (dataMap[yearMonthKey][sedeNombre] || 0) + delta
      dataMap[yearMonthKey].total += delta
    })

    return Object.values(dataMap).sort((a, b) => a.key.localeCompare(b.key))
  }, [turnos, movimientos])

  // Distribución global de métodos de pago (Donut Chart)
  const paymentMethodsData = useMemo(() => {
    const methods = {}
    movimientos.forEach(m => {
      if (m.tipo === 'INGRESO') {
        methods[m.metodo_pago] = (methods[m.metodo_pago] || 0) + Number(m.monto)
      }
    })

    const COLORS = {
      'Efectivo': '#10B981',
      'Yape': '#8B5CF6',
      'Plin': '#14B8A6',
      'Visa': '#3B82F6',
      'Transferencia': '#6366F1'
    }

    return Object.entries(methods)
      .map(([name, value]) => ({
        name,
        value,
        color: COLORS[name] || '#94A3B8'
      }))
      .sort((a, b) => b.value - a.value)
  }, [movimientos])

  // Evolución de métodos de pago en el tiempo (Stacked Area Chart)
  const paymentMethodsTrendData = useMemo(() => {
    if (!turnos.length || !movimientos.length) return []

    const turnoMap = turnos.reduce((acc, t) => {
      acc[t.id] = t
      return acc
    }, {})

    const dataMap = {}

    movimientos.forEach(m => {
      if (m.tipo !== 'INGRESO') return
      const turno = turnoMap[m.turno_id]
      if (!turno || !turno.fecha_cierre) return

      const dateObj = new Date(turno.fecha_cierre)
      if (isNaN(dateObj.getTime())) return

      const yearMonthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = dateObj.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      const metodo = m.metodo_pago || 'Otro'
      const monto = Number(m.monto || 0)

      if (!dataMap[yearMonthKey]) {
        dataMap[yearMonthKey] = {
          name: monthLabel,
          key: yearMonthKey,
          Efectivo: 0,
          Yape: 0,
          Plin: 0,
          Visa: 0,
          Transferencia: 0,
          total: 0
        }
      }

      if (dataMap[yearMonthKey][metodo] === undefined) {
        dataMap[yearMonthKey][metodo] = 0
      }

      dataMap[yearMonthKey][metodo] += monto
      dataMap[yearMonthKey].total += monto
    })

    return Object.values(dataMap).sort((a, b) => a.key.localeCompare(b.key))
  }, [turnos, movimientos])

  return {
    loading,
    turnos,
    movimientos,
    turnoFlowsMap,
    kpis,
    chartSedesData,
    monthlyTrendData,
    paymentMethodsData,
    paymentMethodsTrendData,
    dateRange, setDateRange,
    filterSede, setFilterSede,
    sedesDisponibles
  }
}
