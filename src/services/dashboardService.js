import { supabase } from '../lib/supabase'

export const dashboardService = {
  getLowStockProducts: async (sedeId, threshold = 10) => {
    try {
      let query = supabase
        .from('stock_sedes')
        .select('stock_actual, sedes(id, nombre), productos!inner(id, nombre, unidad_medida, activo, categorias(id, nombre))')
        .eq('productos.activo', true)
        .eq('activo', true)
        .lt('stock_actual', threshold)
        .order('stock_actual', { ascending: true })

      if (sedeId) {
        query = query.eq('sede_id', sedeId)
      }

      const { data, error } = await query.limit(10)

      if (error) {
        console.error('Error fetching low stock products:', error)
        return []
      }

      return (data || []).map(s => ({
        ...s.productos,
        stock_actual: Number(s.stock_actual),
        sede_nombre: s.sedes?.nombre
      }))
    } catch (err) {
      console.error('Catch error in getLowStockProducts:', err)
      return []
    }
  },

  getRecentMovements: async (sedeId, limit = 6) => {
    try {
      let query = supabase
        .from('movimientos_kardex')
        .select('*, sedes(nombre), productos(nombre, unidad_medida, categorias(nombre))')

      if (sedeId) {
        query = query.eq('sede_id', sedeId)
      }

      const { data, error } = await query
        .order('fecha', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error in getRecentMovements:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('Catch error in getRecentMovements:', err)
      return []
    }
  },

  getGlobalStats: async (sedeId) => {
    try {
      // 1. Total de productos activos en el catálogo maestro
      const { count: totalProducts, error: err1 } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      if (err1) console.error('Error counting products:', err1)
        
      // 2. Total de categorías activas
      const { count: totalCategories, error: err2 } = await supabase
        .from('categorias')
        .select('*', { count: 'exact', head: true })

      if (err2) console.error('Error counting categories:', err2)

      // 3. Items con stock bajo en stock_sedes (solo activos por sede)
      let queryLow = supabase
        .from('stock_sedes')
        .select('id, productos!inner(activo)', { count: 'exact', head: true })
        .eq('productos.activo', true)
        .eq('activo', true)
        .lt('stock_actual', 10)

      if (sedeId) {
        queryLow = queryLow.eq('sede_id', sedeId)
      }

      const { count: lowStockItems, error: err3 } = await queryLow
      if (err3) console.error('Error counting low stock items:', err3)

      return { 
        totalProducts: totalProducts || 0, 
        totalCategories: totalCategories || 0, 
        lowStockItems: lowStockItems || 0 
      }
    } catch (err) {
      console.error('Catch error in getGlobalStats:', err)
      return { totalProducts: 0, totalCategories: 0, lowStockItems: 0 }
    }
  },

  getMovementsForChart: async (sedeId) => {
    try {
      let query = supabase
        .from('movimientos_kardex')
        .select('*, sedes(nombre), productos(id, nombre, categoria_id, categorias(id, nombre, area_id, areas(nombre)))')

      if (sedeId) {
        query = query.eq('sede_id', sedeId)
      }

      const { data, error } = await query
        .order('fecha', { ascending: false })
        .limit(500)

      if (error) {
        console.error('Error fetching chart movements:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('Catch error in getMovementsForChart:', err)
      return []
    }
  }
}
