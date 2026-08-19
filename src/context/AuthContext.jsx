import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { Loader2 } from 'lucide-react'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (userId) => {
    try {
      const profile = await userService.getCurrentProfile(userId)
      // Si el perfil aún no existe en BD (por delay del trigger), asignamos un rol temporal para no romper la app
      setUserProfile(profile || { roles: ['PENDIENTE'], nombre_completo: 'Usuario Nuevo' })
    } catch (err) {
      console.error("Error cargando perfil:", err)
      setUserProfile({ roles: ['PENDIENTE'], nombre_completo: 'Usuario Sin Perfil' })
    }
  }

  useEffect(() => {
    let currentUserId = null;

    // 1. Check initial session
    authService.getSession().then(async (sess) => {
      setSession(sess)
      if (sess?.user) {
        currentUserId = sess.user.id;
        await loadUserProfile(sess.user.id)
      }
      setLoading(false)
    })

    // 2. Listen for changes
    const { data: { subscription } } = authService.onAuthStateChange(async (sess) => {
      setSession(sess)
      if (sess?.user?.id !== currentUserId) {
        currentUserId = sess?.user?.id;
        if (currentUserId) {
          await loadUserProfile(currentUserId)
        } else {
          setUserProfile(null)
        }
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, userProfile, isAdmin: userProfile?.roles?.includes('ADMIN') }}>
      {children}
    </AuthContext.Provider>
  )
}
