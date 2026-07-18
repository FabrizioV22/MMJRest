import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogModule } from './features/Catalog/CatalogModule'
import { DashboardModule } from './features/Dashboard/DashboardModule'
import { LoginModule } from './features/Auth/LoginModule'
import { authService } from './services/authService'
import { Loader2 } from 'lucide-react'

function App() {
  const [session, setSession] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Verificar sesión inicial
    authService.getSession().then((sess) => {
      setSession(sess)
      setIsInitializing(false)
    })

    // Escuchar cambios (login, logout)
    const { data: { subscription } } = authService.onAuthStateChange((sess) => {
      setSession(sess)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>
  }

  if (!session) {
    return <LoginModule />
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardModule />} />
          <Route path="/inventario" element={<CatalogModule />} />
          <Route path="/caja" element={<div className="p-8 text-center text-slate-500">Módulo Caja (En construcción)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
