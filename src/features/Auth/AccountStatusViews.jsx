import React from 'react'
import { authService } from '../../services/authService'

export const AccountSuspendedView = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center p-8 bg-white rounded-2xl card-soft border border-slate-100 max-w-md">
      <h2 className="text-xl font-bold text-red-600 mb-2">Cuenta Desactivada</h2>
      <p className="text-slate-500 mb-6">Tu cuenta ha sido desactivada por el Administrador. No tienes acceso al sistema.</p>
      <button 
        onClick={() => authService.logout()} 
        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  </div>
)

export const AccountPendingView = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center p-8 bg-white rounded-2xl card-soft border border-slate-100 max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Cuenta Pendiente</h2>
      <p className="text-slate-500 mb-6">Tu cuenta ha sido creada pero el Administrador aún no te ha asignado un rol. Por favor, comunícate con gerencia.</p>
      <div className="flex items-center justify-center space-x-4">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm"
        >
          Refrescar
        </button>
        <button 
          onClick={() => authService.logout()} 
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
)
