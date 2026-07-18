import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, X, Loader2 } from 'lucide-react'
import { catalogService } from '../../services/catalogService'

export function CatalogModule() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  
  // Estado para modales y vistas
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State para Create / Edit
  const [formData, setFormData] = useState({ name: '', unit: '', category_id: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getProducts()
      ])
      setCategories(cats)
      setProducts(prods)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error cargando datos del catálogo. Verifica la conexión a Supabase.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'ALL' || product.categoria_id === activeCategory
    return matchesSearch && matchesCategory
  })

  // Handlers para abrir vistas
  const openEditView = (product) => {
    setSelectedProduct(product)
    setFormData({ name: product.nombre, unit: product.unidad_medida, category_id: product.categoria_id })
    setIsEditMode(true)
    setIsCreateMode(false)
  }

  const openCreateView = () => {
    setSelectedProduct(null)
    setFormData({ name: '', unit: '', category_id: categories[0]?.id || '' })
    setIsCreateMode(true)
    setIsEditMode(false)
  }

  const openDeleteModal = (product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const cancelView = () => {
    setIsCreateMode(false)
    setIsEditMode(false)
    setIsDeleteModalOpen(false)
    setSelectedProduct(null)
  }

  // Handlers para acciones en DB
  const handleSave = async () => {
    if (!formData.name || !formData.unit || !formData.category_id) {
      alert("Por favor completa todos los campos.")
      return
    }
    
    setIsSubmitting(true)
    try {
      const dbPayload = {
        nombre: formData.name,
        unidad_medida: formData.unit,
        categoria_id: formData.category_id
      }

      if (isEditMode) {
        await catalogService.updateProduct(selectedProduct.id, dbPayload)
      } else {
        await catalogService.createProduct(dbPayload)
      }
      
      await fetchData() // Refrescar la lista
      cancelView()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Hubo un error al guardar el producto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await catalogService.deleteProduct(selectedProduct.id)
      await fetchData() // Refrescar
      cancelView()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar producto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
          <p className="text-gray-500 text-sm">Gestiona productos y categorías</p>
        </div>
        {!isCreateMode && !isEditMode && (
          <button 
            onClick={openCreateView}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Vista de Edición o Creación */}
      {(isEditMode || isCreateMode) ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Editar Producto' : 'Crear Producto'}</h3>
              <p className="text-gray-500 text-sm">
                {isEditMode ? 'Modifica los detalles del producto seleccionado' : 'Añade un nuevo producto al catálogo'}
              </p>
            </div>
            <button 
              onClick={cancelView} 
              className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nombre del Producto</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Huachalomo"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Unidad de Medida</label>
              <input 
                type="text" 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="Ej. gr, kg, unidad"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Categoría</label>
              <select 
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button 
              onClick={cancelView}
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors flex items-center"
            >
              {isSubmitting && <Loader2 className="animate-spin mr-2" size={18} />}
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        <>
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

            {/* Chips de Categorías */}
            <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-hide">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              // Si hicimos el join, Supabase devuelve categorias: { nombre: '...' }
              const catName = product.categorias?.nombre || categories.find(c => c.id === product.categoria_id)?.nombre
              
              return (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow group">
                  <div>
                    <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">{catName}</span>
                    <h3 className="text-lg font-semibold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">{product.nombre}</h3>
                    <p className="text-gray-500 text-sm mt-1">Unidad: <span className="font-medium text-gray-700">{product.unidad_medida}</span></p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditView(product)}
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
              <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">No hay productos</h3>
                <p className="mt-1 text-sm text-gray-500">Intenta buscando con otro término o categoría.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar producto?</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Estás a punto de eliminar <strong>{selectedProduct?.nombre}</strong>. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between space-x-2">
              <button 
                onClick={cancelView}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 flex justify-center items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
