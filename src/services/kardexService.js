import { supabase } from '../lib/supabase'

export const kardexService = {
  // Obtener todos los productos (con su categoría) para el selector
  getProductsForSelect: async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, unidad_medida, stock_actual, categorias(nombre)')
      .order('nombre')
      
    if (error) throw error
    return data
  },

  // Obtener historial de movimientos de un producto específico
  getProductMovements: async (productId) => {
    const { data, error } = await supabase
      .from('movimientos_kardex')
      .select('*')
      .eq('producto_id', productId)
      .order('fecha', { ascending: false }) // Más recientes primero
      
    if (error) throw error
    return data
  },

  // Registrar un nuevo movimiento usando la Función RPC
  registerMovement: async (payload) => {
    // payload: { p_producto_id, p_tipo_movimiento, p_cantidad, p_observaciones }
    const { data, error } = await supabase.rpc('registrar_movimiento', payload)
    
    if (error) throw error
    return data
  }
}
