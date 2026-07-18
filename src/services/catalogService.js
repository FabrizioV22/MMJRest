import { supabase } from '../lib/supabase'

export const catalogService = {
  // Categorías
  getCategories: async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('nombre')
    if (error) throw error
    return data
  },

  createCategory: async (categoryData) => {
    const { data, error } = await supabase.from('categorias').insert([categoryData]).select()
    if (error) throw error
    return data[0]
  },

  updateCategory: async (id, categoryData) => {
    const { data, error } = await supabase.from('categorias').update(categoryData).eq('id', id).select()
    if (error) throw error
    return data[0]
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // Productos
  getProducts: async () => {
    const { data, error } = await supabase.from('productos').select('*, categorias(nombre)').order('nombre')
    if (error) throw error
    return data
  },

  createProduct: async (productData) => {
    const { data, error } = await supabase.from('productos').insert([productData]).select('*, categorias(nombre)')
    if (error) throw error
    return data[0]
  },

  updateProduct: async (id, productData) => {
    const { data, error } = await supabase.from('productos').update(productData).eq('id', id).select('*, categorias(nombre)')
    if (error) throw error
    return data[0]
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id)
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
