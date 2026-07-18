import React, { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit2, Trash2, Package, X, Loader2, ChevronRight, FolderOpen, 
  ArrowDownCircle, ArrowUpCircle, Clock, Home, Settings
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { catalogService } from '../../services/catalogService'

export function CatalogModule() {
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // NAVEGACIÓN PRINCIPAL (Route Map / Breadcrumbs)
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [activeProductId, setActiveProductId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ESTADOS DE VISTAS DE FORMULARIOS Y MODALES
  const [viewState, setViewState] = useState('MAIN') // MAIN, FORM_PROD, FORM_CAT, TX_MODAL
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Historial del producto activo
  const [movements, setMovements] = useState([])
  const [isLoadingMovements, setIsLoadingMovements] = useState(false)

  // Eliminar
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('') // 'PRODUCT' o 'CATEGORY'
  
  // Transacción
  const [txType, setTxType] = useState('INGRESO')
  const [txAmount, setTxAmount] = useState('')
  const [txObs, setTxObs] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ESTADOS DE FORMULARIO CRUD
  const [prodForm, setProdForm] = useState({ id: null, nombre: '', unidad_medida: '', categoria_id: '' })
  const [catForm, setCatForm] = useState({ id: null, nombre: '' })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Deep linking desde el Dashboard u otras vistas
    if (products.length > 0 && categories.length > 0 && location.state) {
      if (location.state.openCategoryId) {
        setActiveCategoryId(location.state.openCategoryId)
      }
      if (location.state.openProductId) {
        const prod = products.find(p => p.id === location.state.openProductId)
        if (prod) handleOpenProduct(prod)
      }
      // Limpiar state para evitar loop en recargas
      window.history.replaceState({}, document.title)
    }
  }, [location.state, products, categories])

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
      alert('Error cargando datos del inventario. Verifica la conexión a Supabase.')
    } finally {
      setIsLoading(false)
    }
  }

  // --- FILTROS Y OBJETOS ACTIVOS ---
  const activeCategoryObj = categories.find(c => c.id === activeCategoryId)
  const activeProductObj = products.find(p => p.id === activeProductId)
  
  const filteredProducts = products.filter(product => {
    if (product.categoria_id !== activeCategoryId) return false
    return product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  })


  // --- MANEJADORES DE VISTAS (Navegación / Breadcrumbs) ---
  const handleGoHome = () => {
    setActiveCategoryId(null)
    setActiveProductId(null)
    setSearchTerm('')
    setViewState('MAIN')
  }

  const handleOpenCategory = (id) => {
    setActiveCategoryId(id)
    setActiveProductId(null)
    setSearchTerm('')
    setViewState('MAIN')
  }

  const handleOpenProduct = async (product) => {
    setActiveProductId(product.id)
    setSearchTerm('')
    setViewState('MAIN')
    
    // Cargar historial de movimientos
    setIsLoadingMovements(true)
    try {
      const history = await catalogService.getProductMovements(product.id)
      setMovements(history)
    } catch (error) {
      console.error(error)
      alert('Error cargando el historial del producto.')
    } finally {
      setIsLoadingMovements(false)
    }
  }

  const cancelView = () => {
    setViewState('MAIN')
    setItemToDelete(null)
    setDeleteType('')
  }


  // --- MANEJADORES DE KARDEX (Transacciones) ---
  const openTxModal = (type) => {
    setTxType(type)
    setTxAmount('')
    setTxObs('')
    setViewState('TX_MODAL')
  }

  const handleSaveTransaction = async () => {
    if (!txAmount || isNaN(txAmount) || Number(txAmount) <= 0) {
      alert('Por favor ingresa una cantidad válida mayor a 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await catalogService.registerMovement({
        p_producto_id: activeProductId,
        p_tipo_movimiento: txType,
        p_cantidad: Number(txAmount),
        p_observaciones: txObs || null
      })
      
      // Refrescar inventario y movimientos
      const [updatedProducts, newMovements] = await Promise.all([
        catalogService.getProducts(),
        catalogService.getProductMovements(activeProductId)
      ])
      
      setProducts(updatedProducts)
      setMovements(newMovements)
      cancelView()
    } catch (error) {
      console.error(error)
      alert('Error registrando el movimiento. Revisa la base de datos.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // --- MANEJADORES CRUD PRODUCTOS ---
  const openCreateProduct = () => {
    setProdForm({ id: null, nombre: '', unidad_medida: '', categoria_id: activeCategoryId || categories[0]?.id || '' })
    setIsEditMode(false)
    setViewState('FORM_PROD')
  }

  const openEditProduct = (e, product) => {
    if (e) e.stopPropagation()
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


  // --- MANEJADORES CRUD CATEGORÍAS ---
  const openCreateCategory = () => {
    setCatForm({ id: null, nombre: '' })
    setIsEditMode(false)
    setViewState('FORM_CAT')
  }

  const openEditCategory = (e, cat) => {
    e.stopPropagation()
    setCatForm({ id: cat.id, nombre: cat.nombre })
    setIsEditMode(true)
    setViewState('FORM_CAT')
  }

  const handleSaveCategory = async () => {
    if (!catForm.nombre) return alert("Por favor ingresa el nombre.")
    
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateCategory(catForm.id, { nombre: catForm.nombre })
      else await catalogService.createCategory({ nombre: catForm.nombre })
      
      await fetchData()
      cancelView()
    } catch (error) {
      alert('Error guardando categoría.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // --- MANEJADORES DE ELIMINACIÓN ---
  const confirmDelete = (e, item, type) => {
    if (e) e.stopPropagation()
    setItemToDelete(item)
    setDeleteType(type)
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      if (deleteType === 'PRODUCT') {
        await catalogService.deleteProduct(itemToDelete.id)
        if (activeProductId === itemToDelete.id) {
          handleOpenCategory(activeCategoryId) // Volver a la categoría si borró el producto activo
        }
      } else if (deleteType === 'CATEGORY') {
        await catalogService.deleteCategory(itemToDelete.id)
        if (activeCategoryId === itemToDelete.id) {
          handleGoHome()
        }
      }
      await fetchData()
      cancelView()
    } catch (error) {
      alert('Error al eliminar. Asegúrate de que no tenga dependencias o movimientos en el Kardex.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // ==========================================
  // RENDERIZADO
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  // --- RENDER 1: FORMULARIOS ---
  if (viewState === 'FORM_PROD' || viewState === 'FORM_CAT') {
    const isProd = viewState === 'FORM_PROD'
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Editar' : 'Crear'} {isProd ? 'Producto' : 'Categoría'}</h3>
          </div>
          <button onClick={cancelView} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {isProd ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nombre del Producto</label>
              <input type="text" value={prodForm.nombre} onChange={(e) => setProdForm({...prodForm, nombre: e.target.value})} placeholder="Ej. Huachalomo" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Unidad (SKU/Porción)</label>
              <input type="text" value={prodForm.unidad_medida} onChange={(e) => setProdForm({...prodForm, unidad_medida: e.target.value})} placeholder="Ej. Unidad, 100g, Kg" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Categoría</label>
              <select value={prodForm.categoria_id} onChange={(e) => setProdForm({...prodForm, categoria_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Nombre de la Categoría</label>
            <input type="text" value={catForm.nombre} onChange={(e) => setCatForm({...catForm, nombre: e.target.value.toUpperCase()})} placeholder="Ej. BEBIDAS" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>
        )}
        
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <button onClick={cancelView} disabled={isSubmitting} className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
          <button onClick={isProd ? handleSaveProduct : handleSaveCategory} disabled={isSubmitting} className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center">
            {isSubmitting && <Loader2 className="animate-spin mr-2" size={18} />} Guardar
          </button>
        </div>
      </div>
    )
  }

  // --- RENDER 2: ROUTE MAP / BREADCRUMBS ---
  return (
    <div className="space-y-6 relative animate-in fade-in">
      
      {/* BREADCRUMBS (Ruta de Navegación UX) */}
      <nav className="flex items-center text-sm font-medium text-gray-500 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
        <button onClick={handleGoHome} className={`flex items-center hover:text-blue-600 transition-colors ${!activeCategoryId ? 'text-blue-600 font-bold' : ''}`}>
          <Home size={16} className="mr-1.5" />
          Inventario
        </button>
        
        {activeCategoryId && (
          <>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <button onClick={() => handleOpenCategory(activeCategoryId)} className={`flex items-center hover:text-blue-600 transition-colors ${!activeProductId ? 'text-blue-600 font-bold' : ''}`}>
              <FolderOpen size={16} className="mr-1.5" />
              {activeCategoryObj?.nombre}
            </button>
          </>
        )}
        
        {activeProductId && (
          <>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-900 flex items-center font-bold">
              <Package size={16} className="mr-1.5 text-blue-600" />
              {activeProductObj?.nombre}
            </span>
          </>
        )}
      </nav>

      {/* --- NIVEL 1: CATEGORÍAS --- */}
      {!activeCategoryId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Áreas de Inventario</h2>
            <button onClick={openCreateCategory} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
              <Plus size={20} />
              <span>Nueva Categoría</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {categories.map(cat => (
              <div key={cat.id} onClick={() => handleOpenCategory(cat.id)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditCategory(e, cat)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-md hover:bg-blue-50 transition-colors shadow-sm"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, cat, 'CATEGORY')} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-md hover:bg-red-50 transition-colors shadow-sm"><Trash2 size={14}/></button>
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
          </div>
        </div>
      )}

      {/* --- NIVEL 2: LISTA DE PRODUCTOS --- */}
      {activeCategoryId && !activeProductId && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Productos: {activeCategoryObj?.nombre}</h2>
            <button onClick={openCreateProduct} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
              <Plus size={20} />
              <span>Nuevo Producto</span>
            </button>
          </div>
          
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
              <div 
                key={product.id} 
                onClick={() => handleOpenProduct(product)}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                <div className="pl-3">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{product.nombre}</h3>
                  <p className="text-gray-500 text-sm mt-1">{product.unidad_medida}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                  <p className={`text-xl font-bold ${product.stock_actual > 10 ? 'text-green-600' : 'text-orange-500'}`}>
                    {product.stock_actual}
                  </p>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">No hay productos</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NIVEL 3: DETALLE DEL PRODUCTO (KARDEX / CONFIGURACIÓN) --- */}
      {activeProductId && activeProductObj && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          
          {/* Tarjeta Principal del Producto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-3xl font-black text-gray-900">{activeProductObj.nombre}</h2>
                <p className="text-gray-500 font-medium flex items-center mt-1">
                  <Package size={16} className="mr-1" /> SKU/Presentación: {activeProductObj.unidad_medida}
                </p>
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => openEditProduct(e, activeProductObj)} className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  <Settings size={18} className="mr-2" /> Configurar
                </button>
                <button onClick={(e) => confirmDelete(e, activeProductObj, 'PRODUCT')} className="flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-slate-50 to-white">
              <div className="text-center md:text-left">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Actual en Inventario</p>
                <div className="flex items-baseline justify-center md:justify-start space-x-2">
                  <span className="text-6xl font-black text-gray-900 tracking-tight">{activeProductObj.stock_actual}</span>
                  <span className="text-xl font-semibold text-gray-400 uppercase">{activeProductObj.unidad_medida}</span>
                </div>
              </div>
              
              <div className="flex w-full md:w-auto gap-3">
                <button onClick={() => openTxModal('INGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-2xl font-bold transition-all shadow-sm border border-green-100 hover:border-green-600 group">
                  <ArrowDownCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span>Ingreso</span>
                </button>
                <button onClick={() => openTxModal('EGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-2xl font-bold transition-all shadow-sm border border-red-100 hover:border-red-600 group">
                  <ArrowUpCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span>Egreso</span>
                </button>
              </div>
            </div>
          </div>

          {/* Historial de Movimientos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/50">
              <Clock className="text-gray-400" size={20} />
              <h3 className="font-bold text-gray-800">Historial de Transacciones (Kardex)</h3>
            </div>
            
            {isLoadingMovements ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay movimientos registrados aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-semibold">Fecha y Hora</th>
                      <th className="p-4 font-semibold">Operación</th>
                      <th className="p-4 font-semibold text-right">Cantidad</th>
                      <th className="p-4 font-semibold text-right">Stock Final</th>
                      <th className="p-4 font-semibold">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map(mov => (
                      <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                          {new Date(mov.fecha).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                            mov.tipo_movimiento === 'INGRESO' ? 'bg-green-100 text-green-700' :
                            mov.tipo_movimiento === 'EGRESO' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-black text-right ${
                          mov.tipo_movimiento === 'INGRESO' ? 'text-green-600' :
                          mov.tipo_movimiento === 'EGRESO' ? 'text-red-600' :
                          'text-gray-700'
                        }`}>
                          {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                          {mov.cantidad}
                        </td>
                        <td className="p-4 text-sm font-black text-gray-900 text-right">
                          {mov.stock_resultante}
                        </td>
                        <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={mov.observaciones}>
                          {mov.observaciones || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODALES UNIVERSALES --- */}
      
      {/* Modal Eliminar */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Eliminar {deleteType === 'CATEGORY' ? 'Categoría' : 'Producto'}?</h3>
                <p className="text-gray-500 text-sm mt-2">Vas a eliminar <strong>{itemToDelete.nombre}</strong>. No podrás deshacerlo.</p>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 flex justify-center items-center px-4 py-3 text-white bg-red-600 rounded-xl hover:bg-red-700 font-bold transition-colors">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Transacción Kardex */}
      {viewState === 'TX_MODAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in">
            <div className={`p-6 border-b flex justify-between items-center ${txType === 'INGRESO' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`text-2xl font-black flex items-center ${txType === 'INGRESO' ? 'text-green-800' : 'text-red-800'}`}>
                {txType === 'INGRESO' ? <ArrowDownCircle className="mr-2"/> : <ArrowUpCircle className="mr-2"/>}
                Registrar {txType === 'INGRESO' ? 'Ingreso' : 'Egreso'}
              </h3>
              <button onClick={cancelView} className={`p-2 rounded-full transition-colors ${txType === 'INGRESO' ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}>
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Cantidad a {txType === 'INGRESO' ? 'sumar' : 'restar'} ({activeProductObj?.unidad_medida})</label>
                <input 
                  type="number" step="0.01" min="0" value={txAmount} onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="Ej. 10" autoFocus
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none transition-all text-2xl font-black text-center"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Observación (Opcional)</label>
                <textarea 
                  value={txObs} onChange={(e) => setTxObs(e.target.value)}
                  placeholder="Motivo del movimiento..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all resize-none h-20"
                />
              </div>
            </div>
            
            <div className="p-5 border-t flex gap-3">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 px-4 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold transition-colors">Cancelar</button>
              <button onClick={handleSaveTransaction} disabled={isSubmitting} className={`flex-1 flex justify-center items-center px-4 py-4 text-white rounded-2xl font-black transition-all shadow-md ${txType === 'INGRESO' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
