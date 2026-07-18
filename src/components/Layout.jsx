import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Wallet, LogOut } from 'lucide-react'
import { authService } from '../services/authService'

export function Layout({ children }) {
  const location = useLocation()

  const navItems = [
    { name: 'Inicio', path: '/', icon: LayoutDashboard },
    { name: 'Inventario', path: '/inventario', icon: Package },
    { name: 'Caja', path: '/caja', icon: Wallet },
  ]

  return (
    <div className="flex h-screen flex-col md:flex-row" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar for Desktop — Dark Premium */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <h1 className="font-display text-2xl font-bold tracking-wider text-white">MAMA JULIA</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Sistema de Gestión</p>
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
            className="w-full flex items-center justify-center space-x-2 p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center font-medium">v1.0 — Desarrollo</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
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
          className="flex flex-col items-center justify-center w-full py-2 space-y-0.5 text-slate-500 hover:text-red-400 rounded-xl cursor-pointer transition-all"
        >
          <LogOut size={22} strokeWidth={1.5} />
          <span className="text-[10px] font-bold tracking-wide uppercase">Salir</span>
        </button>
      </nav>
    </div>
  )
}
