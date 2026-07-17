import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Package, X } from 'lucide-react'

// Datos de prueba iniciales basados en los requerimientos
const MOCK_CATEGORIES = [
  { id: 1, name: 'COCINA' },
  { id: 2, name: 'SALÓN' },
  { id: 3, name: 'ALMACÉN' },
  { id: 4, name: 'DESCARTABLES' }
]

const MOCK_PRODUCTS = [
  { id: 1, category_id: 1, name: 'Huachalomo', unit: 'gr' },
  { id: 2, category_id: 4, name: 'Deli 800', unit: 'unidad' },
  { id: 3, category_id: 2, name: 'Plato Tendido', unit: 'unidad' },
]

export function CatalogModule() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  
  // Estado para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'ALL' || product.category_id === activeCategory
    return matchesSearch && matchesCategory
  })

  const openEditModal = (product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
          <p className="text-gray-500 text-sm">Gestiona productos y categorías</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          />
        </div>

        {/* Chips de Categorías (Scroll horizontal en móvil) */}
        <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todas
          </button>
          {MOCK_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Productos (Tarjetas colapsables o lista para móvil) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => {
          const category = MOCK_CATEGORIES.find(c => c.id === product.category_id)
          return (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">{category?.name}</span>
                <h3 className="text-lg font-semibold text-gray-800 mt-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mt-1">Unidad: <span className="font-medium text-gray-700">{product.unit}</span></p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => openEditModal(product)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => openDeleteModal(product)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">Intenta buscando con otro término o categoría.</p>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Editar Producto</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input 
                  type="text" 
                  defaultValue={selectedProduct?.name} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  readOnly // Solo vista por ahora
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                <input 
                  type="text" 
                  defaultValue={selectedProduct?.unit} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  readOnly // Solo vista por ahora
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select 
                  defaultValue={selectedProduct?.category_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled // Solo vista por ahora
                >
                  {MOCK_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar producto?</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Estás a punto de eliminar <strong>{selectedProduct?.name}</strong>. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between space-x-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
