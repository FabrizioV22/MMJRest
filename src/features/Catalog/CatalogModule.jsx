import React, { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit2, Archive, Package, X, Loader2, ChevronRight, FolderOpen, 
  ArrowDownCircle, ArrowUpCircle, Clock, Home, Settings, Layers
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { catalogService } from '../../services/catalogService'

export function CatalogModule() {
  const location = useLocation()
  const [areas, setAreas] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // NAVEGACIÓN PRINCIPAL (4 Niveles)
  const [activeAreaId, setActiveAreaId] = useState(null)
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [activeProductId, setActiveProductId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ESTADOS DE VISTAS DE FORMULARIOS Y MODALES
  const [viewState, setViewState] = useState('MAIN') // MAIN, FORM_PROD, FORM_CAT, FORM_AREA, TX_MODAL
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Historial del producto activo
  const [movements, setMovements] = useState([])
  const [isLoadingMovements, setIsLoadingMovements] = useState(false)

  // Eliminar
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState('') // 'PRODUCT', 'CATEGORY', 'AREA'
  
  // Transacción
  const [txType, setTxType] = useState('INGRESO')
  const [txAmount, setTxAmount] = useState('')
  const [txObs, setTxObs] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ESTADOS DE FORMULARIO CRUD
  const [areaForm, setAreaForm] = useState({ id: null, nombre: '' })
  const [catForm, setCatForm] = useState({ id: null, nombre: '', area_id: '' })
  const [prodForm, setProdForm] = useState({ id: null, nombre: '', unidad_medida: '', area_id: '', categoria_id: '' })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Deep linking desde el Dashboard u otras vistas
    if (products.length > 0 && categories.length > 0 && areas.length > 0 && location.state) {
      if (location.state.openCategoryId) {
        const cat = categories.find(c => c.id === location.state.openCategoryId)
        if (cat) {
          setActiveAreaId(cat.area_id)
          setActiveCategoryId(cat.id)
        }
      }
      if (location.state.openProductId) {
        const prod = products.find(p => p.id === location.state.openProductId)
        if (prod) {
          const cat = categories.find(c => c.id === prod.categoria_id)
          if (cat) setActiveAreaId(cat.area_id)
          handleOpenProduct(prod)
        }
      }
      window.history.replaceState({}, document.title)
    }
  }, [location.state, products, categories, areas])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Usar allSettled por si la tabla areas no existe aún
      const [areasRes, catsRes, prodsRes] = await Promise.allSettled([
        catalogService.getAreas(),
        catalogService.getCategories(),
        catalogService.getProducts()
      ])
      
      if (areasRes.status === 'fulfilled') setAreas(areasRes.value)
      else setAreas([]) // Si falla (ej. falta correr SQL), será vacío
      
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value)
      if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value)

    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error cargando datos del inventario.')
    } finally {
      setIsLoading(false)
    }
  }

  // --- FILTROS Y OBJETOS ACTIVOS ---
  const activeAreaObj = areas.find(a => a.id === activeAreaId)
  const activeCategoryObj = categories.find(c => c.id === activeCategoryId)
  const activeProductObj = products.find(p => p.id === activeProductId)
  
  const filteredCategories = categories.filter(c => c.area_id === activeAreaId)
  const filteredProducts = products.filter(product => {
    if (product.categoria_id !== activeCategoryId) return false
    return product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // --- MANEJADORES DE VISTAS (Navegación) ---
  const handleGoHome = () => {
    setActiveAreaId(null)
    setActiveCategoryId(null)
    setActiveProductId(null)
    setSearchTerm('')
    setViewState('MAIN')
  }

  const handleOpenArea = (id) => {
    setActiveAreaId(id)
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
    setActiveCategoryId(product.categoria_id) // asegurar sincronía
    setSearchTerm('')
    setViewState('MAIN')
    
    setIsLoadingMovements(true)
    try {
      const history = await catalogService.getProductMovements(product.id)
      setMovements(history)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingMovements(false)
    }
  }

  const cancelView = () => {
    setViewState('MAIN')
    setItemToDelete(null)
    setDeleteType('')
  }

  // --- KARDEX ---
  const openTxModal = (type) => {
    setTxType(type)
    setTxAmount('')
    setTxObs('')
    setViewState('TX_MODAL')
  }

  const handleSaveTransaction = async () => {
    if (!txAmount || isNaN(txAmount) || Number(txAmount) <= 0) return alert('Cantidad inválida.')
    setIsSubmitting(true)
    try {
      await catalogService.registerMovement({
        p_producto_id: activeProductId,
        p_tipo_movimiento: txType,
        p_cantidad: Number(txAmount),
        p_observaciones: txObs || null
      })
      const [updatedProducts, newMovements] = await Promise.all([
        catalogService.getProducts(),
        catalogService.getProductMovements(activeProductId)
      ])
      setProducts(updatedProducts)
      setMovements(newMovements)
      cancelView()
    } catch (error) {
      alert('Error registrando el movimiento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- CRUD ÁREAS ---
  const openCreateArea = () => {
    setAreaForm({ id: null, nombre: '' })
    setIsEditMode(false)
    setViewState('FORM_AREA')
  }
  const openEditArea = (e, area) => {
    e.stopPropagation()
    setAreaForm({ id: area.id, nombre: area.nombre })
    setIsEditMode(true)
    setViewState('FORM_AREA')
  }
  const handleSaveArea = async () => {
    if (!areaForm.nombre) return alert("Ingresa el nombre.")
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateArea(areaForm.id, { nombre: areaForm.nombre.toUpperCase() })
      else await catalogService.createArea({ nombre: areaForm.nombre.toUpperCase() })
      await fetchData()
      cancelView()
    } catch (error) { alert('Error guardando área.') } 
    finally { setIsSubmitting(false) }
  }

  // --- CRUD CATEGORÍAS ---
  const openCreateCategory = () => {
    setCatForm({ id: null, nombre: '', area_id: activeAreaId || (areas[0]?.id || '') })
    setIsEditMode(false)
    setViewState('FORM_CAT')
  }
  const openEditCategory = (e, cat) => {
    e.stopPropagation()
    setCatForm({ id: cat.id, nombre: cat.nombre, area_id: cat.area_id })
    setIsEditMode(true)
    setViewState('FORM_CAT')
  }
  const handleSaveCategory = async () => {
    if (!catForm.nombre || !catForm.area_id) return alert("Completa todos los campos.")
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateCategory(catForm.id, { nombre: catForm.nombre.toUpperCase(), area_id: catForm.area_id })
      else await catalogService.createCategory({ nombre: catForm.nombre.toUpperCase(), area_id: catForm.area_id })
      await fetchData()
      cancelView()
    } catch (error) { alert('Error guardando categoría.') } 
    finally { setIsSubmitting(false) }
  }

  // --- CRUD PRODUCTOS ---
  const openCreateProduct = () => {
    const aId = activeAreaId || (areas[0]?.id || '')
    const cId = activeCategoryId || categories.find(c => c.area_id === aId)?.id || ''
    setProdForm({ id: null, nombre: '', unidad_medida: '', area_id: aId, categoria_id: cId })
    setIsEditMode(false)
    setViewState('FORM_PROD')
  }
  const openEditProduct = (e, product) => {
    if (e) e.stopPropagation()
    const productCat = categories.find(c => c.id === product.categoria_id)
    setProdForm({ id: product.id, nombre: product.nombre, unidad_medida: product.unidad_medida, area_id: productCat?.area_id || '', categoria_id: product.categoria_id })
    setIsEditMode(true)
    setViewState('FORM_PROD')
  }
  const handleSaveProduct = async () => {
    if (!prodForm.nombre || !prodForm.unidad_medida || !prodForm.categoria_id) return alert("Completa los campos.")
    setIsSubmitting(true)
    try {
      const payload = { nombre: prodForm.nombre, unidad_medida: prodForm.unidad_medida, categoria_id: prodForm.categoria_id }
      if (isEditMode) await catalogService.updateProduct(prodForm.id, payload)
      else await catalogService.createProduct(payload)
      await fetchData()
      cancelView()
    } catch (error) { alert('Error guardando producto.') } 
    finally { setIsSubmitting(false) }
  }

  // --- ARCHIVAR (Soft Delete) ---
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
        if (activeProductId === itemToDelete.id) handleOpenCategory(activeCategoryId)
      } else if (deleteType === 'CATEGORY') {
        // Al archivar, no nos preocupamos tanto por los hijos ya que no se rompe la BD, pero podemos advertir
        await catalogService.deleteCategory(itemToDelete.id)
        if (activeCategoryId === itemToDelete.id) handleOpenArea(activeAreaId)
      } else if (deleteType === 'AREA') {
        await catalogService.deleteArea(itemToDelete.id)
        if (activeAreaId === itemToDelete.id) handleGoHome()
      }
      await fetchData()
      cancelView()
    } catch (error) {
      alert(error.message || 'Error al archivar el elemento.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // ==========================================
  // RENDERIZADO
  // ==========================================
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
  }

  // --- FORMULARIOS ---
  if (viewState.startsWith('FORM_')) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar' : 'Crear'} {viewState === 'FORM_PROD' ? 'Producto' : viewState === 'FORM_CAT' ? 'Categoría' : 'Área'}
          </h3>
          <button onClick={cancelView} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {viewState === 'FORM_PROD' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Nombre del Producto</label>
                <input type="text" value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Unidad (SKU)</label>
                <input type="text" value={prodForm.unidad_medida} onChange={e => setProdForm({...prodForm, unidad_medida: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Pertenece al Área</label>
                <select value={prodForm.area_id || ''} onChange={e => {
                  const area_id = e.target.value;
                  const firstCat = categories.find(c => c.area_id === area_id);
                  setProdForm({...prodForm, area_id, categoria_id: firstCat?.id || ''})
                }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                  <option value="">Selecciona Área</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Categoría</label>
                <select disabled={!prodForm.area_id} value={prodForm.categoria_id} onChange={e => setProdForm({...prodForm, categoria_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none disabled:opacity-50">
                  <option value="">Selecciona Categoría</option>
                  {categories.filter(c => c.area_id === prodForm.area_id).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </>
          )}

          {viewState === 'FORM_CAT' && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">Nombre de Categoría</label>
                <input type="text" value={catForm.nombre} onChange={e => setCatForm({...catForm, nombre: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none uppercase" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">Pertenece al Área:</label>
                <select value={catForm.area_id} onChange={e => setCatForm({...catForm, area_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                  {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
            </>
          )}

          {viewState === 'FORM_AREA' && (
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Nombre del Área</label>
              <input type="text" value={areaForm.nombre} onChange={e => setAreaForm({...areaForm, nombre: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none uppercase" />
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <button onClick={cancelView} disabled={isSubmitting} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancelar</button>
          <button onClick={viewState === 'FORM_PROD' ? handleSaveProduct : viewState === 'FORM_CAT' ? handleSaveCategory : handleSaveArea} disabled={isSubmitting} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Guardar'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative animate-in fade-in">
      
      {/* BREADCRUMBS */}
      <nav className="flex flex-wrap items-center text-sm font-medium text-gray-500 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100 gap-y-2">
        <button onClick={handleGoHome} className={`flex items-center hover:text-blue-600 ${!activeAreaId ? 'text-blue-600 font-bold' : ''}`}>
          <Home size={16} className="mr-1.5" /> Inventario
        </button>
        
        {activeAreaId && (
          <>
            <ChevronRight size={16} className="mx-1 text-gray-400" />
            <button onClick={() => handleOpenArea(activeAreaId)} className={`flex items-center hover:text-blue-600 ${!activeCategoryId ? 'text-blue-600 font-bold' : ''}`}>
              <Layers size={16} className="mr-1.5" /> {activeAreaObj?.nombre}
            </button>
          </>
        )}

        {activeCategoryId && (
          <>
            <ChevronRight size={16} className="mx-1 text-gray-400" />
            <button onClick={() => handleOpenCategory(activeCategoryId)} className={`flex items-center hover:text-blue-600 ${!activeProductId ? 'text-blue-600 font-bold' : ''}`}>
              <FolderOpen size={16} className="mr-1.5" /> {activeCategoryObj?.nombre}
            </button>
          </>
        )}
        
        {activeProductId && (
          <>
            <ChevronRight size={16} className="mx-1 text-gray-400" />
            <span className="text-gray-900 flex items-center font-bold">
              <Package size={16} className="mr-1.5 text-blue-600" /> {activeProductObj?.nombre}
            </span>
          </>
        )}
      </nav>

      {/* NIVEL 1: ÁREAS */}
      {!activeAreaId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Áreas Principales</h2>
            <button onClick={openCreateArea} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
              <Plus size={20} className="mr-2"/> Nueva Área
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {areas.map(area => (
              <div key={area.id} onClick={() => handleOpenArea(area.id)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditArea(e, area)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-md"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, area, 'AREA')} className="p-1.5 text-gray-400 hover:text-orange-600 bg-white rounded-md"><Archive size={14}/></button>
                </div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{area.nombre}</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {categories.filter(c => c.area_id === area.id).length} categorías
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NIVEL 2: CATEGORÍAS */}
      {activeAreaId && !activeCategoryId && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Categorías: {activeAreaObj?.nombre}</h2>
            <button onClick={openCreateCategory} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
              <Plus size={20} className="mr-2"/> Nueva Categoría
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {filteredCategories.map(cat => (
              <div key={cat.id} onClick={() => handleOpenCategory(cat.id)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative">
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditCategory(e, cat)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-md"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, cat, 'CATEGORY')} className="p-1.5 text-gray-400 hover:text-orange-600 bg-white rounded-md"><Archive size={14}/></button>
                </div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderOpen size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{cat.nombre}</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {products.filter(p => p.categoria_id === cat.id).length} productos
                </span>
              </div>
            ))}
            {filteredCategories.length === 0 && (
               <div className="col-span-full text-center py-12 text-gray-400 border border-dashed rounded-xl">No hay categorías en esta área.</div>
            )}
          </div>
        </div>
      )}

      {/* NIVEL 3: PRODUCTOS */}
      {activeCategoryId && !activeProductId && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Productos en: {activeCategoryObj?.nombre}</h2>
            <button onClick={openCreateProduct} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
              <Plus size={20} className="mr-2"/> Nuevo Producto
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 relative">
            <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder={`Buscar en ${activeCategoryObj?.nombre}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => handleOpenProduct(product)} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                <div className="pl-3">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{product.nombre}</h3>
                  <p className="text-gray-500 text-sm mt-1">{product.unidad_medida}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                  <p className={`text-xl font-bold ${product.stock_actual > 10 ? 'text-green-600' : 'text-orange-500'}`}>{product.stock_actual}</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No se encontraron productos.</div>}
          </div>
        </div>
      )}

      {/* NIVEL 4: DETALLE DEL PRODUCTO (KARDEX) */}
      {activeProductId && activeProductObj && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-3xl font-black text-gray-900">{activeProductObj.nombre}</h2>
                <p className="text-gray-500 font-medium flex items-center mt-1"><Package size={16} className="mr-1" /> SKU: {activeProductObj.unidad_medida}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => openEditProduct(e, activeProductObj)} className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"><Settings size={18} className="mr-2" /> Configurar</button>
                <button onClick={(e) => confirmDelete(e, activeProductObj, 'PRODUCT')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg flex items-center font-medium"><Archive size={18} className="mr-2" /> Archivar</button>
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
                <button onClick={() => openTxModal('INGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-2xl font-bold transition-all shadow-sm group">
                  <ArrowDownCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" /> Ingreso
                </button>
                <button onClick={() => openTxModal('EGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-4 min-w-[120px] bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-2xl font-bold transition-all shadow-sm group">
                  <ArrowUpCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" /> Egreso
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/50">
              <Clock className="text-gray-400" size={20} /><h3 className="font-bold text-gray-800">Historial de Transacciones (Kardex)</h3>
            </div>
            {isLoadingMovements ? (
              <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : movements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hay movimientos.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-semibold">Fecha</th>
                      <th className="p-4 font-semibold">Operación</th>
                      <th className="p-4 font-semibold text-right">Cant.</th>
                      <th className="p-4 font-semibold text-right">Stock Final</th>
                      <th className="p-4 font-semibold">Obs.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map(mov => (
                      <tr key={mov.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-600">{new Date(mov.fecha).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${mov.tipo_movimiento==='INGRESO'?'bg-green-100 text-green-700':mov.tipo_movimiento==='EGRESO'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-black text-right ${mov.tipo_movimiento==='INGRESO'?'text-green-600':mov.tipo_movimiento==='EGRESO'?'text-red-600':'text-gray-700'}`}>
                          {mov.tipo_movimiento==='INGRESO'?'+':mov.tipo_movimiento==='EGRESO'?'-':''}{mov.cantidad}
                        </td>
                        <td className="p-4 text-sm font-black text-right">{mov.stock_resultante}</td>
                        <td className="p-4 text-sm text-gray-500">{mov.observaciones || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ARCHIVAR */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
            <Archive className="text-orange-600 w-12 h-12 mx-auto mb-4 bg-orange-100 p-2 rounded-full" />
            <h3 className="text-xl font-bold">¿Archivar {deleteType==='AREA'?'Área':deleteType==='CATEGORY'?'Categoría':'Producto'}?</h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">Vas a archivar <strong>{itemToDelete.nombre}</strong>. Se ocultará del inventario pero conservará su historial.</p>
            <div className="flex gap-2">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 flex justify-center">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Archivar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSACCIÓN */}
      {viewState === 'TX_MODAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
            <div className={`p-6 border-b flex justify-between ${txType === 'INGRESO' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-2xl font-black flex items-center ${txType === 'INGRESO' ? 'text-green-800' : 'text-red-800'}`}>
                {txType === 'INGRESO' ? <ArrowDownCircle className="mr-2"/> : <ArrowUpCircle className="mr-2"/>} Registrar {txType}
              </h3>
              <button onClick={cancelView} className="p-2"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad a {txType === 'INGRESO' ? 'sumar' : 'restar'}</label>
                <input type="number" step="0.01" min="0" value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl outline-none text-2xl font-black text-center" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Observación</label>
                <textarea value={txObs} onChange={e => setTxObs(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none h-20" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancelar</button>
              <button onClick={handleSaveTransaction} disabled={isSubmitting} className={`flex-1 py-4 text-white rounded-2xl font-black ${txType === 'INGRESO' ? 'bg-green-600' : 'bg-red-600'}`}>
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
