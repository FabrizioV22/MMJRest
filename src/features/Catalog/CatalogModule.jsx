import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Package, X, Loader2, ChevronLeft, FolderOpen } from 'lucide-react'
import { catalogService } from '../../services/catalogService'

export function CatalogModule() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // NAVEGACIÓN PRINCIPAL
  // null = Vista de Categorías (Inicio del módulo)
  // UUID = Vista de Productos de esa categoría específica
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ESTADOS DE VISTAS Y MODALES
  const [viewState, setViewState] = useState('MAIN') // MAIN, FORM_PROD, FORM_CAT
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Eliminar
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('') // 'PRODUCT' o 'CATEGORY'
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ESTADOS DE FORMULARIO
  const [prodForm, setProdForm] = useState({ id: null, nombre: '', unidad_medida: '', categoria_id: '' })
  const [catForm, setCatForm] = useState({ id: null, nombre: '' })

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

  // --- FILTROS ---
  const activeCategoryObj = categories.find(c => c.id === activeCategoryId)
  
  // Si estamos dentro de una categoría, filtramos los productos de esa categoría
  const filteredProducts = products.filter(product => {
    if (product.categoria_id !== activeCategoryId) return false
    return product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  })


  // --- MANEJADORES DE VISTAS (Navegación) ---
  const handleOpenCategory = (id) => {
    setActiveCategoryId(id)
    setSearchTerm('')
    setViewState('MAIN')
  }

  const handleBackToCategories = () => {
    setActiveCategoryId(null)
    setSearchTerm('')
    setViewState('MAIN')
  }

  const cancelView = () => {
    setViewState('MAIN')
    setItemToDelete(null)
    setDeleteType('')
  }


  // --- MANEJADORES DE FORMULARIOS (Productos) ---
  const openCreateProduct = () => {
    setProdForm({ id: null, nombre: '', unidad_medida: '', categoria_id: activeCategoryId || categories[0]?.id || '' })
    setIsEditMode(false)
    setViewState('FORM_PROD')
  }

  const openEditProduct = (product) => {
    setProdForm({ id: product.id, nombre: product.nombre, unidad_medida: product.unidad_medida, categoria_id: product.categoria_id })
    setIsEditMode(true)
    setViewState('FORM_PROD')
  }

  const handleSaveProduct = async () => {
    if (!prodForm.nombre || !prodForm.unidad_medida || !prodForm.categoria_id) {
      alert("Por favor completa todos los campos del producto.")
      return
    }
    
    setIsSubmitting(true)
    try {
      const payload = {
        nombre: prodForm.nombre,
        unidad_medida: prodForm.unidad_medida,
        categoria_id: prodForm.categoria_id
      }
      if (isEditMode) await catalogService.updateProduct(prodForm.id, payload)
      else await catalogService.createProduct(payload)
      
      await fetchData()
      cancelView()
    } catch (error) {
      console.error(error)
      alert('Error guardando producto.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // --- MANEJADORES DE FORMULARIOS (Categorías) ---
  const openCreateCategory = () => {
    setCatForm({ id: null, nombre: '' })
    setIsEditMode(false)
    setViewState('FORM_CAT')
  }

  const openEditCategory = (e, cat) => {
    e.stopPropagation() // Evitar entrar a la categoría al hacer clic en editar
    setCatForm({ id: cat.id, nombre: cat.nombre })
    setIsEditMode(true)
    setViewState('FORM_CAT')
  }

  const handleSaveCategory = async () => {
    if (!catForm.nombre) {
      alert("Por favor ingresa el nombre de la categoría.")
      return
    }
    
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateCategory(catForm.id, { nombre: catForm.nombre })
      else await catalogService.createCategory({ nombre: catForm.nombre })
      
      await fetchData()
      cancelView()
    } catch (error) {
      console.error(error)
      alert('Error guardando categoría. Es posible que el nombre ya exista.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // --- MANEJADORES DE ELIMINACIÓN ---
  const confirmDelete = (e, item, type) => {
    e.stopPropagation()
    setItemToDelete(item)
    setDeleteType(type)
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      if (deleteType === 'PRODUCT') {
        await catalogService.deleteProduct(itemToDelete.id)
      } else if (deleteType === 'CATEGORY') {
        await catalogService.deleteCategory(itemToDelete.id)
        if (activeCategoryId === itemToDelete.id) {
          handleBackToCategories() // Si borra la categoría en la que está
        }
      }
      await fetchData()
      cancelView()
    } catch (error) {
      console.error(error)
      alert('Error al eliminar. Si es una categoría, asegúrate de que no tenga productos asociados.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // --- RENDERIZADO CONDICIONAL ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  // 1. VISTA FORMULARIO PRODUCTO
  if (viewState === 'FORM_PROD') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Editar Producto' : 'Crear Producto'}</h3>
            <p className="text-gray-500 text-sm">Gestiona la información del producto en el catálogo.</p>
          </div>
          <button onClick={cancelView} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Nombre del Producto</label>
            <input 
              type="text" 
              value={prodForm.nombre}
              onChange={(e) => setProdForm({...prodForm, nombre: e.target.value})}
              placeholder="Ej. Huachalomo"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Unidad de Medida</label>
            <input 
              type="text" 
              value={prodForm.unidad_medida}
              onChange={(e) => setProdForm({...prodForm, unidad_medida: e.target.value})}
              placeholder="Ej. gr, kg, unidad"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Categoría</label>
            <select 
              value={prodForm.categoria_id}
              onChange={(e) => setProdForm({...prodForm, categoria_id: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <button onClick={cancelView} disabled={isSubmitting} className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSaveProduct} disabled={isSubmitting} className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors flex items-center">
            {isSubmitting && <Loader2 className="animate-spin mr-2" size={18} />}
            Guardar
          </button>
        </div>
      </div>
    )
  }

  // 2. VISTA FORMULARIO CATEGORÍA
  if (viewState === 'FORM_CAT') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <p className="text-gray-500 text-sm">Clasifica tus productos creando una nueva área.</p>
          </div>
          <button onClick={cancelView} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Nombre de la Categoría</label>
          <input 
            type="text" 
            value={catForm.nombre}
            onChange={(e) => setCatForm({...catForm, nombre: e.target.value.toUpperCase()})}
            placeholder="Ej. BEBIDAS"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all uppercase"
          />
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <button onClick={cancelView} disabled={isSubmitting} className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors">
            Cancelar
          </button>
          <button onClick={handleSaveCategory} disabled={isSubmitting} className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors flex items-center">
            {isSubmitting && <Loader2 className="animate-spin mr-2" size={18} />}
            Guardar Categoría
          </button>
        </div>
      </div>
    )
  }

  // 3. VISTAS PRINCIPALES (Tarjetas de Categorías o Lista de Productos)
  return (
    <div className="space-y-6 relative animate-in fade-in">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          {activeCategoryId && (
            <button 
              onClick={handleBackToCategories}
              className="p-2 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              title="Volver a Categorías"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategoryId ? `Catálogo: ${activeCategoryObj?.nombre}` : 'Áreas de Catálogo'}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeCategoryId ? 'Gestiona los productos de esta área' : 'Selecciona un área para ver sus productos'}
            </p>
          </div>
        </div>

        <button 
          onClick={activeCategoryId ? openCreateProduct : openCreateCategory}
          className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors shadow-sm text-white ${activeCategoryId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          <Plus size={20} />
          <span>{activeCategoryId ? 'Nuevo Producto' : 'Nueva Categoría'}</span>
        </button>
      </div>

      {/* RENDERIZAR CAJAS DE CATEGORÍAS SI ESTAMOS EN ROOT */}
      {!activeCategoryId ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => handleOpenCategory(cat.id)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative"
            >
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => openEditCategory(e, cat)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-md hover:bg-blue-50 shadow-sm transition-colors"><Edit2 size={14}/></button>
                <button onClick={(e) => confirmDelete(e, cat, 'CATEGORY')} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md hover:bg-red-50 shadow-sm transition-colors"><Trash2 size={14}/></button>
              </div>

              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{cat.nombre}</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {products.filter(p => p.categoria_id === cat.id).length} ítems
              </span>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-900">No hay categorías</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera área (Ej. COCINA).</p>
            </div>
          )}
        </div>
      ) : (
        /* RENDERIZAR PRODUCTOS DE LA CATEGORÍA SELECCIONADA */
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Buscar en ${activeCategoryObj?.nombre}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow group relative overflow-hidden">
                {/* Decoración lateral para indicar que es un producto */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                
                <div className="pl-3">
                  <h3 className="text-lg font-semibold text-gray-800">{product.nombre}</h3>
                  <div className="flex flex-col mt-1 space-y-1">
                    <p className="text-gray-500 text-sm">Unidad: <span className="font-medium text-gray-700">{product.unidad_medida}</span></p>
                    <p className="text-gray-500 text-sm">Stock Actual: <span className={`font-bold ${product.stock_actual > 10 ? 'text-green-600' : 'text-orange-500'}`}>{product.stock_actual}</span></p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditProduct(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-blue-100">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => confirmDelete(e, product, 'PRODUCT')} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm border border-transparent hover:border-red-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">No hay productos aquí</h3>
                <p className="mt-1 text-sm text-gray-500">Añade un producto a esta categoría.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Universal de Eliminación */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  ¿Eliminar {deleteType === 'CATEGORY' ? 'Categoría' : 'Producto'}?
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Estás a punto de eliminar <strong>{itemToDelete.nombre}</strong>. 
                  {deleteType === 'CATEGORY' && ' Asegúrate de que no tenga productos.'}
                  {' '}Esta acción no se puede deshacer.
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
