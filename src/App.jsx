import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoginModule } from './features/Auth/LoginModule'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AccountSuspendedView, AccountPendingView } from './features/Auth/AccountStatusViews'
import { APP_ROUTES } from './config/navigation'

function AppRoutes() {
  const { session, userProfile } = useAuth()

  if (!session) {
    return <LoginModule />
  }

  // Si el usuario está inactivo, lo bloqueamos
  if (userProfile?.activo === false) {
    return <AccountSuspendedView />
  }

  // Si el usuario está pendiente, no lo dejamos ver nada
  if (userProfile?.rol === 'PENDIENTE') {
    return <AccountPendingView />
  }

  const rol = userProfile?.rol

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {APP_ROUTES.filter(route => route.allowedRoles.includes(rol)).map(route => {
            const Element = route.component;
            return <Route key={route.path} path={route.path} element={<Element />} />
          })}
          
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
