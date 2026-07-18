import { supabase } from '../lib/supabase'

export const userService = {
  // Obtener el perfil del usuario actual (rol, nombre)
  getCurrentProfile: async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned", which is fine for first login without trigger yet
    return data
  },

  // Obtener todos los usuarios (solo ADMIN)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Actualizar el rol o datos de un usuario (solo ADMIN)
  updateUser: async (userId, updates) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  }
}
