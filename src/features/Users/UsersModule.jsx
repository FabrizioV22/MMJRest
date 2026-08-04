import React, { useState, useEffect } from 'react'
import { userService } from '../../services/userService'
import { cajaService } from '../../services/cajaService'
import { Users, Shield, Loader2, AlertCircle, Building2, MapPin } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export function UsersModule() {
  const [users, setUsers] = useState([])
  const [availableSedes, setAvailableSedes] = useState([])
  const [userSedesMap, setUserSedesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    loadUsersAndSedes()
  }, [])

  const loadUsersAndSedes = async () => {
    try {
      const [usersData, sedesData] = await Promise.all([
        userService.getAllUsers(),
        cajaService.getSedes().catch(() => [])
      ])
      
      setUsers(usersData)
      setAvailableSedes(sedesData)

      // Cargar las sedes de cada usuario
      const sedesMap = {}
      await Promise.all(
        usersData.map(async (u) => {
          try {
            const userSedes = await userService.getSedesDelUsuario(u.id)
            sedesMap[u.id] = userSedes.map(s => s.id)
          } catch (e) {
            sedesMap[u.id] = []
          }
        })
      )
      setUserSedesMap(sedesMap)

    } catch (err) {
      setError('Error al cargar usuarios. Asegúrate de que las tablas existan en BD.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = async (userId, currentRoles, roleToToggle) => {
    try {
      let newRoles = [...(currentRoles || [])];
      if (newRoles.includes(roleToToggle)) {
        newRoles = newRoles.filter(r => r !== roleToToggle);
      } else {
        newRoles.push(roleToToggle);
      }
      
      if (roleToToggle === 'PENDIENTE') {
         newRoles = ['PENDIENTE'];
      } else {
         newRoles = newRoles.filter(r => r !== 'PENDIENTE');
      }
      if (newRoles.length === 0) newRoles = ['PENDIENTE'];

      setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles } : u))
      await userService.updateUser(userId, { roles: newRoles })
      toast.success(`Roles actualizados correctamente.`)
    } catch (err) {
      toast.error("Error actualizando roles")
      loadUsersAndSedes()
    }
  }

  const handleStatusChange = async (userId, currentStatus, userName) => {
    const newStatus = !currentStatus
    
    try {
      setUsers(users.map(u => u.id === userId ? { ...u, activo: newStatus } : u))
      await userService.updateUser(userId, { activo: newStatus })
      toast.info(`Usuario "${userName || 'Personal'}" ${newStatus ? 'reactivado' : 'desactivado'}.`)
    } catch (err) {
      toast.error("Error actualizando estado del usuario")
      loadUsersAndSedes()
    }
  }

  const handleSedeToggle = async (userId, sedeId) => {
    const currentSedeIds = userSedesMap[userId] || []
    const isAssigned = currentSedeIds.includes(sedeId)

    try {
      let updatedSedeIds = []
      if (isAssigned) {
        updatedSedeIds = currentSedeIds.filter(id => id !== sedeId)
        setUserSedesMap({ ...userSedesMap, [userId]: updatedSedeIds })
        await userService.removerSede(userId, sedeId)
        toast.info("Sede desasignada del usuario")
      } else {
        updatedSedeIds = [...currentSedeIds, sedeId]
        setUserSedesMap({ ...userSedesMap, [userId]: updatedSedeIds })
        await userService.asignarSede(userId, sedeId)
        toast.success("Sede asignada correctamente")
      }
    } catch (err) {
      toast.error("Error al modificar asignación de sede")
      loadUsersAndSedes()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="animate-spin text-amber-700" size={38} />
        <span className="text-sm font-medium text-slate-500">Cargando personal de la empresa...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Gestión de Personal</h2>
        <p className="text-[#6B7280] text-sm mt-0.5">Administra los accesos, roles y sedes permitidas del equipo de trabajo</p>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center space-x-3">
          <AlertCircle size={20} className="shrink-0 text-amber-700" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl card-soft border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Users className="text-amber-700" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Cuentas Registradas</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">{users.length} usuarios</span>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {users.map(user => (
            <div key={user.id} className={`p-4 space-y-3 ${!user.activo ? 'bg-slate-50/70 opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{user.nombre_completo || 'Sin nombre'}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(user.roles || []).map(r => (
                      <span key={r} className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        r === 'ADMIN' ? 'bg-amber-100 text-amber-900' :
                        r === 'MESERO' ? 'bg-emerald-100 text-emerald-800' :
                        r === 'ALMACEN' ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        <Shield size={10} />
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleStatusChange(user.id, user.activo, user.nombre_completo)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    user.activo 
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800' 
                      : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                >
                  {user.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              {/* Roles Checkboxes Mobile */}
              <div className="border-t border-slate-100 pt-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Asignar Roles</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  {['ADMIN', 'MESERO', 'ALMACEN', 'PENDIENTE'].map(role => (
                    <label key={role} className={`flex items-center space-x-2 p-2 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer ${!user.activo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input 
                        type="checkbox"
                        checked={(user.roles || []).includes(role)}
                        disabled={!user.activo}
                        onChange={() => handleRoleToggle(user.id, user.roles, role)}
                        className="accent-amber-600 w-4 h-4"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sedes Mobile */}
              <div className="border-t border-slate-100 pt-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin size={12} className="text-amber-700" /> Sedes Asignadas
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  {availableSedes.map(sede => {
                    const isAssigned = (userSedesMap[user.id] || []).includes(sede.id)
                    return (
                      <button
                        key={sede.id}
                        disabled={!user.activo}
                        onClick={() => handleSedeToggle(user.id, sede.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isAssigned 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sede.nombre} {isAssigned ? '✓' : '+'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold">Nombre Completo</th>
                <th className="p-4 font-bold">Roles Actuales</th>
                <th className="p-4 font-bold">Sedes Permitidas</th>
                <th className="p-4 font-bold text-right">Asignación de Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${!user.activo ? 'opacity-60 grayscale bg-slate-50/30' : ''}`}>
                  <td className="p-4">
                    <button 
                      onClick={() => handleStatusChange(user.id, user.activo, user.nombre_completo)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm ${
                        user.activo 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800' 
                          : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                      title={user.activo ? "Clic para desactivar acceso" : "Clic para reactivar acceso"}
                    >
                      {user.activo ? 'Activo' : 'Desactivado'}
                    </button>
                  </td>
                  <td className="p-4 font-bold text-sm text-slate-800">{user.nombre_completo || 'Sin nombre'}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles || []).map(r => (
                        <span key={r} className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          r === 'ADMIN' ? 'bg-amber-100 text-amber-900' :
                          r === 'MESERO' ? 'bg-emerald-100 text-emerald-800' :
                          r === 'ALMACEN' ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield size={11} />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {availableSedes.map(sede => {
                        const isAssigned = (userSedesMap[user.id] || []).includes(sede.id)
                        return (
                          <button
                            key={sede.id}
                            disabled={!user.activo}
                            onClick={() => handleSedeToggle(user.id, sede.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                              isAssigned 
                                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm' 
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={isAssigned ? "Desasignar esta sede" : "Asignar esta sede"}
                          >
                            <Building2 size={10} className="inline mr-1" />
                            {sede.nombre} {isAssigned ? '✓' : '+'}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-wrap justify-end gap-3 text-xs font-bold text-slate-600">
                      {['ADMIN', 'MESERO', 'ALMACEN', 'PENDIENTE'].map(role => (
                        <label key={role} className={`flex items-center gap-1.5 cursor-pointer hover:text-amber-700 transition-colors ${!user.activo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox"
                            checked={(user.roles || []).includes(role)}
                            disabled={!user.activo}
                            onChange={() => handleRoleToggle(user.id, user.roles, role)}
                            className="accent-amber-600 w-4 h-4 cursor-pointer"
                          />
                          <span>{role}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !error && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                    No hay usuarios registrados en el sistema.
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
