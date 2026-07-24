import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoginModule } from './features/Auth/LoginModule'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SedeProvider } from './context/SedeContext'
import { ToastProvider } from './context/ToastContext'
import { AccountSuspendedView, AccountPendingView } from './features/Auth/AccountStatusViews'
import { APP_ROUTES } from './config/navigation'

function AppRoutes() {
  const { session, userProfile } = useAuth()

  if (!session) {
    return <LoginModule />
  }

  if (userProfile?.activo === false) {
    return <AccountSuspendedView />
  }

  if (userProfile?.roles?.includes('PENDIENTE')) {
    return <AccountPendingView />
  }

  const userRoles = userProfile?.roles || []

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {APP_ROUTES.filter(route => route.allowedRoles.some(r => userRoles.includes(r))).map(route => {
            const Element = route.component;
            return <Route key={route.path} path={route.path} element={<Element />} />
          })}
          
          <Route path="*" element={
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-800">403 Acceso Denegado</h1>
              <p className="text-slate-500 mt-2">No tienes permiso para ver este módulo con tus roles: {userRoles.join(', ')}.</p>
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
      <SedeProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </SedeProvider>
    </AuthProvider>
  )
}

export default App
