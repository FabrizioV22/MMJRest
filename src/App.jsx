import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogModule } from './features/Catalog/CatalogModule'
import { DashboardModule } from './features/Dashboard/DashboardModule'
import { LoginModule } from './features/Auth/LoginModule'
import { UsersModule } from './features/Users/UsersModule'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppRoutes() {
  const { session, userProfile } = useAuth()

  if (!session) {
    return <LoginModule />
  }

  // Si el usuario está inactivo, lo bloqueamos
  if (userProfile?.activo === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl card-soft border border-slate-100 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Cuenta Desactivada</h2>
          <p className="text-slate-500 mb-6">Tu cuenta ha sido desactivada por el Administrador. No tienes acceso al sistema.</p>
          <button onClick={() => {
            import('./services/authService').then(m => m.authService.logout())
          }} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors">Cerrar Sesión</button>
        </div>
      </div>
    )
  }

  // Si el usuario está pendiente, no lo dejamos ver nada
  if (userProfile?.rol === 'PENDIENTE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl card-soft border border-slate-100 max-w-md">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Cuenta Pendiente</h2>
          <p className="text-slate-500 mb-6">Tu cuenta ha sido creada pero el Administrador aún no te ha asignado un rol. Por favor, comunícate con gerencia.</p>
          <div className="flex items-center justify-center space-x-4">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">Refrescar</button>
            <button onClick={() => {
              import('./services/authService').then(m => m.authService.logout())
            }} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-sm transition-colors">Cerrar Sesión</button>
          </div>
        </div>
      </div>
    )
  }

  const rol = userProfile?.rol

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rutas para ADMIN y GERENCIA (Dashboard) */}
          {(rol === 'ADMIN') && <Route path="/" element={<DashboardModule />} />}
          
          {/* Rutas para ALMACEN y ADMIN */}
          {(rol === 'ADMIN' || rol === 'ALMACEN') && <Route path="/inventario" element={<CatalogModule />} />}
          
          {/* Rutas para MESERO y ADMIN */}
          {(rol === 'ADMIN' || rol === 'MESERO') && <Route path="/caja" element={<div className="p-8 text-center text-slate-500">Módulo Caja (En construcción)</div>} />}
          
          {/* Rutas EXCLUSIVAS de ADMIN */}
          {rol === 'ADMIN' && <Route path="/personal" element={<UsersModule />} />}
          
          {/* Fallback si intenta ir a una ruta que no tiene acceso */}
          <Route path="*" element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-800">403 Acceso Denegado</h1>
              <p className="text-slate-500 mt-2">No tienes permiso para ver este módulo con tu rol de {rol}.</p>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
