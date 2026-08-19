import { supabase } from '../lib/supabase'

export const finanzasService = {
  getHistoricalTurnos: async (startDate, endDate, sedeId = 'ALL') => {
    let query = supabase
      .from('cajas_turnos')
      .select(`
        *,
        sedes ( nombre ),
        usuarios ( nombre_completo )
      `)
      .in('estado', ['CERRADA', 'ANULADA'])
      .order('fecha_cierre', { ascending: false });

    if (startDate) {
      query = query.gte('fecha_cierre', startDate);
    }
    if (endDate) {
      query = query.lte('fecha_cierre', endDate);
    }
    if (sedeId && sedeId !== 'ALL') {
      query = query.eq('sede_id', sedeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  getMovimientosByTurnos: async (turnoIds) => {
    if (!turnoIds || turnoIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('cajas_movimientos')
      .select('*')
      .in('turno_id', turnoIds);
      
    if (error) throw error;
    return data;
  },
  
  getArqueosByTurnos: async (turnoIds) => {
    if (!turnoIds || turnoIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('cajas_arqueo')
      .select('*')
      .in('turno_id', turnoIds);
      
    if (error) throw error;
    return data;
  }
}
