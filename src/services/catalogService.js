import { supabase } from '../lib/supabase'

export const catalogService = {
  // Categorías
  getCategories: async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('nombre')
    if (error) throw error
    return data
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
  }
}
