import { supabase } from '../lib/supabase'
import { getLimaDateString } from '../utils/dateUtils'

export const asistenciaService = {
  /**
   * Registra una marcación de asistencia (Ingreso, Refrigerio, Salida)
   */
  registrarMarcacion: async ({
    sedeId,
    tipoMarca,
    medioMarcacion = 'MOVIL_GPS',
    latitud = null,
    longitud = null,
    distanciaMetros = null,
    observaciones = null,
    targetUsuarioId = null
  }) => {
    try {
      const { data, error } = await supabase.rpc('rpc_registrar_asistencia', {
        p_sede_id: sedeId,
        p_tipo_marca: tipoMarca,
        p_medio_marcacion: medioMarcacion,
        p_latitud: latitud,
        p_longitud: longitud,
        p_distancia_metros: distanciaMetros,
        p_observaciones: observaciones,
        p_target_usuario_id: targetUsuarioId
      })

      if (error) throw error
      return data
    } catch (rpcError) {
      // Fallback a inserción directa si el RPC aún no fue creado en DB
      console.warn('RPC rpc_registrar_asistencia falló, usando inserción directa:', rpcError)
      
      const { data: user } = await supabase.auth.getUser()
      const uid = targetUsuarioId || user?.user?.id

      if (!uid) throw new Error('Usuario no identificado.')

      const { data, error } = await supabase
        .from('asistencia_marcaciones')
        .insert([
          {
            usuario_id: uid,
            sede_id: sedeId,
            fecha: getLimaDateString(),
            hora_evento: new Date().toISOString(),
            tipo_marca: tipoMarca,
            estado_puntualidad: 'A_TIEMPO',
            minutos_tardanza: 0,
            medio_marcacion: medioMarcacion,
            latitud,
            longitud,
            distancia_metros: distanciaMetros,
            observaciones
          }
        ])
        .select()
        .single()

      if (error) throw error
      return { success: true, ...data }
    }
  },

  /**
   * Obtiene todas las marcaciones de una fecha y sede específica
   */
  getMarcacionesDelDia: async (sedeId, fecha = null) => {
    const targetDate = fecha || getLimaDateString()

    let query = supabase
      .from('asistencia_marcaciones')
      .select('*, usuarios(id, nombre_completo, roles)')
      .eq('fecha', targetDate)
      .order('hora_evento', { ascending: true })

    if (sedeId) {
      query = query.eq('sede_id', sedeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Obtiene el historial consolidado de marcaciones en un rango de fechas
   */
  getHistorialMarcaciones: async ({ sedeId, fechaInicio, fechaFin, usuarioId = null }) => {
    let query = supabase
      .from('asistencia_marcaciones')
      .select('*, usuarios(id, nombre_completo, roles)')
      .order('fecha', { ascending: false })
      .order('hora_evento', { ascending: true })

    if (sedeId) {
      query = query.eq('sede_id', sedeId)
    }

    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio)
    }

    if (fechaFin) {
      query = query.lte('fecha', fechaFin)
    }

    if (usuarioId && usuarioId !== 'ALL') {
      query = query.eq('usuario_id', usuarioId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Obtiene los turnos programados configurados para la sede
   */
  getTurnosProgramados: async (sedeId) => {
    let query = supabase
      .from('asistencia_turnos_programados')
      .select('*, usuarios(id, nombre_completo, roles)')
      .eq('activo', true)
      .order('dia_semana', { ascending: true })
      .order('hora_ingreso', { ascending: true })

    if (sedeId) {
      query = query.eq('sede_id', sedeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Guarda o actualiza un turno programado
   */
  guardarTurnoProgramado: async (payload) => {
    const { data, error } = await supabase
      .from('asistencia_turnos_programados')
      .upsert([payload], { onConflict: 'usuario_id,sede_id,dia_semana' })
      .select('*, usuarios(id, nombre_completo, roles)')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Guarda o actualiza múltiples turnos programados a la vez (Carga Semanal Masiva)
   */
  guardarTurnosMasivos: async (payloads = []) => {
    if (!payloads || payloads.length === 0) return []
    const { data, error } = await supabase
      .from('asistencia_turnos_programados')
      .upsert(payloads, { onConflict: 'usuario_id,sede_id,dia_semana' })
      .select('*, usuarios(id, nombre_completo, roles)')

    if (error) throw error
    return data || []
  },

  /**
   * Elimina / desactiva un turno programado
   */
  eliminarTurnoProgramado: async (turnoId) => {
    const { error } = await supabase
      .from('asistencia_turnos_programados')
      .delete()
      .eq('id', turnoId)

    if (error) throw error
    return true
  },

  /**
   * Obtiene el estado de marcaciones de hoy para el usuario actual
   */
  getMiEstadoHoy: async (usuarioId, sedeId, fecha = null) => {
    const targetDate = fecha || getLimaDateString()

    let query = supabase
      .from('asistencia_marcaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('fecha', targetDate)
      .order('hora_evento', { ascending: true })

    if (sedeId) {
      query = query.eq('sede_id', sedeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Registra la aceptación del consentimiento de geolocalización
   */
  aceptarConsentimientoGps: async (usuarioId) => {
    let uid = usuarioId
    if (!uid) {
      const { data: authData } = await supabase.auth.getUser()
      uid = authData?.user?.id
    }
    if (!uid) throw new Error('Usuario no autenticado.')

    const { data, error } = await supabase
      .from('usuarios')
      .update({ consentimiento_gps_at: new Date().toISOString() })
      .eq('id', uid)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza el PIN de asistencia de un usuario
   */
  guardarPinAsistencia: async (usuarioId, pin) => {
    let uid = usuarioId
    if (!uid) {
      const { data: authData } = await supabase.auth.getUser()
      uid = authData?.user?.id
    }
    if (!uid) throw new Error('Usuario no autenticado.')

    const { data, error } = await supabase
      .from('usuarios')
      .update({ pin_asistencia: pin })
      .eq('id', uid)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene la lista de usuarios activos asignados a una sede
   */
  getUsuariosPorSede: async (sedeId) => {
    try {
      if (!sedeId) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('nombre_completo', { ascending: true })
        if (error) throw error
        return data || []
      }

      const { data: usuarioSedes, error: errorRel } = await supabase
        .from('usuario_sedes')
        .select('usuario_id')
        .eq('sede_id', sedeId)

      if (errorRel) throw errorRel
      const uids = (usuarioSedes || []).map(r => r.usuario_id)

      if (uids.length === 0) {
        // Fallback: Si aún no se asignaron sedes individuales, traer todos los usuarios activos
        const { data: allUsers, error: errorAll } = await supabase
          .from('usuarios')
          .select('*')
          .order('nombre_completo', { ascending: true })
        if (errorAll) throw errorAll
        return allUsers || []
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .in('id', uids)
        .order('nombre_completo', { ascending: true })

      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('Fallback cargando todos los usuarios para turnos:', e)
      const { data } = await supabase.from('usuarios').select('*').order('nombre_completo', { ascending: true })
      return data || []
    }
  },

  /**
   * Justifica o edita una marcación existente (exclusivo para ADMIN)
   */
  justificarMarcacion: async (marcaId, { estadoPuntualidad, observaciones }) => {
    const { data, error } = await supabase
      .from('asistencia_marcaciones')
      .update({
        estado_puntualidad: estadoPuntualidad,
        observaciones: observaciones
      })
      .eq('id', marcaId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
