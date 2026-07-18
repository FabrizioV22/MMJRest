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
  getProducts: async () => {
    const { data, error } = await supabase.from('productos').select('*, categorias(nombre)').eq('activo', true).order('nombre')
    if (error) throw error
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

  deleteProduct: async (id) => {
    // Soft Delete
    const { error } = await supabase.from('productos').update({ activo: false }).eq('id', id)
    if (error) throw error
    return true
  },

  // --- KARDEX (Movimientos) ---
  getProductMovements: async (productId) => {
    const { data, error } = await supabase
      .from('movimientos_kardex')
      .select('*')
      .eq('producto_id', productId)
      .order('fecha', { ascending: false })
      
    if (error) throw error
    return data
  },

  registerMovement: async (payload) => {
    const { data, error } = await supabase.rpc('registrar_movimiento', payload)
    if (error) throw error
    return data
  }
}
