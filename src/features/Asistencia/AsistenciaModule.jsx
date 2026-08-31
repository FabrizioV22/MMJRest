import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Clock, Calendar, Smartphone, RefreshCw, ShieldCheck, X, Loader2, BarChart2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSede } from '../../context/SedeContext'
import { useToast } from '../../context/ToastContext'
import { asistenciaService } from '../../services/asistenciaService'
import { getLimaDateString, getLimaDayOfWeek, formatLimaTime } from '../../utils/dateUtils'
import { AttendanceKpiGrid } from './components/AttendanceKpiGrid'
import { LiveAttendanceTable } from './components/LiveAttendanceTable'
import { MobilePunchCard } from './components/MobilePunchCard'
import { PrivacyConsentModal } from './components/PrivacyConsentModal'
import { ShiftSchedulerView } from './components/ShiftSchedulerView'
import { AttendanceHistoryView } from './components/AttendanceHistoryView'

export function AsistenciaModule() {
  const { userProfile, setUserProfile, refreshProfile } = useAuth()
  const { activeSede } = useSede()
  const toast = useToast()

  const isAdmin = userProfile?.roles?.includes('ADMIN')
  const [activeTab, setActiveTab] = useState(isAdmin ? 'SUPERVISION' : 'MI_MARCACION')
  const [selectedDate, setSelectedDate] = useState(() => getLimaDateString())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modales
  const [isConsentOpen, setIsConsentOpen] = useState(false)
  const [justifyItem, setJustifyItem] = useState(null)
  const [justifyObs, setJustifyObs] = useState('')

  // Datos
  const [attendanceData, setAttendanceData] = useState([])
  const [kpiStats, setKpiStats] = useState({ programados: 0, aTiempo: 0, tardanzas: 0, sinMarcar: 0 })
  const [myTodayMarks, setMyTodayMarks] = useState([])
  const [shifts, setShifts] = useState([])
  const [usersList, setUsersList] = useState([])

  const loadData = useCallback(async () => {
    if (!activeSede?.id) return
    setIsLoading(true)
    try {
      // 1. Obtener marcaciones de la fecha seleccionada en zona horaria Perú
      const marks = await asistenciaService.getMarcacionesDelDia(activeSede.id, selectedDate)

      // 2. Obtener turnos programados para la sede
      const allShifts = await asistenciaService.getTurnosProgramados(activeSede.id)
      setShifts(allShifts)

      // 3. Obtener usuarios asignados a la sede
      const sedeUsers = await asistenciaService.getUsuariosPorSede(activeSede.id)
      setUsersList(sedeUsers)

      // 4. Calcular día de la semana de la fecha seleccionada (0=Dom, 1=Lun...)
      const targetDayOfWeek = getLimaDayOfWeek(selectedDate)
      const scheduledToday = allShifts.filter(s => s.dia_semana === targetDayOfWeek)

      // 5. Mapear la tabla de supervisión en tiempo real
      const marksByUser = new Map()
      marks.forEach(m => {
        if (!marksByUser.has(m.usuario_id)) marksByUser.set(m.usuario_id, [])
        marksByUser.get(m.usuario_id).push(m)
      })

      const userMap = new Map()
      sedeUsers.forEach(u => userMap.set(u.id, u))

      const combinedList = []
      const processedUserIds = new Set()

      // Procesar primero los que tenían turno programado hoy
      scheduledToday.forEach(shift => {
        processedUserIds.add(shift.usuario_id)
        const user = userMap.get(shift.usuario_id) || shift.usuarios
        const userMarks = marksByUser.get(shift.usuario_id) || []

        const ingreso = userMarks.find(m => m.tipo_marca === 'INGRESO')
        const inicioRef = userMarks.find(m => m.tipo_marca === 'INICIO_REFRIGERIO')
        const finRef = userMarks.find(m => m.tipo_marca === 'FIN_REFRIGERIO')
        const salida = userMarks.find(m => m.tipo_marca === 'SALIDA')

        let estado = 'SIN_MARCAR'
        let tardanza = 0

        if (ingreso) {
          estado = ingreso.estado_puntualidad
          tardanza = ingreso.minutos_tardanza || 0
        }

        let estadoRefrigerio = '—'
        if (inicioRef && !finRef) estadoRefrigerio = 'En Refrigerio'
        else if (inicioRef && finRef) {
          const mins = Math.round((new Date(finRef.hora_evento) - new Date(inicioRef.hora_evento)) / 60000)
          estadoRefrigerio = `${mins} min`
        }

        combinedList.push({
          usuarioId: shift.usuario_id,
          nombre: user?.nombre_completo || 'Colaborador',
          rol: user?.roles?.[0] || 'Personal',
          horarioProgramado: `${shift.hora_ingreso?.substring(0, 5)} - ${shift.hora_salida?.substring(0, 5)}`,
          horaIngreso: ingreso ? formatLimaTime(ingreso.hora_evento) : null,
          horaSalida: salida ? formatLimaTime(salida.hora_evento) : null,
          estadoRefrigerio,
          estadoPuntualidad: estado,
          minutosTardanza: tardanza,
          medioMarcacion: ingreso?.medio_marcacion || null,
          distanciaMetros: ingreso?.distancia_metros ?? null,
          observaciones: ingreso?.observaciones || null,
          ingresoMarcaId: ingreso?.id || null
        })
      })

      // Agregar los que no estaban programados pero tienen marcaciones hoy
      marksByUser.forEach((userMarks, uid) => {
        if (!processedUserIds.has(uid)) {
          const user = userMap.get(uid) || userMarks[0]?.usuarios
          const ingreso = userMarks.find(m => m.tipo_marca === 'INGRESO')
          const salida = userMarks.find(m => m.tipo_marca === 'SALIDA')

          combinedList.push({
            usuarioId: uid,
            nombre: user?.nombre_completo || 'Personal',
            rol: user?.roles?.[0] || 'Personal',
            horarioProgramado: 'Sin turno fijo',
            horaIngreso: ingreso ? formatLimaTime(ingreso.hora_evento) : null,
            horaSalida: salida ? formatLimaTime(salida.hora_evento) : null,
            estadoRefrigerio: '—',
            estadoPuntualidad: ingreso ? ingreso.estado_puntualidad : 'A_TIEMPO',
            minutosTardanza: ingreso?.minutos_tardanza || 0,
            medioMarcacion: ingreso?.medio_marcacion || null,
            distanciaMetros: ingreso?.distancia_metros ?? null,
            observaciones: ingreso?.observaciones || null,
            ingresoMarcaId: ingreso?.id || null
          })
        }
      })

      setAttendanceData(combinedList)

      // Calcular KPIs
      const aTiempoCount = combinedList.filter(c => c.estadoPuntualidad === 'A_TIEMPO').length
      const tardanzasCount = combinedList.filter(c => c.estadoPuntualidad === 'TARDANZA').length
      const sinMarcarCount = combinedList.filter(c => c.estadoPuntualidad === 'SIN_MARCAR').length

      setKpiStats({
        programados: scheduledToday.length || combinedList.length,
        aTiempo: aTiempoCount,
        tardanzas: tardanzasCount,
        sinMarcar: sinMarcarCount
      })

      // 6. Obtener marcaciones de hoy del usuario autenticado
      if (userProfile?.id) {
        const myMarks = await asistenciaService.getMiEstadoHoy(userProfile.id, activeSede.id, selectedDate)
        setMyTodayMarks(myMarks)
      }
    } catch (err) {
      console.error('Error cargando datos de asistencia:', err)
      toast.error('Error cargando registros de asistencia.')
    } finally {
      setIsLoading(false)
    }
  }, [activeSede?.id, selectedDate, userProfile?.id, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Manejador de Marcación
  const handlePunch = async (punchPayload) => {
    setIsSubmitting(true)
    try {
      await asistenciaService.registrarMarcacion({
        sedeId: activeSede?.id,
        ...punchPayload
      })
      toast.success(`Marcación de ${punchPayload.tipoMarca.replace('_', ' ')} registrada con éxito.`)
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Error al registrar marcación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Aceptar Consentimiento GPS
  const handleAcceptConsent = async () => {
    setIsSubmitting(true)
    try {
      const updated = await asistenciaService.aceptarConsentimientoGps(userProfile?.id)
      if (setUserProfile && updated) {
        setUserProfile(prev => ({ ...prev, consentimiento_gps_at: updated.consentimiento_gps_at }))
      } else if (refreshProfile) {
        await refreshProfile()
      }
      toast.success('Consentimiento de geolocalización registrado.')
      setIsConsentOpen(false)
    } catch (err) {
      console.error('Error guardando consentimiento:', err)
      toast.error(err.message || 'Error guardando consentimiento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Guardar Turno (Individual o Carga Masiva)
  const handleSaveShift = async (shiftPayload) => {
    setIsSubmitting(true)
    try {
      if (Array.isArray(shiftPayload)) {
        await asistenciaService.guardarTurnosMasivos(shiftPayload)
        toast.success(`${shiftPayload.length} turnos programados con éxito.`)
      } else {
        await asistenciaService.guardarTurnoProgramado(shiftPayload)
        toast.success('Horario asignado con éxito.')
      }
      await loadData()
    } catch (err) {
      console.error('Error al guardar turno:', err)
      toast.error(err.message || 'Error al guardar turno.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar Turno
  const handleDeleteShift = async (shiftId) => {
    setIsSubmitting(true)
    try {
      await asistenciaService.eliminarTurnoProgramado(shiftId)
      toast.info('Turno eliminado.')
      await loadData()
    } catch (err) {
      toast.error('Error al eliminar turno.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Justificar Tardanza / Falta
  const handleSaveJustification = async () => {
    if (!justifyItem?.ingresoMarcaId) return
    setIsSubmitting(true)
    try {
      await asistenciaService.justificarMarcacion(justifyItem.ingresoMarcaId, {
        estadoPuntualidad: 'JUSTIFICADO',
        observaciones: justifyObs
      })
      toast.success('Tardanza justificada correctamente.')
      setJustifyItem(null)
      setJustifyObs('')
      await loadData()
    } catch (err) {
      toast.error('Error al guardar justificación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9DFD9] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-black text-[#2C211F] font-display tracking-wide">
              CONTROL DE ASISTENCIA
            </h1>
            <span className="bg-rose-50 text-[#A80F14] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
              {activeSede?.nombre || 'Sede'}
            </span>
          </div>
          <p className="text-xs text-[#877571] mt-0.5">
            Supervisión en vivo, gestión de turnos semanales y reportes de puntualidad
          </p>
        </div>

        {/* Tab Selector Responsivo */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('SUPERVISION')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'SUPERVISION'
                    ? 'bg-[#A80F14] text-white shadow-md'
                    : 'bg-white text-[#5D4B47] hover:bg-[#FAF7F4] border border-[#D8CBC5]'
                }`}
              >
                <Clock size={15} />
                <span>En Vivo</span>
              </button>

              <button
                onClick={() => setActiveTab('HORARIOS')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'HORARIOS'
                    ? 'bg-[#A80F14] text-white shadow-md'
                    : 'bg-white text-[#5D4B47] hover:bg-[#FAF7F4] border border-[#D8CBC5]'
                }`}
              >
                <Calendar size={15} />
                <span>Horarios Semanales</span>
              </button>

              <button
                onClick={() => setActiveTab('HISTORIAL')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'HISTORIAL'
                    ? 'bg-[#A80F14] text-white shadow-md'
                    : 'bg-white text-[#5D4B47] hover:bg-[#FAF7F4] border border-[#D8CBC5]'
                }`}
              >
                <BarChart2 size={15} />
                <span>Historial y Reportes</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('MI_MARCACION')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'MI_MARCACION'
                ? 'bg-[#A80F14] text-white shadow-md'
                : 'bg-white text-[#5D4B47] hover:bg-[#FAF7F4] border border-[#D8CBC5]'
            }`}
          >
            <Smartphone size={15} />
            <span>Mi Marcación</span>
          </button>

          <button
            onClick={loadData}
            title="Recargar datos"
            className="p-2 bg-white border border-[#D8CBC5] text-[#5D4B47] hover:bg-[#FAF7F4] rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 🔴 TAB 1: Vista de Supervisión en Vivo */}
      {activeTab === 'SUPERVISION' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPIs del Día */}
          <AttendanceKpiGrid stats={kpiStats} />

          {/* Filtro de Fecha de Hoy / Consulta puntual */}
          <div className="flex flex-wrap justify-between items-center bg-white p-3.5 rounded-2xl border border-[#E9DFD9] shadow-xs gap-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#5D4B47]">
              <Clock size={16} className="text-[#A80F14]" />
              <span>Día en Supervisión:</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedDate(getLimaDateString())}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedDate === getLimaDateString()
                    ? 'bg-[#A80F14] text-white border-[#A80F14] shadow-xs'
                    : 'bg-[#FAF7F4] text-[#5D4B47] border-[#D8CBC5] hover:bg-gray-100'
                }`}
              >
                Hoy
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-semibold text-[#2C211F] outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Tabla en Vivo */}
          <LiveAttendanceTable
            attendanceList={attendanceData}
            isLoading={isLoading}
            isAdmin={isAdmin}
            onJustify={(item) => {
              setJustifyItem(item)
              setJustifyObs('')
            }}
          />
        </div>
      )}

      {/* 📅 TAB 2: Vista de Horarios Semanales (Rediseño Limpio) */}
      {activeTab === 'HORARIOS' && isAdmin && (
        <ShiftSchedulerView
          shifts={shifts}
          users={usersList}
          activeSede={activeSede}
          onSaveShift={handleSaveShift}
          onDeleteShift={handleDeleteShift}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 📊 TAB 3: Historial y Reportes (Consolidado por Rango + Exportación CSV) */}
      {activeTab === 'HISTORIAL' && isAdmin && (
        <AttendanceHistoryView
          activeSede={activeSede}
          users={usersList}
        />
      )}

      {/* 📱 TAB 4: Vista de Marcación Personal */}
      {activeTab === 'MI_MARCACION' && (
        <div className="py-4 animate-in fade-in duration-200">
          <MobilePunchCard
            activeSede={activeSede}
            userProfile={userProfile}
            todayMarks={myTodayMarks}
            onPunch={handlePunch}
            onOpenConsentModal={() => setIsConsentOpen(true)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Modal de Consentimiento de Geolocalización (Ley 29733) */}
      <PrivacyConsentModal
        isOpen={isConsentOpen}
        onAccept={handleAcceptConsent}
        onDecline={() => setIsConsentOpen(false)}
        isSubmitting={isSubmitting}
      />

      {/* Modal de Justificación de Tardanza con createPortal */}
      {justifyItem && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E9DFD9] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col my-auto max-h-[92dvh]">
            {/* Cabecera */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E9DFD9] bg-[#FAF7F4] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#2C211F] leading-tight">
                    Justificar Asistencia
                  </h3>
                  <p className="text-[11px] text-[#877571] mt-0.5">
                    {justifyItem.nombre} • Llegó {justifyItem.horaIngreso || '—'} (+{justifyItem.minutosTardanza}m)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setJustifyItem(null)}
                className="p-2 text-[#877571] hover:bg-black/5 rounded-full cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-1.5">
                  Motivo / Observación de la Justificación
                </label>
                <textarea
                  value={justifyObs}
                  onChange={(e) => setJustifyObs(e.target.value)}
                  placeholder="Ej: Permiso médico autorizado por gerencia / Apoyo en compras fuera del local"
                  rows={4}
                  className="w-full px-3.5 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs sm:text-sm text-[#2C211F] outline-none resize-none font-medium shadow-2xs focus:border-[#A80F14]"
                />
              </div>
              <p className="text-[11px] text-[#877571] leading-relaxed">
                Al guardar la justificación, el estado de puntualidad del colaborador pasará a <strong>«JUSTIFICADO»</strong> en los reportes oficiales.
              </p>
            </div>

            {/* Footer con Botones Grandes */}
            <div className="p-4 sm:p-5 border-t border-[#E9DFD9] bg-[#FAF7F4] flex items-center space-x-2.5 shrink-0">
              <button
                onClick={() => setJustifyItem(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 text-xs font-semibold text-[#5D4B47] bg-white hover:bg-gray-50 rounded-xl border border-[#D8CBC5] cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveJustification}
                disabled={isSubmitting || !justifyObs.trim()}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#A80F14] hover:bg-[#7F0C10] disabled:opacity-40 rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                <span>{isSubmitting ? 'Guardando...' : 'Confirmar Justificación'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
