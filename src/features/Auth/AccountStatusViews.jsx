import React from 'react'
import { authService } from '../../services/authService'
import { AlertCircle, Clock, RefreshCw, LogOut } from 'lucide-react'

export const AccountSuspendedView = () => (
  <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F4' }}>
    <div className="text-center p-8 sm:p-10 bg-white rounded-3xl card-soft border border-[#E9DFD9] max-w-md w-full animate-fade-in-up">
      <div className="w-14 h-14 bg-rose-50 text-[#B42318] border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-xl font-bold text-[#2C211F] mb-2">Cuenta Desactivada</h2>
      <p className="text-sm text-[#5D4B47] mb-6 leading-relaxed">
        Tu cuenta ha sido desactivada por el Administrador. No tienes acceso al sistema operativo.
      </p>
      <button 
        onClick={() => authService.logout()} 
        className="w-full sm:w-auto px-6 py-2.5 bg-[#FAF7F4] text-[#B42318] hover:bg-rose-50 border border-rose-200 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
      >
        <LogOut size={16} />
        Cerrar Sesión
      </button>
    </div>
  </div>
)

export const AccountPendingView = () => (
  <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F4' }}>
    <div className="text-center p-8 sm:p-10 bg-white rounded-3xl card-soft border border-[#E9DFD9] max-w-md w-full animate-fade-in-up">
      <div className="w-14 h-14 bg-[#FFF9F0] text-[#D6A24A] border border-[#E7C77A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Clock size={28} />
      </div>
      <h2 className="text-xl font-bold text-[#2C211F] mb-2">Cuenta Pendiente de Aprobación</h2>
      <p className="text-sm text-[#5D4B47] mb-6 leading-relaxed">
        Tu cuenta ha sido creada exitosamente. El Administrador debe asignarte una sede y un rol de trabajo para ingresar.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button 
          onClick={() => window.location.reload()} 
          className="w-full sm:w-auto px-5 py-2.5 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw size={15} />
          Verificar Estado
        </button>
        <button 
          onClick={() => authService.logout()} 
          className="w-full sm:w-auto px-5 py-2.5 bg-[#FAF7F4] text-[#5D4B47] hover:bg-[#F3ECE8] border border-[#D8CBC5] rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut size={15} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
)
