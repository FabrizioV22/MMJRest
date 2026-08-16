import { useState, useEffect } from 'react'
import { useSede } from '../../context/SedeContext'
import { useAuth } from '../../context/AuthContext'
import { cajaService } from '../../services/cajaService'
import { useToast } from '../../context/ToastContext'

const DENOMINACIONES = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1]
const METODOS_DIGITALES = ['Yape', 'Plin', 'Visa', 'Transferencia']
const DEFAULTS_DIGITALES = { Yape: '', Plin: '', Visa: '', Transferencia: '' }

const normalizeExtras = (saved) => {
  if (Array.isArray(saved) && saved.length > 0) return saved
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    return Object.entries(saved).map(([desc, monto]) => ({ desc, monto: monto || '', metodo: 'Efectivo' }))
  }
  return [
    { desc: 'Baño', monto: '', metodo: 'Efectivo' },
    { desc: 'Fresquitos', monto: '', metodo: 'Efectivo' }
  ]
}

const normalizeList = (saved) => {
  if (Array.isArray(saved)) {
    return saved.map(item => ({
      desc: item.desc || '',
      monto: item.monto || '',
      metodo: item.metodo || 'Efectivo'
    }))
  }
  return []
}

export { DENOMINACIONES, METODOS_DIGITALES }

export function useCaja() {
  const { activeSede, loading: sedeLoading } = useSede()
  const { userProfile, session } = useAuth()
  const toast = useToast()

  // ── Cache sincronizada ──
  const getInitialCache = () => {
    if (!activeSede) return { turno: null, draft: null }
    try {
      const t = JSON.parse(localStorage.getItem('mmj_last_turno'))
      if (t && t.sede_id === activeSede.id) {
        const d = JSON.parse(localStorage.getItem(`mmj_caja_draft_${t.id}`))
        return { turno: t, draft: d }
      }
    } catch { /* ignore */ }
    return { turno: null, draft: null }
  }

  const [cache] = useState(getInitialCache)
  const [turnoActivo, setTurnoActivo] = useState(cache.turno)
  const [loading, setLoading] = useState(!cache.turno)

  // ── Estados de formulario ──
  const [montoAperturaInput, setMontoAperturaInput] = useState('')
  const [arqueo, setArqueo] = useState(cache.draft?.arqueo || {})
  const [ventasPOS, setVentasPOS] = useState(cache.draft?.ventasPOS ?? '')
  const [digitales, setDigitales] = useState(cache.draft?.digitales || { ...DEFAULTS_DIGITALES })
  const [gastos, setGastos] = useState(normalizeList(cache.draft?.gastos))
  const [propinas, setPropinas] = useState(normalizeList(cache.draft?.propinas))
  const [ingresosExtra, setIngresosExtra] = useState(normalizeExtras(cache.draft?.ingresosExtra))
  const [editandoFondo, setEditandoFondo] = useState(false)
  const [nuevoFondo, setNuevoFondo] = useState('')

  // ── Carga del turno ──
  useEffect(() => {
    if (sedeLoading) return
    if (activeSede) cargarTurno()
    else setLoading(false)
  }, [activeSede, sedeLoading])

  // ── Persistencia de draft ──
  useEffect(() => {
    if (turnoActivo && !loading) {
      const draft = { arqueo, ventasPOS, digitales, gastos, propinas, ingresosExtra }
      localStorage.setItem(`mmj_caja_draft_${turnoActivo.id}`, JSON.stringify(draft))
    }
  }, [arqueo, ventasPOS, digitales, gastos, propinas, ingresosExtra, turnoActivo, loading])

  const loadDraft = (turnoId) => {
    try {
      const saved = localStorage.getItem(`mmj_caja_draft_${turnoId}`)
      if (saved) {
        const d = JSON.parse(saved)
        setArqueo(d.arqueo || {})
        setVentasPOS(d.ventasPOS !== undefined ? d.ventasPOS : '')
        setDigitales(d.digitales || { ...DEFAULTS_DIGITALES })
        setGastos(normalizeList(d.gastos))
        setPropinas(normalizeList(d.propinas))
        setIngresosExtra(normalizeExtras(d.ingresosExtra))
        return true
      }
    } catch (e) { console.error('Error cargando draft', e) }
    return false
  }

  const resetForms = () => {
    setArqueo({})
    setVentasPOS('')
    setDigitales({ ...DEFAULTS_DIGITALES })
    setGastos([])
    setPropinas([])
    setIngresosExtra(normalizeExtras([]))
    setMontoAperturaInput('')
  }

  const cargarTurno = async () => {
    if (!turnoActivo || turnoActivo.sede_id !== activeSede.id) setLoading(true)
    try {
      const turno = await cajaService.getTurnoAbierto(activeSede.id)
      setTurnoActivo(turno)
      if (turno) {
        localStorage.setItem('mmj_last_turno', JSON.stringify(turno))
        if (!loadDraft(turno.id)) resetForms()
      } else {
        localStorage.removeItem('mmj_last_turno')
        resetForms()
      }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  // ── Cálculos ──
  const totalEfectivo = DENOMINACIONES.reduce((acc, d) => acc + d * (arqueo[d] || 0), 0)
  const totalDigitales = METODOS_DIGITALES.reduce((acc, m) => acc + (Number(digitales[m]) || 0), 0)
  
  // Ventas en efectivo según el POS (el reporte del POS ya incluye el monto de apertura inicial)
  const ventasEfectivo = Math.max(0, Number(ventasPOS || 0) - totalDigitales)
  
  // Desglose de Extras: Físico vs Digital
  const extrasEfectivo = ingresosExtra
    .filter(e => (e.metodo || 'Efectivo') === 'Efectivo')
    .reduce((acc, e) => acc + (Number(e.monto) || 0), 0)
  const extrasDigital = ingresosExtra
    .filter(e => (e.metodo || 'Efectivo') !== 'Efectivo')
    .reduce((acc, e) => acc + (Number(e.monto) || 0), 0)
  const totalIngresosExtra = extrasEfectivo + extrasDigital

  // Desglose de Gastos: Físico vs Digital
  const gastosEfectivo = gastos
    .filter(g => (g.metodo || 'Efectivo') === 'Efectivo')
    .reduce((acc, g) => acc + (Number(g.monto) || 0), 0)
  const gastosDigital = gastos
    .filter(g => (g.metodo || 'Efectivo') !== 'Efectivo')
    .reduce((acc, g) => acc + (Number(g.monto) || 0), 0)
  const totalGastos = gastosEfectivo + gastosDigital

  // Desglose de Propinas: Físico vs Digital
  const propinasEfectivo = propinas
    .filter(p => (p.metodo || 'Efectivo') === 'Efectivo')
    .reduce((acc, p) => acc + (Number(p.monto) || 0), 0)
  const propinasDigital = propinas
    .filter(p => (p.metodo || 'Efectivo') !== 'Efectivo')
    .reduce((acc, p) => acc + (Number(p.monto) || 0), 0)
  const totalPropinas = propinasEfectivo + propinasDigital

  // EFECTIVO ESPERADO EN CAJA FÍSICA:
  // Solo suma/resta lo que ocurre físicamente en el cajón:
  const montoEsperado = turnoActivo
    ? Math.max(0, ventasEfectivo + extrasEfectivo - gastosEfectivo - propinasEfectivo)
    : 0
  const diferencia = totalEfectivo - montoEsperado

  // Ventas reales en efectivo para registrar en la base de datos (excluye el fondo inicial para no inflar Finanzas):
  const montoAperturaNum = turnoActivo ? Number(turnoActivo.monto_apertura || 0) : 0
  const realVentasEfectivo = Math.max(0, ventasEfectivo - montoAperturaNum)

  // ── Acciones ──
  const handleAbrirCaja = async (e) => {
    e.preventDefault()
    if (!montoAperturaInput || isNaN(montoAperturaInput) || Number(montoAperturaInput) < 0) {
      return toast.warning('Ingresa un monto de apertura válido.')
    }
    setLoading(true)
    try {
      await cajaService.abrirCaja(activeSede.id, session.user.id, Number(montoAperturaInput))
      toast.success('Turno de caja abierto correctamente')
      await cargarTurno()
    } catch (err) {
      toast.error('Error al abrir caja: ' + (err.message || ''))
      setLoading(false)
    }
  }

  const handleGuardarFondo = async () => {
    if (isNaN(nuevoFondo) || Number(nuevoFondo) < 0) return toast.warning('Monto de fondo inválido.')
    try {
      await cajaService.actualizarFondo(turnoActivo.id, Number(nuevoFondo))
      toast.success('Fondo de apertura actualizado')
      setEditandoFondo(false)
      await cargarTurno()
    } catch (err) { 
      toast.error('Error actualizando fondo: ' + (err.message || '')) 
    }
  }

  const handleCerrarCaja = async () => {
    if (!ventasPOS || Number(ventasPOS) < 0) {
      return toast.warning('Ingresa el monto del reporte POS (si no hubo ventas, ingresa 0).')
    }

    const detallesArqueo = Object.entries(arqueo)
      .map(([d, c]) => ({ denominacion: Number(d), cantidad: Number(c) }))
      .filter(a => a.cantidad > 0)

    const movs = []
    Object.entries(digitales).forEach(([m, v]) => {
      if (Number(v) > 0) movs.push({ tipo: 'INGRESO', categoria: 'Ventas', descripcion: `Ventas por ${m}`, monto: Number(v), metodo_pago: m })
    })
    if (realVentasEfectivo > 0) {
      movs.push({ tipo: 'INGRESO', categoria: 'Ventas', descripcion: 'Ventas en Efectivo (Netas)', monto: realVentasEfectivo, metodo_pago: 'Efectivo' })
    }
    ingresosExtra.forEach(e => {
      if (Number(e.monto) > 0) {
        movs.push({ 
          tipo: 'INGRESO', 
          categoria: 'Extras', 
          descripcion: e.desc || 'Ingreso Extra', 
          monto: Number(e.monto), 
          metodo_pago: e.metodo || 'Efectivo' 
        })
      }
    })
    gastos.forEach(g => {
      if (Number(g.monto) > 0) {
        movs.push({ 
          tipo: 'EGRESO', 
          categoria: 'Gastos', 
          descripcion: g.desc || 'Gasto General', 
          monto: Number(g.monto), 
          metodo_pago: g.metodo || 'Efectivo' 
        })
      }
    })
    propinas.forEach(p => {
      if (Number(p.monto) > 0) {
        movs.push({ 
          tipo: 'EGRESO', 
          categoria: 'Propinas', 
          descripcion: `Propina ${p.desc}`, 
          monto: Number(p.monto), 
          metodo_pago: p.metodo || 'Efectivo' 
        })
      }
    })

    setLoading(true)
    try {
      const result = await cajaService.cerrarCaja(turnoActivo.id, detallesArqueo, movs)
      localStorage.removeItem(`mmj_caja_draft_${turnoActivo.id}`)
      localStorage.removeItem('mmj_last_turno')
      toast.success(`Caja cerrada exitosamente. Diferencia: S/ ${result.diferencia}`)
      await cargarTurno()
    } catch (err) {
      toast.error('Error al cerrar caja: ' + (err.message || ''))
      setLoading(false)
    }
  }

  return {
    // Estado
    activeSede, sedeLoading, loading, turnoActivo,
    isAdmin: userProfile?.roles?.includes('ADMIN'),
    // Formularios
    montoAperturaInput, setMontoAperturaInput,
    arqueo, setArqueo,
    ventasPOS, setVentasPOS,
    digitales, setDigitales,
    gastos, setGastos,
    propinas, setPropinas,
    ingresosExtra, setIngresosExtra,
    editandoFondo, setEditandoFondo,
    nuevoFondo, setNuevoFondo,
    // Cálculos desglosados
    totalEfectivo, 
    totalDigitales, 
    ventasEfectivo, 
    realVentasEfectivo, 
    extrasEfectivo,
    extrasDigital,
    totalIngresosExtra, 
    gastosEfectivo,
    gastosDigital,
    totalGastos, 
    propinasEfectivo,
    propinasDigital,
    totalPropinas, 
    montoEsperado, 
    diferencia,
    // Acciones
    handleAbrirCaja, handleGuardarFondo, handleCerrarCaja,
  }
}
