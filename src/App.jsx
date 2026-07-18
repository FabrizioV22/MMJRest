import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CatalogModule } from './features/Catalog/CatalogModule'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div className="p-8 text-center text-gray-500">Bienvenido al Sistema. Seleccione una opción.</div>} />
          <Route path="/inventario" element={<CatalogModule />} />
          <Route path="/caja" element={<div className="p-8 text-center text-gray-500">Módulo Caja (En construcción)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
