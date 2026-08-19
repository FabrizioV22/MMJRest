import React, { createContext, useContext, useState, useEffect } from 'react'
import { cajaService } from '../services/cajaService'
import { userService } from '../services/userService'
import { useAuth } from './AuthContext'

const SedeContext = createContext({})

export const useSede = () => useContext(SedeContext)

export const SedeProvider = ({ children }) => {
  const { session } = useAuth()
  const [sedes, setSedes] = useState([])
  const [activeSede, setActiveSede] = useState(null)
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      if (sedes.length === 0) {
        loadSedes()
      }
    } else {
      setSedes([])
      setActiveSede(null)
      setLoading(false)
    }
  }, [userId])

  const loadSedes = async () => {
    try {
      // Intentar cargar sedes asignadas al usuario en vez de todas las sedes
      // Si el backend aún no está migrado o falla, caer al fallback global
      let data = [];
      try {
        data = await userService.getSedesDelUsuario(userId);
      } catch (err) {
        console.warn("No se pudieron cargar sedes por usuario, usando fallback", err);
      }

      
      // Fallback a getSedes() general si no trajo nada (e.g. antes de la migración)
      if (!data || data.length === 0) {
        data = await cajaService.getSedes()
      }
      
      setSedes(data)
      
      // Intentar cargar la última sede usada de localStorage
      const savedSedeId = localStorage.getItem('mmj_active_sede_id')
      if (savedSedeId && data.find(s => s.id === savedSedeId)) {
        setActiveSede(data.find(s => s.id === savedSedeId))
      } else if (data.length > 0) {
        // Por defecto usar Lince o la primera
        const defaultSede = data.find(s => s.nombre.toLowerCase().includes('lince')) || data[0]
        setActiveSede(defaultSede)
      }
    } catch (err) {
      console.error("Error cargando sedes:", err)
    } finally {
      setLoading(false)
    }
  }

  const changeSede = (sedeId) => {
    const newSede = sedes.find(s => s.id === sedeId)
    if (newSede) {
      setActiveSede(newSede)
      localStorage.setItem('mmj_active_sede_id', newSede.id)
    }
  }

  return (
    <SedeContext.Provider value={{ sedes, activeSede, changeSede, loading }}>
      {children}
    </SedeContext.Provider>
  )
}
