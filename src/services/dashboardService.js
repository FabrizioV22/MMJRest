import { supabase } from '../lib/supabase'

export const dashboardService = {
  getLowStockProducts: async (threshold = 15) => {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, stock_actual, unidad_medida, categorias(nombre)')
      .eq('activo', true)
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
    // Total de productos activos
    const { count: totalProducts, error: err1 } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      
    // Total de categorías activas
    const { count: totalCategories, error: err2 } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)

    // Items con stock bajo activos (menor a 10)
    const { count: lowStockItems, error: err3 } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .lt('stock_actual', 10)

    if (err1 || err2 || err3) throw new Error('Error fetching stats')

    return { totalProducts, totalCategories, lowStockItems }
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
