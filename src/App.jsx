import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Layout } from './components/Layout'
import { LoginModule } from './features/Auth/LoginModule'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SedeProvider } from './context/SedeContext'
import { ToastProvider } from './context/ToastContext'
import { AccountSuspendedView, AccountPendingView } from './features/Auth/AccountStatusViews'
import { ErrorBoundary } from './components/ErrorBoundary'
import { APP_ROUTES } from './config/navigation'

function ModuleLoader() {
  return (
    <div className="flex flex-col justify-center items-center h-64 space-y-3">
      <Loader2 className="animate-spin text-[#A80F14]" size={38} />
      <span className="text-sm font-medium text-[#5D4B47]">Cargando módulo...</span>
    </div>
  )
}

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
      <ErrorBoundary moduleName="Mama Julia">
        <Layout>
          <Suspense fallback={<ModuleLoader />}>
            <Routes>
              {APP_ROUTES.filter(route => route.allowedRoles.some(r => userRoles.includes(r))).map(route => {
                const Element = route.component;
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={
                      <ErrorBoundary moduleName={route.name}>
                        <Element />
                      </ErrorBoundary>
                    } 
                  />
                )
              })}
              
              <Route path="*" element={
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold text-[#2C211F]">403 Acceso Denegado</h1>
                  <p className="text-[#5D4B47] mt-2">No tienes permiso para ver este módulo con tus roles: {userRoles.join(', ')}.</p>
                </div>
              } />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
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
