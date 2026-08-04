import { supabase } from '../lib/supabase'

export const catalogService = {
  // --- ÁREAS ---
  getAreas: async () => {
    const { data, error } = await supabase.from('areas').select('*').order('nombre', { ascending: true })
    if (error) throw error
    return data
  },
  createArea: async (payload) => {
    const { data, error } = await supabase.from('areas').insert([payload]).select().single()
    if (error) throw error
    return data
  },
  updateArea: async (id, payload) => {
    const { data, error } = await supabase.from('areas').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  deleteArea: async (id) => {
    // Hard Delete (solo posible si no tiene categorías)
    const { error } = await supabase.from('areas').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') throw new Error('No se puede eliminar porque contiene categorías.');
      throw error;
    }
    return true
  },

  // --- CATEGORÍAS ---
  getCategories: async () => {
    const { data, error } = await supabase.from('categorias').select('*, areas(nombre)').order('nombre', { ascending: true })
    if (error) throw error
    return data
  },

  createCategory: async (payload) => {
    const { data, error } = await supabase.from('categorias').insert([payload]).select().single()
    if (error) throw error
    return data
  },

  updateCategory: async (id, payload) => {
    const { data, error } = await supabase.from('categorias').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  deleteCategory: async (id) => {
    // Hard Delete (solo posible si no tiene productos)
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') throw new Error('No se puede eliminar porque contiene productos.');
      throw error;
    }
    return true
  },

  // Productos
  getProducts: async (sedeId, viewArchived = false) => {
    let query = supabase.from('productos').select('*, categorias(nombre)')
    
    // Si no queremos ver los archivados y no hay sede (vista global), filtramos por activo global
    if (!viewArchived && !sedeId) {
      query = query.eq('activo', true)
    }
    
    const { data, error } = await query.order('nombre')
    if (error) throw error

    if (sedeId) {
      const { data: stockData } = await supabase
        .from('stock_sedes')
        .select('producto_id, stock_actual, activo')
        .eq('sede_id', sedeId)

      if (stockData) {
        const stockMap = new Map(stockData.map(s => [s.producto_id, { stock: Number(s.stock_actual), activo: s.activo }]))
        let mappedData = data.map(p => {
          const s = stockMap.get(p.id) || { stock: 0, activo: true }
          return {
            ...p,
            stock_actual: s.stock,
            sede_activo: s.activo
          }
        })

        // Si no queremos ver archivados, ocultamos los que están desactivados local o globalmente
        if (!viewArchived) {
          mappedData = mappedData.filter(p => p.sede_activo !== false && p.activo !== false)
        }
        
        return mappedData
      }
    }

    return data
  },

  createProduct: async (payload) => {
    const { data, error } = await supabase.from('productos').insert([payload]).select('*, categorias(nombre)').single()
    if (error) throw error
    return data
  },

  updateProduct: async (id, payload) => {
    const { data, error } = await supabase.from('productos').update(payload).eq('id', id).select('*, categorias(nombre)').single()
    if (error) throw error
    return data
  },

  deleteProduct: async (id, sedeId = null, global = false) => {
    if (!global && sedeId) {
      // Soft Delete local (solo para la sede)
      const { data } = await supabase.from('stock_sedes').select('id').eq('producto_id', id).eq('sede_id', sedeId).maybeSingle()
      if (data) {
        const { error } = await supabase.from('stock_sedes').update({ activo: false }).eq('producto_id', id).eq('sede_id', sedeId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('stock_sedes').insert({ producto_id: id, sede_id: sedeId, stock_actual: 0, activo: false })
        if (error) throw error
      }
    } else {
      // Soft Delete global (toda la empresa)
      const { error } = await supabase.from('productos').update({ activo: false }).eq('id', id)
      if (error) throw error
    }
    return true
  },

  restoreProduct: async (id, sedeId = null, global = false) => {
    if (!global && sedeId) {
      // Restaurar localmente
      const { error } = await supabase.from('stock_sedes').update({ activo: true }).eq('producto_id', id).eq('sede_id', sedeId)
      if (error) throw error
    } else {
      // Restaurar globalmente
      const { error } = await supabase.from('productos').update({ activo: true }).eq('id', id)
      if (error) throw error
    }
    return true
  },

  // --- KARDEX (Movimientos) ---
  getProductMovements: async (productId, sedeId) => {
    let query = supabase
      .from('movimientos_kardex')
      .select('*')
      .eq('producto_id', productId)

    if (sedeId) {
      query = query.eq('sede_id', sedeId)
    }

    const { data, error } = await query.order('fecha', { ascending: false })
      
    if (error) throw error
    return data
  },

  registerMovement: async (payload) => {
    // payload debe incluir: { p_producto_id, p_sede_id, p_tipo_movimiento, p_cantidad, p_observaciones }
    const { data, error } = await supabase.rpc('registrar_movimiento', payload)
    if (error) throw error
    return data
  }
}

