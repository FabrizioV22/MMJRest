import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogModule } from './features/Catalog/CatalogModule'
import { DashboardModule } from './features/Dashboard/DashboardModule'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardModule />} />
          <Route path="/inventario" element={<CatalogModule />} />
          <Route path="/caja" element={<div className="p-8 text-center text-gray-500">Módulo Caja (En construcción)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
