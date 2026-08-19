import { supabase } from '../lib/supabase'

export const cajaService = {
  // Obtener todas las sedes activas
  getSedes: async () => {
    const { data, error } = await supabase
      .from('sedes')
      .select('*')
      .eq('estado', true)
      .order('nombre')
    
    if (error) throw error
    return data
  },

  // Obtener el turno abierto actual para una sede
  getTurnoAbierto: async (sedeId) => {
    const { data, error } = await supabase
      .from('cajas_turnos')
      .select(`
        *,
        usuarios ( nombre_completo )
      `)
      .eq('sede_id', sedeId)
      .eq('estado', 'ABIERTA')
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // Abrir una nueva caja
  abrirCaja: async (sedeId, usuarioId, montoApertura) => {
    const { data, error } = await supabase
      .from('cajas_turnos')
      .insert({
        sede_id: sedeId,
        usuario_id: usuarioId,
        estado: 'ABIERTA',
        monto_apertura: montoApertura
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Cerrar la caja usando el RPC seguro
  cerrarCaja: async (turnoId, detallesArqueo, movimientosCierre) => {
    const { data, error } = await supabase.rpc('rpc_cerrar_caja_turno', {
      p_turno_id: turnoId,
      p_detalles_arqueo: detallesArqueo,
      p_movimientos_cierre: movimientosCierre
    })

    if (error) throw error
    return data
  },

  // Corregir el monto de apertura (Fondo inicial) si se equivocaron
  actualizarFondo: async (turnoId, nuevoMonto) => {
    const { data, error } = await supabase
      .from('cajas_turnos')
      .update({ monto_apertura: nuevoMonto })
      .eq('id', turnoId)
      .select()
    
    if (error) throw error
    return data
  }
}
