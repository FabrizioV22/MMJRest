import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, MapPin } from 'lucide-react'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { useSede } from '../context/SedeContext'
import { APP_ROUTES } from '../config/navigation'

export function Layout({ children }) {
  const location = useLocation()
  const { userProfile, isAdmin } = useAuth()
  const { sedes, activeSede, changeSede } = useSede()
  const userRoles = userProfile?.roles || []

  const navItems = APP_ROUTES.filter(route => route.allowedRoles.some(r => userRoles.includes(r)))

  return (
    <div className="flex h-screen flex-col md:flex-row" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar for Desktop — Dark Premium */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <h1 className="font-display text-2xl font-bold tracking-wider text-white">MAMA JULIA</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Sistema de Gestión</p>
        </div>

        {/* Sede Selector Desktop */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-white/5 shadow-inner">
            <MapPin size={16} className="text-emerald-400 shrink-0" />
            <select 
              value={activeSede?.id || ''} 
              onChange={(e) => changeSede(e.target.value)}
              className="bg-transparent text-sm font-bold text-white outline-none w-full cursor-pointer appearance-none"
            >
              {sedes.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-white">{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{item.name}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={() => authService.logout()}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center font-medium">v1.0 — Desarrollo</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {/* Mobile Header & Sede Selector */}
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100 p-4 flex justify-between items-center shadow-sm">
          <h1 className="font-display font-bold text-slate-800 tracking-wider text-lg">MAMA JULIA</h1>
          <div className="flex items-center space-x-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <MapPin size={14} className="text-emerald-500" />
            <select 
              value={activeSede?.id || ''} 
              onChange={(e) => changeSede(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer appearance-none"
            >
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile — Dark Premium */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 flex justify-around py-2 px-1 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full py-2 space-y-0.5 rounded-xl cursor-pointer transition-all ${
                isActive 
                  ? 'text-emerald-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-bold tracking-wide uppercase">{item.name}</span>
              {isActive && <span className="w-4 h-0.5 bg-emerald-400 rounded-full mt-0.5"></span>}
            </Link>
          )
        })}
        <button
          onClick={() => authService.logout()}
          className="flex flex-col items-center justify-center w-full py-2 space-y-0.5 text-red-400 hover:text-red-300 rounded-xl cursor-pointer transition-all"
        >
          <LogOut size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-bold tracking-wide uppercase">Salir</span>
        </button>
      </nav>
    </div>
  )
}
