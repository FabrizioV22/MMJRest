import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, MapPin, ChevronLeft } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { useSede } from '../context/SedeContext'
import { APP_ROUTES } from '../config/navigation'

export function Layout({ children }) {
  const location = useLocation()
  const { userProfile } = useAuth()
  const { sedes, activeSede, changeSede } = useSede()
  const userRoles = userProfile?.roles || []

  // Estado del sidebar colapsado (Desktop)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true'
  })

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar_collapsed', String(next))
      return next
    })
  }

  const navItems = APP_ROUTES.filter(route => route.allowedRoles.some(r => userRoles.includes(r)))

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden" style={{ backgroundColor: '#FAF7F4' }}>
      {/* Sidebar para Desktop — Identidad Gastronómica Mama Julia (#211716) */}
      <aside 
        style={{ backgroundColor: '#211716' }}
        className={`hidden md:flex flex-col text-stone-200 transition-all duration-300 ease-in-out relative border-r border-[#3A0F0F]/50 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Botón de Colapso con rotación animada */}
        <button
          onClick={toggleSidebar}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          className="absolute -right-3.5 top-7 z-50 bg-[#2C211F] text-[#E7C77A] hover:text-white border border-[#5D4B47]/60 p-1.5 rounded-full shadow-md transition-all duration-300 hover:scale-110 cursor-pointer"
        >
          <ChevronLeft size={14} className={`transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
        </button>

        {/* Brand / Logo - Animación suave de texto */}
        <div className="p-4 border-b border-[#3A0F0F]/60 flex items-center justify-between h-20 overflow-hidden">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-[#3A0F0F] border border-[#D6A24A]/40 rounded-xl flex items-center justify-center font-display font-black text-[#E7C77A] text-lg shadow-inner shrink-0">
              MJ
            </div>
            <div className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'}`}>
              <h1 className="font-display text-xl font-black tracking-wider text-[#FFF9F0]">MAMA JULIA</h1>
              <p className="text-[11px] text-[#D6A24A] font-medium tracking-wide mt-0.5">Gestión Gastronómica</p>
            </div>
          </div>
        </div>

        {/* Selector de Sede Desktop */}
        <div className="p-3 border-b border-[#3A0F0F]/60">
          <div className="flex items-center bg-[#2C211F] p-2.5 rounded-xl border border-[#5D4B47]/40 shadow-inner overflow-hidden">
            <MapPin size={16} className="text-[#D6A24A] shrink-0" />
            <div className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ml-2 flex-1 ${isCollapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-xs opacity-100'}`}>
              <select 
                value={activeSede?.id || ''} 
                aria-label="Seleccionar sede de trabajo"
                onChange={(e) => changeSede(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#FFF9F0] outline-none w-full cursor-pointer appearance-none pr-2"
              >
                {sedes.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#211716] text-[#FFF9F0]">{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Navegación Principal con Transición Suave de Texto */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer relative group ${
                  isActive 
                    ? 'bg-[#A80F14] text-[#FFF9F0] shadow-md font-bold' 
                    : 'text-[#D8CBC5] hover:bg-white/5 hover:text-[#FFF9F0]'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.75} className={`shrink-0 ${isActive ? 'text-[#FFF9F0]' : 'group-hover:text-[#E7C77A]'}`} />
                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                  isCollapsed ? 'max-w-0 opacity-0 pointer-events-none ml-0' : 'max-w-xs opacity-100 ml-3'
                }`}>
                  {item.name}
                </span>
                {isActive && (
                  <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#D6A24A]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer & Botón de Salida Animado */}
        <div className="p-3 border-t border-[#3A0F0F]/60">
          <button 
            onClick={() => authService.logout()}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            aria-label="Cerrar Sesión"
            className="w-full flex items-center justify-center p-3 text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 hover:text-rose-200 rounded-xl transition-all duration-200 cursor-pointer border border-rose-800/30"
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
              isCollapsed ? 'max-w-0 opacity-0 pointer-events-none ml-0' : 'max-w-xs opacity-100 ml-2'
            }`}>
              <span className="text-xs font-bold">Cerrar Sesión</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {/* Header Superior Móvil */}
        <div style={{ backgroundColor: '#211716' }} className="md:hidden sticky top-0 z-40 text-white border-b border-[#3A0F0F]/60 p-3.5 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#3A0F0F] border border-[#D6A24A]/40 rounded-lg flex items-center justify-center font-display font-black text-[#E7C77A] text-xs">
              MJ
            </div>
            <h1 className="font-display font-bold text-[#FFF9F0] tracking-wider text-base">MAMA JULIA</h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Selector de Sede Móvil */}
            <div className="flex items-center space-x-1 bg-[#2C211F] px-2.5 py-1.5 rounded-xl border border-[#5D4B47]/40 text-xs">
              <MapPin size={13} className="text-[#D6A24A] shrink-0" />
              <select 
                value={activeSede?.id || ''} 
                aria-label="Seleccionar sede de trabajo"
                onChange={(e) => changeSede(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#FFF9F0] outline-none cursor-pointer appearance-none pr-1"
              >
                {sedes.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#211716] text-[#FFF9F0]">{s.nombre}</option>
                ))}
              </select>
            </div>

            {/* Botón Cerrar Sesión Móvil */}
            <button
              onClick={() => authService.logout()}
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
              className="p-2 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 rounded-xl border border-rose-800/30 transition-all cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation para Móvil */}
      <nav style={{ backgroundColor: '#211716' }} className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#3A0F0F]/60 flex justify-around py-2 px-2 z-50 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 space-y-1 rounded-xl cursor-pointer transition-all ${
                isActive 
                  ? 'text-[#C61B20] font-bold' 
                  : 'text-[#D8CBC5] hover:text-[#FFF9F0]'
              }`}
            >
              <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="text-[10px] tracking-wide">{item.name}</span>
              {isActive && <span className="w-3 h-0.5 bg-[#D6A24A] rounded-full"></span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
