import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, Wallet } from 'lucide-react'

export function Layout({ children }) {
  const location = useLocation()

  const navItems = [
    { name: 'Inicio', path: '/', icon: LayoutDashboard },
    { name: 'Catálogo', path: '/catalogo', icon: Package },
    { name: 'Kardex', path: '/kardex', icon: ClipboardList },
    { name: 'Caja', path: '/caja', icon: Wallet },
  ]

  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Inventario Pro</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full p-2 space-y-1 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <item.icon size={24} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
