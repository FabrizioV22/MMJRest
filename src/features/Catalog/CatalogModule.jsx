import React, { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit2, Archive, Package, X, Loader2, ChevronRight, FolderOpen, 
  ArrowDownCircle, ArrowUpCircle, Clock, Home, Settings, Layers, BarChart3
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
      const [areasRes, catsRes, prodsRes] = await Promise.allSettled([
        catalogService.getAreas(),
        catalogService.getCategories(),
        catalogService.getProducts()
      ])
      if (areasRes.status === 'fulfilled') setAreas(areasRes.value || [])
      else setAreas([])
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value || [])
      else setCategories([])
      if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value || [])
      else setProducts([])
    } catch (error) {
      console.error('Error fetching data:', error)
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

  // --- CURRENT LEVEL (for theming) ---
  const currentLevel = activeProductId ? 'kardex' : activeCategoryId ? 'product' : activeAreaId ? 'category' : 'area'
  
  const levelTheme = {
    area:     { accent: '#334155', accentLight: '#f1f5f9', accentBorder: '#cbd5e1', label: 'Áreas' },
    category: { accent: '#4F46E5', accentLight: '#eef2ff', accentBorder: '#c7d2fe', label: 'Categorías' },
    product:  { accent: '#0D9488', accentLight: '#f0fdfa', accentBorder: '#99f6e4', label: 'Productos' },
    kardex:   { accent: '#1E293B', accentLight: '#f8fafc', accentBorder: '#e2e8f0', label: 'Kardex' }
  }
  const theme = levelTheme[currentLevel]

  // --- MANEJADORES DE VISTAS (Navegación) ---
  const handleGoHome = () => {
    setActiveAreaId(null); setActiveCategoryId(null); setActiveProductId(null); setSearchTerm(''); setViewState('MAIN')
  }
  const handleOpenArea = (id) => {
    setActiveAreaId(id); setActiveCategoryId(null); setActiveProductId(null); setSearchTerm(''); setViewState('MAIN')
  }
  const handleOpenCategory = (id) => {
    setActiveCategoryId(id); setActiveProductId(null); setSearchTerm(''); setViewState('MAIN')
  }
  const handleOpenProduct = async (product) => {
    setActiveProductId(product.id); setActiveCategoryId(product.categoria_id); setSearchTerm(''); setViewState('MAIN')
    setIsLoadingMovements(true)
    try { const history = await catalogService.getProductMovements(product.id); setMovements(history) }
    catch (error) { console.error(error) }
    finally { setIsLoadingMovements(false) }
  }
  const cancelView = () => { setViewState('MAIN'); setItemToDelete(null); setDeleteType('') }

  // --- KARDEX ---
  const openTxModal = (type) => { setTxType(type); setTxAmount(''); setTxObs(''); setViewState('TX_MODAL') }
  const handleSaveTransaction = async () => {
    if (!txAmount || isNaN(txAmount) || Number(txAmount) <= 0) return alert('Cantidad inválida.')
    setIsSubmitting(true)
    try {
      await catalogService.registerMovement({ p_producto_id: activeProductId, p_tipo_movimiento: txType, p_cantidad: Number(txAmount), p_observaciones: txObs || null })
      const [updatedProducts, newMovements] = await Promise.all([catalogService.getProducts(), catalogService.getProductMovements(activeProductId)])
      setProducts(updatedProducts); setMovements(newMovements); cancelView()
    } catch (error) { alert('Error registrando el movimiento.') }
    finally { setIsSubmitting(false) }
  }

  // --- CRUD ÁREAS ---
  const openCreateArea = () => { setAreaForm({ id: null, nombre: '' }); setIsEditMode(false); setViewState('FORM_AREA') }
  const openEditArea = (e, area) => { e.stopPropagation(); setAreaForm({ id: area.id, nombre: area.nombre }); setIsEditMode(true); setViewState('FORM_AREA') }
  const handleSaveArea = async () => {
    if (!areaForm.nombre) return alert("Ingresa el nombre.")
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateArea(areaForm.id, { nombre: areaForm.nombre.toUpperCase() })
      else await catalogService.createArea({ nombre: areaForm.nombre.toUpperCase() })
      await fetchData(); cancelView()
    } catch (error) { alert('Error guardando área.') } finally { setIsSubmitting(false) }
  }

  // --- CRUD CATEGORÍAS ---
  const openCreateCategory = () => { setCatForm({ id: null, nombre: '', area_id: activeAreaId || (areas[0]?.id || '') }); setIsEditMode(false); setViewState('FORM_CAT') }
  const openEditCategory = (e, cat) => { e.stopPropagation(); setCatForm({ id: cat.id, nombre: cat.nombre, area_id: cat.area_id }); setIsEditMode(true); setViewState('FORM_CAT') }
  const handleSaveCategory = async () => {
    if (!catForm.nombre || !catForm.area_id) return alert("Completa todos los campos.")
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateCategory(catForm.id, { nombre: catForm.nombre.toUpperCase(), area_id: catForm.area_id })
      else await catalogService.createCategory({ nombre: catForm.nombre.toUpperCase(), area_id: catForm.area_id })
      await fetchData(); cancelView()
    } catch (error) { alert('Error guardando categoría.') } finally { setIsSubmitting(false) }
  }

  // --- CRUD PRODUCTOS ---
  const openCreateProduct = () => {
    const aId = activeAreaId || (areas[0]?.id || '')
    const cId = activeCategoryId || categories.find(c => c.area_id === aId)?.id || ''
    setProdForm({ id: null, nombre: '', unidad_medida: '', area_id: aId, categoria_id: cId }); setIsEditMode(false); setViewState('FORM_PROD')
  }
  const openEditProduct = (e, product) => {
    if (e) e.stopPropagation()
    const productCat = categories.find(c => c.id === product.categoria_id)
    setProdForm({ id: product.id, nombre: product.nombre, unidad_medida: product.unidad_medida, area_id: productCat?.area_id || '', categoria_id: product.categoria_id }); setIsEditMode(true); setViewState('FORM_PROD')
  }
  const handleSaveProduct = async () => {
    if (!prodForm.nombre || !prodForm.unidad_medida || !prodForm.categoria_id) return alert("Completa los campos.")
    setIsSubmitting(true)
    try {
      const payload = { nombre: prodForm.nombre, unidad_medida: prodForm.unidad_medida, categoria_id: prodForm.categoria_id }
      if (isEditMode) await catalogService.updateProduct(prodForm.id, payload)
      else await catalogService.createProduct(payload)
      await fetchData(); cancelView()
    } catch (error) { alert('Error guardando producto.') } finally { setIsSubmitting(false) }
  }

  // --- ARCHIVAR (Soft Delete) ---
  const confirmDelete = (e, item, type) => { if (e) e.stopPropagation(); setItemToDelete(item); setDeleteType(type) }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      if (deleteType === 'PRODUCT') { await catalogService.deleteProduct(itemToDelete.id); if (activeProductId === itemToDelete.id) handleOpenCategory(activeCategoryId) }
      else if (deleteType === 'CATEGORY') { await catalogService.deleteCategory(itemToDelete.id); if (activeCategoryId === itemToDelete.id) handleOpenArea(activeAreaId) }
      else if (deleteType === 'AREA') { await catalogService.deleteArea(itemToDelete.id); if (activeAreaId === itemToDelete.id) handleGoHome() }
      await fetchData(); cancelView()
    } catch (error) { alert(error.message || 'Error al archivar el elemento.') } finally { setIsSubmitting(false) }
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={48} style={{ color: 'var(--color-accent)' }} /></div>
  }

  // --- FORMULARIOS ---
  if (viewState.startsWith('FORM_')) {
    const formAccent = viewState === 'FORM_AREA' ? levelTheme.area.accent : viewState === 'FORM_CAT' ? levelTheme.category.accent : levelTheme.product.accent
    return (
      <div className="animate-fade-in-up max-w-2xl mx-auto mt-8">
        <div className="bg-white p-8 rounded-2xl card-soft border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold" style={{ color: formAccent }}>
              {isEditMode ? 'Editar' : 'Crear'} {viewState === 'FORM_PROD' ? 'Producto' : viewState === 'FORM_CAT' ? 'Categoría' : 'Área'}
            </h3>
            <button onClick={cancelView} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"><X size={20} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {viewState === 'FORM_PROD' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-600">Nombre del Producto</label>
                  <input type="text" value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-transparent" style={{ '--tw-ring-color': formAccent + '40' }} />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-600">Unidad (SKU)</label>
                  <input type="text" value={prodForm.unidad_medida} onChange={e => setProdForm({...prodForm, unidad_medida: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-600">Pertenece al Área</label>
                  <select value={prodForm.area_id || ''} onChange={e => {
                    const area_id = e.target.value;
                    const firstCat = categories.find(c => c.area_id === area_id);
                    setProdForm({...prodForm, area_id, categoria_id: firstCat?.id || ''})
                  }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer">
                    <option value="">Selecciona Área</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-600">Categoría</label>
                  <select disabled={!prodForm.area_id} value={prodForm.categoria_id} onChange={e => setProdForm({...prodForm, categoria_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none disabled:opacity-40 cursor-pointer">
                    <option value="">Selecciona Categoría</option>
                    {categories.filter(c => c.area_id === prodForm.area_id).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
            {viewState === 'FORM_CAT' && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-600">Nombre de Categoría</label>
                  <input type="text" value={catForm.nombre} onChange={e => setCatForm({...catForm, nombre: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none uppercase" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-600">Pertenece al Área:</label>
                  <select value={catForm.area_id} onChange={e => setCatForm({...catForm, area_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer">
                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
            {viewState === 'FORM_AREA' && (
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-600">Nombre del Área</label>
                <input type="text" value={areaForm.nombre} onChange={e => setAreaForm({...areaForm, nombre: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none uppercase" />
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button onClick={cancelView} disabled={isSubmitting} className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium cursor-pointer">Cancelar</button>
            <button onClick={viewState === 'FORM_PROD' ? handleSaveProduct : viewState === 'FORM_CAT' ? handleSaveCategory : handleSaveArea} disabled={isSubmitting} className="px-6 py-3 text-white rounded-xl font-bold cursor-pointer" style={{ backgroundColor: formAccent }}>
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative animate-fade-in">
      
      {/* BREADCRUMBS — Color-coded */}
      <nav className="flex flex-wrap items-center text-sm font-medium bg-white px-5 py-3.5 rounded-2xl card-soft border gap-y-2" style={{ borderColor: theme.accentBorder + '80' }}>
        <button onClick={handleGoHome} className="flex items-center cursor-pointer rounded-lg px-2 py-1 -ml-2 transition-colors" style={{ color: !activeAreaId ? levelTheme.area.accent : '#94a3b8' }}>
          <Home size={16} className="mr-1.5" /> <span className={!activeAreaId ? 'font-bold' : ''}>Inventario</span>
        </button>
        
        {activeAreaId && (
          <>
            <ChevronRight size={16} className="mx-1.5 text-slate-300" />
            <button onClick={() => handleOpenArea(activeAreaId)} className="flex items-center cursor-pointer rounded-lg px-2 py-1 transition-colors" style={{ color: currentLevel === 'category' ? levelTheme.category.accent : currentLevel === 'area' ? '#94a3b8' : '#94a3b8' }}>
              <Layers size={16} className="mr-1.5" /> <span className={!activeCategoryId ? 'font-bold' : ''}>{activeAreaObj?.nombre}</span>
            </button>
          </>
        )}

        {activeCategoryId && (
          <>
            <ChevronRight size={16} className="mx-1.5 text-slate-300" />
            <button onClick={() => handleOpenCategory(activeCategoryId)} className="flex items-center cursor-pointer rounded-lg px-2 py-1 transition-colors" style={{ color: !activeProductId ? levelTheme.product.accent : '#94a3b8' }}>
              <FolderOpen size={16} className="mr-1.5" /> <span className={!activeProductId ? 'font-bold' : ''}>{activeCategoryObj?.nombre}</span>
            </button>
          </>
        )}
        
        {activeProductId && (
          <>
            <ChevronRight size={16} className="mx-1.5 text-slate-300" />
            <span className="flex items-center font-bold px-2 py-1" style={{ color: levelTheme.kardex.accent }}>
              <Package size={16} className="mr-1.5" style={{ color: levelTheme.product.accent }} /> {activeProductObj?.nombre}
            </span>
          </>
        )}
      </nav>

      {/* NIVEL 1: ÁREAS */}
      {!activeAreaId && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display text-2xl font-bold" style={{ color: levelTheme.area.accent }}>Áreas Principales</h2>
              <p className="text-sm text-slate-400 mt-1">Selecciona un área para ver sus categorías</p>
            </div>
            <button onClick={openCreateArea} className="flex items-center px-5 py-2.5 text-white rounded-xl font-bold shadow-md cursor-pointer hover:shadow-lg" style={{ backgroundColor: levelTheme.area.accent }}>
              <Plus size={18} className="mr-2"/> Nueva Área
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {areas.map(area => (
              <div key={area.id} onClick={() => handleOpenArea(area.id)} className="bg-white p-6 rounded-2xl card-soft border border-slate-100 hover:border-slate-300 cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative min-h-[160px]">
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100">
                  <button onClick={(e) => openEditArea(e, area)} className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-lg cursor-pointer"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, area, 'AREA')} className="p-1.5 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-lg cursor-pointer"><Archive size={14}/></button>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: levelTheme.area.accentLight, color: levelTheme.area.accent }}>
                  <Layers size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-slate-800">{area.nombre}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: levelTheme.area.accentLight, color: levelTheme.area.accent }}>
                  {categories.filter(c => c.area_id === area.id).length} categorías
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NIVEL 2: CATEGORÍAS */}
      {activeAreaId && !activeCategoryId && (
        <div className="space-y-5 animate-slide-right">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display text-2xl font-bold" style={{ color: levelTheme.category.accent }}>Categorías</h2>
              <p className="text-sm text-slate-400 mt-1">en {activeAreaObj?.nombre}</p>
            </div>
            <button onClick={openCreateCategory} className="flex items-center px-5 py-2.5 text-white rounded-xl font-bold shadow-md cursor-pointer hover:shadow-lg" style={{ backgroundColor: levelTheme.category.accent }}>
              <Plus size={18} className="mr-2"/> Nueva Categoría
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {filteredCategories.map(cat => (
              <div key={cat.id} onClick={() => handleOpenCategory(cat.id)} className="bg-white p-6 rounded-2xl card-soft border cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative min-h-[160px]" style={{ borderColor: levelTheme.category.accentBorder + '60' }}>
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100">
                  <button onClick={(e) => openEditCategory(e, cat)} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg cursor-pointer"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, cat, 'CATEGORY')} className="p-1.5 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-lg cursor-pointer"><Archive size={14}/></button>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: levelTheme.category.accentLight, color: levelTheme.category.accent }}>
                  <FolderOpen size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-slate-800">{cat.nombre}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: levelTheme.category.accentLight, color: levelTheme.category.accent }}>
                  {products.filter(p => p.categoria_id === cat.id).length} productos
                </span>
              </div>
            ))}
            {filteredCategories.length === 0 && (
               <div className="col-span-full text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">No hay categorías en esta área.</div>
            )}
          </div>
        </div>
      )}

      {/* NIVEL 3: PRODUCTOS */}
      {activeCategoryId && !activeProductId && (
        <div className="space-y-5 animate-slide-right">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display text-2xl font-bold" style={{ color: levelTheme.product.accent }}>Productos</h2>
              <p className="text-sm text-slate-400 mt-1">en {activeCategoryObj?.nombre}</p>
            </div>
            <button onClick={openCreateProduct} className="flex items-center px-5 py-2.5 text-white rounded-xl font-bold shadow-md cursor-pointer hover:shadow-lg" style={{ backgroundColor: levelTheme.product.accent }}>
              <Plus size={18} className="mr-2"/> Nuevo Producto
            </button>
          </div>
          
          <div className="bg-white p-3 rounded-2xl card-soft border border-slate-100 relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder={`Buscar en ${activeCategoryObj?.nombre}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => handleOpenProduct(product)} className="bg-white p-5 rounded-2xl card-soft border flex justify-between items-center cursor-pointer group relative overflow-hidden" style={{ borderColor: levelTheme.product.accentBorder + '60' }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: levelTheme.product.accent }}></div>
                <div className="pl-3">
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{product.nombre}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{product.unidad_medida}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Stock</p>
                  <p className={`text-xl font-black ${product.stock_actual > 10 ? 'text-emerald-600' : product.stock_actual > 0 ? 'text-orange-500' : 'text-red-600'}`}>{product.stock_actual}</p>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <div className="col-span-full text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">No se encontraron productos.</div>}
          </div>
        </div>
      )}

      {/* NIVEL 4: DETALLE DEL PRODUCTO (KARDEX) */}
      {activeProductId && activeProductObj && (
        <div className="space-y-6 animate-slide-right">
          <div className="bg-white rounded-2xl card-soft border border-slate-100 overflow-hidden">
            {/* Header with colored top bar */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${levelTheme.product.accent}, ${levelTheme.category.accent})` }}></div>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-display text-2xl font-black text-slate-900">{activeProductObj.nombre}</h2>
                <p className="text-slate-400 font-medium flex items-center mt-1 text-sm"><Package size={14} className="mr-1.5" style={{ color: levelTheme.product.accent }} /> SKU: {activeProductObj.unidad_medida}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => openEditProduct(e, activeProductObj)} className="flex items-center px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-sm cursor-pointer"><Settings size={16} className="mr-2" /> Configurar</button>
                <button onClick={(e) => confirmDelete(e, activeProductObj, 'PRODUCT')} className="flex items-center px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl font-medium text-sm cursor-pointer"><Archive size={16} className="mr-2" /> Archivar</button>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{ backgroundColor: levelTheme.kardex.accentLight }}>
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Stock Actual en Inventario</p>
                <div className="flex items-baseline justify-center md:justify-start space-x-2">
                  <span className="text-6xl font-black text-slate-900 tracking-tight">{activeProductObj.stock_actual}</span>
                  <span className="text-lg font-bold text-slate-300 uppercase">{activeProductObj.unidad_medida}</span>
                </div>
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <button onClick={() => openTxModal('INGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-5 min-w-[130px] bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl font-bold shadow-sm group cursor-pointer transition-all">
                  <ArrowDownCircle size={30} className="mb-2 group-hover:scale-110 transition-transform" /> Ingreso
                </button>
                <button onClick={() => openTxModal('EGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-5 min-w-[130px] bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-2xl font-bold shadow-sm group cursor-pointer transition-all">
                  <ArrowUpCircle size={30} className="mb-2 group-hover:scale-110 transition-transform" /> Egreso
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl card-soft border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center space-x-2" style={{ backgroundColor: levelTheme.kardex.accentLight }}>
              <BarChart3 size={18} style={{ color: levelTheme.kardex.accent }} /><h3 className="font-bold text-slate-700 text-sm">Historial de Transacciones (Kardex)</h3>
            </div>
            {isLoadingMovements ? (
              <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
            ) : movements.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No hay movimientos registrados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="p-4 font-bold">Fecha</th>
                      <th className="p-4 font-bold">Operación</th>
                      <th className="p-4 font-bold text-right">Cant.</th>
                      <th className="p-4 font-bold text-right">Stock Final</th>
                      <th className="p-4 font-bold">Obs.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {movements.map(mov => (
                      <tr key={mov.id} className="hover:bg-slate-50/50">
                        <td className="p-4 text-sm text-slate-500">{new Date(mov.fecha).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${mov.tipo_movimiento==='INGRESO'?'bg-emerald-100 text-emerald-700':mov.tipo_movimiento==='EGRESO'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-black text-right ${mov.tipo_movimiento==='INGRESO'?'text-emerald-600':mov.tipo_movimiento==='EGRESO'?'text-red-600':'text-slate-700'}`}>
                          {mov.tipo_movimiento==='INGRESO'?'+':mov.tipo_movimiento==='EGRESO'?'-':''}{mov.cantidad}
                        </td>
                        <td className="p-4 text-sm font-black text-right text-slate-800">{mov.stock_resultante}</td>
                        <td className="p-4 text-sm text-slate-400">{mov.observaciones || '—'}</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-fade-in-up">
            <Archive className="text-orange-500 w-12 h-12 mx-auto mb-4 bg-orange-100 p-2.5 rounded-2xl" />
            <h3 className="text-xl font-bold text-slate-900">¿Archivar {deleteType==='AREA'?'Área':deleteType==='CATEGORY'?'Categoría':'Producto'}?</h3>
            <p className="text-slate-400 text-sm mt-2 mb-6"><strong className="text-slate-600">{itemToDelete.nombre}</strong> se ocultará del inventario pero conservará su historial.</p>
            <div className="flex gap-3">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium cursor-pointer">Cancelar</button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold flex justify-center cursor-pointer">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Archivar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSACCIÓN */}
      {viewState === 'TX_MODAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
            <div className={`p-6 border-b flex justify-between ${txType === 'INGRESO' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <h3 className={`text-xl font-black flex items-center ${txType === 'INGRESO' ? 'text-emerald-800' : 'text-red-800'}`}>
                {txType === 'INGRESO' ? <ArrowDownCircle className="mr-2"/> : <ArrowUpCircle className="mr-2"/>} Registrar {txType}
              </h3>
              <button onClick={cancelView} className="p-2 cursor-pointer rounded-lg hover:bg-black/5"><X size={22} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Cantidad a {txType === 'INGRESO' ? 'sumar' : 'restar'}</label>
                <input type="number" step="0.01" min="0" value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none text-3xl font-black text-center focus:border-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Observación (opcional)</label>
                <textarea value={txObs} onChange={e => setTxObs(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none h-20" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold cursor-pointer hover:bg-slate-200">Cancelar</button>
              <button onClick={handleSaveTransaction} disabled={isSubmitting} className={`flex-1 py-4 text-white rounded-2xl font-black cursor-pointer ${txType === 'INGRESO' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
