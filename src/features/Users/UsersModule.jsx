import React, { useState, useEffect } from 'react'
import { userService } from '../../services/userService'
import { Users, Shield, Loader2, AlertCircle } from 'lucide-react'

export function UsersModule() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (err) {
      setError('Error al cargar usuarios. Asegúrate de que las tablas existan en BD.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u)) // optimistic update
      await userService.updateUser(userId, { rol: newRole })
    } catch (err) {
      alert("Error actualizando rol")
      loadUsers() // revert on fail
    }
  }

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = !currentStatus
    if (!window.confirm(`¿Estás seguro de ${newStatus ? 'reactivar' : 'desactivar'} a este usuario?`)) return
    
    try {
      setUsers(users.map(u => u.id === userId ? { ...u, activo: newStatus } : u)) // optimistic update
      await userService.updateUser(userId, { activo: newStatus })
    } catch (err) {
      alert("Error actualizando estado")
      loadUsers() // revert on fail
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin inline-block" /> Cargando personal...</div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Gestión de Personal</h2>
        <p className="text-slate-400 text-sm mt-1">Administra los accesos y roles de tus empleados</p>
      </div>

      {error && (
        <div className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl flex items-center space-x-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl card-soft border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Users className="text-slate-400" size={18} />
            <h3 className="font-bold text-slate-700 text-sm">Cuentas Activas</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Nombre Completo</th>
                <th className="p-4 font-bold">Rol Actual</th>
                <th className="p-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50/50 ${!user.activo ? 'opacity-60 grayscale' : ''}`}>
                  <td className="p-4">
                    <button 
                      onClick={() => handleStatusChange(user.id, user.activo)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                        user.activo 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700' 
                          : 'bg-red-100 text-red-700 hover:bg-emerald-100 hover:text-emerald-700'
                      }`}
                      title={user.activo ? "Clic para Desactivar" : "Clic para Reactivar"}
                    >
                      {user.activo ? 'Activo' : 'Desactivado'}
                    </button>
                  </td>
                  <td className="p-4 font-bold text-sm text-slate-800">{user.nombre_completo || 'Sin nombre'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      user.rol === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                      user.rol === 'MESERO' ? 'bg-emerald-100 text-emerald-700' :
                      user.rol === 'ALMACEN' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      <Shield size={13} />
                      <span>{user.rol}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={user.rol}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={!user.activo}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="PENDIENTE">PENDIENTE (Sin acceso)</option>
                      <option value="MESERO">MESERO (Caja)</option>
                      <option value="ALMACEN">ALMACEN (Inventario)</option>
                      <option value="ADMIN">ADMIN (Todo)</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !error && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400 text-sm">
                    No hay usuarios en la tabla. Por favor, asegúrate de correr el script SQL en Supabase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
