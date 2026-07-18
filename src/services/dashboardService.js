import { supabase } from '../lib/supabase'

export const dashboardService = {
  getLowStockProducts: async (threshold = 15) => {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, stock_actual, unidad_medida, categorias(nombre)')
      .lte('stock_actual', threshold)
      .order('stock_actual', { ascending: true })
      .limit(8)
    if (error) throw error
    return data
  },

  getRecentMovements: async (limit = 6) => {
    const { data, error } = await supabase
      .from('movimientos_kardex')
      .select('*, productos(nombre, unidad_medida, categorias(nombre))')
      .order('fecha', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  getGlobalStats: async () => {
    const { count: prodCount, error: err1 } = await supabase.from('productos').select('*', { count: 'exact', head: true })
    const { count: catCount, error: err2 } = await supabase.from('categorias').select('*', { count: 'exact', head: true })
    const { count: lowStockCount, error: err3 } = await supabase.from('productos').select('*', { count: 'exact', head: true }).lte('stock_actual', 15)
    
    if (err1 || err2 || err3) throw new Error("Error fetching stats")

    return {
      totalProducts: prodCount || 0,
      totalCategories: catCount || 0,
      lowStockItems: lowStockCount || 0
    }
  },

  // Obtiene movimientos recientes para procesarlos en el frontend y armar la gráfica
  getMovementsForChart: async () => {
    const { data, error } = await supabase
      .from('movimientos_kardex')
      .select('fecha, tipo_movimiento, cantidad, productos(id, nombre, categoria_id, categorias(id, nombre, area_id, areas(nombre)))')
      .order('fecha', { ascending: false })
      .limit(500)
    if (error) throw error
    return data
  }
}
