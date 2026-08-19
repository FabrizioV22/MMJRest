import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Loader2, CheckCircle2, Coffee, LogOut, Clock, Smartphone, Monitor } from 'lucide-react'
import { getCurrentPosition, calculateDistanceMeters } from '../../../utils/geolocation'
import { formatLimaTime } from '../../../utils/dateUtils'

export function MobilePunchCard({
  activeSede,
  userProfile,
  todayMarks = [],
  onPunch,
  onOpenConsentModal,
  isSubmitting = false
}) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [gpsStatus, setGpsStatus] = useState({ state: 'IDLE', distance: null, coords: null, error: null })
  const [punchMethod, setPunchMethod] = useState('LOCAL_TABLET') // LOCAL_TABLET or MOVIL_GPS

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Determinar siguiente acción requerida
  const hasIngreso = todayMarks.some(m => m.tipo_marca === 'INGRESO')
  const hasInicioRef = todayMarks.some(m => m.tipo_marca === 'INICIO_REFRIGERIO')
  const hasFinRef = todayMarks.some(m => m.tipo_marca === 'FIN_REFRIGERIO')
  const hasSalida = todayMarks.some(m => m.tipo_marca === 'SALIDA')

  let nextAction = 'INGRESO'
  let nextLabel = 'Registrar Ingreso'
  let nextIcon = Clock
  let nextBg = 'bg-[#A80F14] hover:bg-[#7F0C10]'

  if (!hasIngreso) {
    nextAction = 'INGRESO'
    nextLabel = 'Registrar Ingreso'
    nextIcon = Clock
    nextBg = 'bg-[#A80F14] hover:bg-[#7F0C10]'
  } else if (!hasInicioRef) {
    nextAction = 'INICIO_REFRIGERIO'
    nextLabel = 'Salida a Refrigerio'
    nextIcon = Coffee
    nextBg = 'bg-amber-700 hover:bg-amber-800'
  } else if (!hasFinRef) {
    nextAction = 'FIN_REFRIGERIO'
    nextLabel = 'Retorno de Refrigerio'
    nextIcon = Coffee
    nextBg = 'bg-emerald-700 hover:bg-emerald-800'
  } else if (!hasSalida) {
    nextAction = 'SALIDA'
    nextLabel = 'Registrar Salida de Jornada'
    nextIcon = LogOut
    nextBg = 'bg-[#3A0F0F] hover:bg-[#211716]'
  } else {
    nextAction = 'COMPLETADO'
    nextLabel = 'Jornada Completada'
  }

  const handleVerifyGpsAndPunch = async () => {
    // Si no ha aceptado consentimiento GPS y usa modo móvil, abrir modal
    if (punchMethod === 'MOVIL_GPS' && !userProfile?.consentimiento_gps_at) {
      if (onOpenConsentModal) onOpenConsentModal()
      return
    }

    if (punchMethod === 'LOCAL_TABLET') {
      // Marcación directa desde equipo del local
      onPunch({
        tipoMarca: nextAction,
        medioMarcacion: 'KIOSKO_LOCAL',
        latitud: null,
        longitud: null,
        distanciaMetros: 0
      })
      return
    }

    // Modo Móvil con GPS
    setGpsStatus({ state: 'LOCATING', distance: null, coords: null, error: null })
    try {
      const pos = await getCurrentPosition()
      const targetLat = Number(activeSede?.latitud || -12.085303)
      const targetLon = Number(activeSede?.longitud || -77.046612)
      const maxRadius = Number(activeSede?.radio_metros || 100)

      const distance = calculateDistanceMeters(pos.latitude, pos.longitude, targetLat, targetLon)
      const isOutOfBounds = distance !== null && distance > maxRadius

      const observacion = isOutOfBounds
        ? `⚠️ Marcación fuera de rango (${distance}m del local)`
        : `📍 Marcación en local (${distance || 0}m)`

      setGpsStatus({
        state: isOutOfBounds ? 'OUT_OF_BOUNDS' : 'IN_BOUNDS',
        distance,
        coords: pos,
        error: isOutOfBounds
          ? `Aviso: Te encuentras a ${distance}m del restaurante (radio permitido: ${maxRadius}m). Tu asistencia se registrará con observación de ubicación para el Administrador.`
          : null
      })

      onPunch({
        tipoMarca: nextAction,
        medioMarcacion: 'MOVIL_GPS',
        latitud: pos.latitude,
        longitud: pos.longitude,
        distanciaMetros: distance,
        observaciones: observacion
      })
    } catch (err) {
      setGpsStatus({ state: 'ERROR', distance: null, coords: null, error: `${err.message} Puedes marcar en la pestaña 'Tablet / Red del Local' si estás en el restaurante.` })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E9DFD9] p-6 shadow-xs max-w-xl mx-auto">
      {/* Selector de Modo de Marcación */}
      <div className="flex bg-[#FAF7F4] p-1 rounded-xl border border-[#E9DFD9] mb-5">
        <button
          onClick={() => setPunchMethod('LOCAL_TABLET')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            punchMethod === 'LOCAL_TABLET'
              ? 'bg-white text-[#A80F14] shadow-xs border border-[#E9DFD9]'
              : 'text-[#877571] hover:text-[#2C211F]'
          }`}
        >
          <Monitor size={15} />
          <span>Tablet / Red del Local</span>
        </button>
        <button
          onClick={() => setPunchMethod('MOVIL_GPS')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            punchMethod === 'MOVIL_GPS'
              ? 'bg-white text-[#A80F14] shadow-xs border border-[#E9DFD9]'
              : 'text-[#877571] hover:text-[#2C211F]'
          }`}
        >
          <Smartphone size={15} />
          <span>Móvil con GPS</span>
        </button>
      </div>

      {/* Reloj y Sede */}
      <div className="text-center py-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF7F4] border border-[#E9DFD9] rounded-full text-xs font-semibold text-[#5D4B47] mb-2">
          <MapPin size={13} className="text-[#A80F14]" />
          <span>Sede: <strong>{activeSede?.nombre || 'Mama Julia'}</strong></span>
        </div>

        <div className="font-display font-black text-4xl md:text-5xl text-[#2C211F] tracking-tight">
          {currentTime.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p className="text-xs font-medium text-[#877571] mt-1 capitalize">
          {currentTime.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Flujo de Estados del Día */}
      <div className="grid grid-cols-4 gap-2 my-6 pt-4 border-t border-[#E9DFD9]">
        <StepBadge label="Ingreso" isDone={hasIngreso} time={todayMarks.find(m => m.tipo_marca === 'INGRESO')?.hora_evento} />
        <StepBadge label="Refrigerio" isDone={hasInicioRef} time={todayMarks.find(m => m.tipo_marca === 'INICIO_REFRIGERIO')?.hora_evento} />
        <StepBadge label="Retorno" isDone={hasFinRef} time={todayMarks.find(m => m.tipo_marca === 'FIN_REFRIGERIO')?.hora_evento} />
        <StepBadge label="Salida" isDone={hasSalida} time={todayMarks.find(m => m.tipo_marca === 'SALIDA')?.hora_evento} />
      </div>

      {/* Errores de GPS */}
      {gpsStatus.error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
          {gpsStatus.error}
        </div>
      )}

      {/* Botón Principal de Marcación */}
      {nextAction !== 'COMPLETADO' ? (
        <button
          onClick={handleVerifyGpsAndPunch}
          disabled={isSubmitting || gpsStatus.state === 'LOCATING'}
          className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${nextBg} disabled:opacity-50`}
        >
          {isSubmitting || gpsStatus.state === 'LOCATING' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>{gpsStatus.state === 'LOCATING' ? 'Validando ubicación GPS...' : 'Registrando...'}</span>
            </>
          ) : (
            <>
              <Navigation size={18} />
              <span>{nextLabel}</span>
            </>
          )}
        </button>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2">
          <CheckCircle2 size={18} />
          <span>Has completado todas tus marcas de asistencia por hoy.</span>
        </div>
      )}
    </div>
  )
}

function StepBadge({ label, isDone, time }) {
  const formattedTime = time ? formatLimaTime(time) : null

  return (
    <div
      className={`p-2.5 rounded-xl border text-center transition-all ${
        isDone
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 shadow-xs'
          : 'bg-[#FAF7F4] border-[#E9DFD9] text-[#877571]'
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider">{label}</div>
      <div className="text-xs font-black mt-1">
        {isDone ? formattedTime || '✓' : '—'}
      </div>
    </div>
  )
}
