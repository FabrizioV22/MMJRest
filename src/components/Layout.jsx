import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="flex h-screen flex-col md:flex-row overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar para Desktop — Warm Peruvian Stone Theme */}
      <aside 
        className={`hidden md:flex flex-col bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-amber-50 transition-all duration-300 ease-in-out relative border-r border-amber-900/20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Botón de Colapso con Flecha */}
        <button
          onClick={toggleSidebar}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          className="absolute -right-3.5 top-7 z-50 bg-stone-800 text-amber-200 hover:text-white border border-amber-700/30 p-1.5 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand / Logo */}
        <div className={`p-5 border-b border-amber-900/20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div>
              <h1 className="font-display text-xl font-black tracking-wider text-amber-100">MAMA JULIA</h1>
              <p className="text-[11px] text-amber-500 font-medium tracking-wide mt-0.5">Gestión Gastronómica</p>
            </div>
          ) : (
            <div className="w-10 h-10 bg-amber-600/20 border border-amber-600/40 rounded-xl flex items-center justify-center font-display font-black text-amber-400 text-lg shadow-inner">
              MJ
            </div>
          )}
        </div>

        {/* Selector de Sede Desktop */}
        <div className="p-3 border-b border-amber-900/20">
          <div className={`flex items-center space-x-2 bg-stone-800/90 p-2.5 rounded-xl border border-amber-700/20 shadow-inner ${isCollapsed ? 'justify-center' : ''}`}>
            <MapPin size={16} className="text-amber-500 shrink-0" />
            {!isCollapsed && (
              <select 
                value={activeSede?.id || ''} 
                onChange={(e) => changeSede(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-100 outline-none w-full cursor-pointer appearance-none"
              >
                {sedes.map(s => (
                  <option key={s.id} value={s.id} className="bg-stone-800 text-white">{s.nombre}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        {/* Navegación Principal */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-0' : ''
                } ${
                  isActive 
                    ? 'bg-amber-600/25 text-amber-300 shadow-lg shadow-amber-950/40 font-bold border border-amber-500/30' 
                    : 'text-stone-400 hover:bg-white/5 hover:text-amber-100'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
                {!isCollapsed && isActive && <span className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full"></span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer & Botón de Salida */}
        <div className="p-3 border-t border-amber-900/20 space-y-2">
          <button 
            onClick={() => authService.logout()}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            className={`w-full flex items-center justify-center p-3 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl transition-all cursor-pointer border border-rose-500/20 ${
              isCollapsed ? 'space-x-0' : 'space-x-2'
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-xs font-bold">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {/* Header Superior Móvil */}
        <div className="md:hidden sticky top-0 z-40 bg-stone-900 text-white border-b border-amber-900/20 p-3.5 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600/20 border border-amber-600/40 rounded-lg flex items-center justify-center font-display font-black text-amber-400 text-xs">
              MJ
            </div>
            <h1 className="font-display font-bold text-amber-100 tracking-wider text-base">MAMA JULIA</h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Selector de Sede Móvil */}
            <div className="flex items-center space-x-1 bg-stone-800 px-2.5 py-1.5 rounded-xl border border-amber-700/20 text-xs">
              <MapPin size={13} className="text-amber-500 shrink-0" />
              <select 
                value={activeSede?.id || ''} 
                onChange={(e) => changeSede(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-100 outline-none cursor-pointer appearance-none pr-1"
              >
                {sedes.map(s => (
                  <option key={s.id} value={s.id} className="bg-stone-800 text-white">{s.nombre}</option>
                ))}
              </select>
            </div>

            {/* Botón Cerrar Sesión Móvil */}
            <button
              onClick={() => authService.logout()}
              title="Cerrar Sesión"
              className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 transition-all cursor-pointer"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-md border-t border-amber-900/20 flex justify-around py-2 px-2 z-50 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 space-y-1 rounded-xl cursor-pointer transition-all ${
                isActive 
                  ? 'text-amber-400 font-bold' 
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] tracking-wide">{item.name}</span>
              {isActive && <span className="w-3 h-0.5 bg-amber-400 rounded-full"></span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
