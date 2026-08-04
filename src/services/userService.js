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
  },

  // Obtener las sedes asignadas a un usuario específico
  getSedesDelUsuario: async (userId) => {
    const { data, error } = await supabase
      .from('usuario_sedes')
      .select(`
        sede_id,
        sedes (*)
      `)
      .eq('usuario_id', userId)
    
    if (error) throw error
    return data.map(item => item.sedes)
  },

  // Asignar una sede a un usuario
  asignarSede: async (userId, sedeId) => {
    const { data, error } = await supabase
      .from('usuario_sedes')
      .insert({ usuario_id: userId, sede_id: sedeId })
      .select()

    if (error) throw error
    return data
  },

  // Remover una sede de un usuario
  removerSede: async (userId, sedeId) => {
    const { error } = await supabase
      .from('usuario_sedes')
      .delete()
      .match({ usuario_id: userId, sede_id: sedeId })

    if (error) throw error
    return true
  }
}

