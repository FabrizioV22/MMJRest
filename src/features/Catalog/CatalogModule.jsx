import React, { useState, useEffect } from 'react'
import { 
  Plus, Search, Edit2, Archive, Package, X, Loader2, ChevronRight, FolderOpen, 
  ArrowDownCircle, ArrowUpCircle, Home, Settings, Layers, BarChart3, Trash2
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { catalogService } from '../../services/catalogService'
import { useSede } from '../../context/SedeContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export function CatalogModule() {
  const location = useLocation()
  const { activeSede } = useSede()
  const [areas, setAreas] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin } = useAuth()
  const [isArchivedView, setIsArchivedView] = useState(false)
  const toast = useToast()
  
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
  }, [activeSede?.id, isArchivedView])

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
      const results = await Promise.allSettled([
        catalogService.getAreas(),
        catalogService.getCategories(),
        catalogService.getProducts(activeSede?.id, isArchivedView)
      ])
      const [areasRes, catsRes, prodsRes] = results

      if (areasRes.status === 'fulfilled') setAreas(areasRes.value || [])
      else {
        console.error("Error fetching areas:", areasRes.reason)
        setAreas([])
      }

      if (catsRes.status === 'fulfilled') setCategories(catsRes.value || [])
      else {
        console.error("Error fetching categories:", catsRes.reason)
        setCategories([])
      }

      if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value || [])
      else {
        console.error("Error fetching products:", prodsRes.reason)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos del catálogo')
    } finally {
      setIsLoading(false)
    }
  }

  // --- FILTROS Y OBJETOS ACTIVOS ---
  const activeAreaObj = areas.find(a => a.id === activeAreaId)
  const activeCategoryObj = categories.find(c => c.id === activeCategoryId)
  const activeProductObj = products.find(p => p.id === activeProductId)
  
  const searchLower = searchTerm.toLowerCase()

  const filteredAreas = areas.filter(area => {
    if (!searchTerm) return true
    if (area.nombre.toLowerCase().includes(searchLower)) return true
    const areaCats = categories.filter(c => c.area_id === area.id)
    if (areaCats.some(c => c.nombre.toLowerCase().includes(searchLower))) return true
    const areaProds = products.filter(p => areaCats.some(c => c.id === p.categoria_id))
    return areaProds.some(p => p.nombre.toLowerCase().includes(searchLower))
  })

  const filteredCategories = categories.filter(c => {
    if (c.area_id !== activeAreaId) return false
    if (!searchTerm) return true
    if (c.nombre.toLowerCase().includes(searchLower)) return true
    const catProds = products.filter(p => p.categoria_id === c.id)
    return catProds.some(p => p.nombre.toLowerCase().includes(searchLower))
  })

  const filteredProducts = products.filter(product => {
    if (product.categoria_id !== activeCategoryId) return false
    if (!searchTerm) return true
    return product.nombre.toLowerCase().includes(searchLower)
  })

  // --- THEME PALETTE FOR LEVELS ---
  const currentLevel = activeProductId ? 'kardex' : activeCategoryId ? 'product' : activeAreaId ? 'category' : 'area'
  
  const levelTheme = {
    area:     { accent: '#A80F14', accentLight: '#FFF9F0', accentBorder: '#D6A24A', label: 'Áreas' },
    category: { accent: '#3A0F0F', accentLight: '#F8EEDF', accentBorder: '#E7C77A', label: 'Categorías' },
    product:  { accent: '#A80F14', accentLight: '#FFF9F0', accentBorder: '#D8CBC5', label: 'Productos' },
    kardex:   { accent: '#2C211F', accentLight: '#FAF7F4', accentBorder: '#E9DFD9', label: 'Kardex' }
  }

  // --- MANEJADORES DE VISTAS ---
  const handleGoHome = () => {
    setActiveAreaId(null); setActiveCategoryId(null); setActiveProductId(null); setSearchTerm(''); setViewState('MAIN'); setIsArchivedView(false);
  }
  const handleOpenArea = (id) => {
    setActiveAreaId(id); setActiveCategoryId(null); setActiveProductId(null); setViewState('MAIN')
  }
  const handleOpenCategory = (id) => {
    setActiveCategoryId(id); setActiveProductId(null); setViewState('MAIN')
  }
  const handleOpenProduct = async (product) => {
    setActiveProductId(product.id); setActiveCategoryId(product.categoria_id); setViewState('MAIN')
    setIsLoadingMovements(true)
    try { 
      const history = await catalogService.getProductMovements(product.id, activeSede?.id)
      setMovements(history || []) 
    }
    catch (error) { 
      console.error(error)
      toast.error('Error al cargar movimientos')
    }
    finally { 
      setIsLoadingMovements(false) 
    }
  }
  const cancelView = () => { setViewState('MAIN'); setItemToDelete(null); setDeleteType('') }

  // --- KARDEX ---
  const openTxModal = (type) => { setTxType(type); setTxAmount(''); setTxObs(''); setViewState('TX_MODAL') }
  const handleSaveTransaction = async () => {
    if (!txAmount || isNaN(txAmount) || Number(txAmount) <= 0) {
      return toast.warning('Ingresa una cantidad válida.')
    }
    if (!activeSede?.id) {
      return toast.warning('Debes seleccionar una sede activa.')
    }
    setIsSubmitting(true)
    try {
      await catalogService.registerMovement({ 
        p_producto_id: activeProductId, 
        p_sede_id: activeSede.id,
        p_tipo_movimiento: txType, 
        p_cantidad: Number(txAmount), 
        p_observaciones: txObs || null 
      })
      const [updatedProducts, newMovements] = await Promise.all([
        catalogService.getProducts(activeSede.id), 
        catalogService.getProductMovements(activeProductId, activeSede.id)
      ])
      setProducts(updatedProducts)
      setMovements(newMovements || [])
      toast.success(`${txType === 'INGRESO' ? 'Ingreso' : 'Egreso'} registrado correctamente`)
      cancelView()
    } catch (error) { 
      toast.error('Error registrando movimiento: ' + (error.message || ''))
    } finally { 
      setIsSubmitting(false) 
    }
  }

  // --- CRUD ÁREAS ---
  const openCreateArea = () => { setAreaForm({ id: null, nombre: '' }); setIsEditMode(false); setViewState('FORM_AREA') }
  const openEditArea = (e, area) => { e.stopPropagation(); setAreaForm({ id: area.id, nombre: area.nombre }); setIsEditMode(true); setViewState('FORM_AREA') }
  const handleSaveArea = async () => {
    if (!areaForm.nombre) return toast.warning("Ingresa el nombre del área.")
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateArea(areaForm.id, { nombre: areaForm.nombre.toUpperCase() })
      else await catalogService.createArea({ nombre: areaForm.nombre.toUpperCase() })
      toast.success(isEditMode ? 'Área actualizada' : 'Área creada')
      await fetchData(); cancelView()
    } catch (error) { 
      toast.error('Error guardando área: ' + (error.message || '')) 
    } finally { setIsSubmitting(false) }
  }

  // --- CRUD CATEGORÍAS ---
  const openCreateCategory = () => { setCatForm({ id: null, nombre: '', area_id: activeAreaId || (areas[0]?.id || '') }); setIsEditMode(false); setViewState('FORM_CAT') }
  const openEditCategory = (e, cat) => { e.stopPropagation(); setCatForm({ id: cat.id, nombre: cat.nombre, area_id: cat.area_id }); setIsEditMode(true); setViewState('FORM_CAT') }
  const handleSaveCategory = async () => {
    if (!catForm.nombre || !catForm.area_id) return toast.warning("Completa todos los campos.")
    setIsSubmitting(true)
    try {
      if (isEditMode) await catalogService.updateCategory(catForm.id, { nombre: catForm.nombre.toUpperCase(), area_id: catForm.area_id })
      else await catalogService.createCategory({ nombre: catForm.nombre.toUpperCase(), area_id: catForm.area_id })
      toast.success(isEditMode ? 'Categoría actualizada' : 'Categoría creada')
      await fetchData(); cancelView()
    } catch (error) { toast.error('Error guardando categoría.') } finally { setIsSubmitting(false) }
  }

  // --- CRUD PRODUCTOS ---
  const openCreateProduct = () => {
    const aId = activeAreaId || (areas[0]?.id || '')
    const cId = activeCategoryId || categories.find(c => c.area_id === aId)?.id || ''
    setProdForm({ id: null, nombre: '', unidad_medida: '', area_id: aId, categoria_id: cId, activar_todas: false }); setIsEditMode(false); setViewState('FORM_PROD')
  }
  const openEditProduct = (e, product) => {
    if (e) e.stopPropagation()
    const productCat = categories.find(c => c.id === product.categoria_id)
    setProdForm({ id: product.id, nombre: product.nombre, unidad_medida: product.unidad_medida, area_id: productCat?.area_id || '', categoria_id: product.categoria_id, activar_todas: false }); setIsEditMode(true); setViewState('FORM_PROD')
  }
  const handleSaveProduct = async () => {
    if (!prodForm.nombre || !prodForm.unidad_medida || !prodForm.categoria_id) return toast.warning("Completa todos los campos.")
    setIsSubmitting(true)
    try {
      if (isEditMode) {
        const payload = { nombre: prodForm.nombre, unidad_medida: prodForm.unidad_medida, categoria_id: prodForm.categoria_id }
        await catalogService.updateProduct(prodForm.id, payload)
      } else {
        const payload = {
          nombre: prodForm.nombre,
          unidad_medida: prodForm.unidad_medida,
          categoria_id: prodForm.categoria_id,
          sede_id: activeSede?.id,
          activar_todas: prodForm.activar_todas
        }
        await catalogService.createProduct(payload)
      }
      toast.success(isEditMode ? 'Producto actualizado' : 'Producto creado')
      await fetchData(); cancelView()
    } catch (error) { toast.error(error.message || 'Error guardando producto.') } finally { setIsSubmitting(false) }
  }

  // --- ARCHIVAR / RESTAURAR ---
  const confirmDelete = (e, item, type) => { if (e) e.stopPropagation(); setItemToDelete(item); setDeleteType(type) }
  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      if (deleteType === 'PRODUCT') { 
        await catalogService.deleteProduct(itemToDelete.id, activeSede?.id, false)
        toast.info('Producto archivado en la papelera')
        if (activeProductId === itemToDelete.id) handleOpenCategory(activeCategoryId) 
      }
      else if (deleteType === 'PRODUCT_RESTORE') { 
        await catalogService.restoreProduct(itemToDelete.id, activeSede?.id, false)
        toast.success('Producto restaurado con éxito')
        if (activeProductId === itemToDelete.id) handleOpenCategory(activeCategoryId) 
      }
      else if (deleteType === 'CATEGORY') { 
        await catalogService.deleteCategory(itemToDelete.id)
        toast.info('Categoría eliminada')
        if (activeCategoryId === itemToDelete.id) handleOpenArea(activeAreaId) 
      }
      else if (deleteType === 'AREA') { 
        await catalogService.deleteArea(itemToDelete.id)
        toast.info('Área eliminada')
        if (activeAreaId === itemToDelete.id) handleGoHome() 
      }
      await fetchData(); cancelView()
    } catch (error) { 
      toast.error(error.message || 'Error en la operación.') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  // ==========================================
  // RENDERIZADO
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="animate-spin text-[#A80F14]" size={40} />
        <span className="text-sm text-[#5D4B47] font-medium">Cargando inventario...</span>
      </div>
    )
  }

  // --- FORMULARIOS ---
  if (viewState.startsWith('FORM_')) {
    const formAccent = viewState === 'FORM_AREA' ? levelTheme.area.accent : viewState === 'FORM_CAT' ? levelTheme.category.accent : levelTheme.product.accent
    return (
      <div className="animate-fade-in-up max-w-2xl mx-auto mt-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl card-soft border border-[#E9DFD9]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold" style={{ color: formAccent }}>
              {isEditMode ? 'Editar' : 'Crear'} {viewState === 'FORM_PROD' ? 'Producto' : viewState === 'FORM_CAT' ? 'Categoría' : 'Área'}
            </h3>
            <button onClick={cancelView} aria-label="Cerrar formulario" title="Cerrar" className="p-2 text-[#877571] hover:bg-[#FAF7F4] rounded-full cursor-pointer"><X size={20} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {viewState === 'FORM_PROD' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Nombre del Producto</label>
                  <input type="text" value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} placeholder="Ej: Arroz Extra" className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none focus:border-[#A80F14] text-sm text-[#2C211F] font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Unidad (SKU / Medida)</label>
                  <input type="text" value={prodForm.unidad_medida} onChange={e => setProdForm({...prodForm, unidad_medida: e.target.value})} placeholder="Ej: kg, L, un" className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none focus:border-[#A80F14] text-sm text-[#2C211F] font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Pertenece al Área</label>
                  <select value={prodForm.area_id || ''} onChange={e => {
                    const area_id = e.target.value;
                    const firstCat = categories.find(c => c.area_id === area_id);
                    setProdForm({...prodForm, area_id, categoria_id: firstCat?.id || ''})
                  }} className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none cursor-pointer text-sm text-[#2C211F] font-medium">
                    <option value="">Selecciona Área</option>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Categoría</label>
                  <select disabled={!prodForm.area_id} value={prodForm.categoria_id} onChange={e => setProdForm({...prodForm, categoria_id: e.target.value})} className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none disabled:opacity-40 cursor-pointer text-sm text-[#2C211F] font-medium">
                    <option value="">Selecciona Categoría</option>
                    {categories.filter(c => c.area_id === prodForm.area_id).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                {!isEditMode && (
                  <div className="md:col-span-2 pt-1">
                    <label className="flex items-center space-x-3 p-3.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl cursor-pointer hover:bg-[#F3ECE5] transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={prodForm.activar_todas || false}
                        onChange={e => setProdForm({...prodForm, activar_todas: e.target.checked})}
                        className="w-4 h-4 text-[#A80F14] rounded border-[#D8CBC5] focus:ring-[#A80F14] cursor-pointer accent-[#A80F14]"
                      />
                      <span className="text-xs text-[#5D4B47] font-medium leading-relaxed">
                        Activar también en todas las sedes (por defecto solo estará visible y activo en <strong className="text-[#2C211F]">{activeSede?.nombre || 'esta sede'}</strong>)
                      </span>
                    </label>
                  </div>
                )}
              </>
            )}
            {viewState === 'FORM_CAT' && (
              <>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Nombre de Categoría</label>
                  <input type="text" value={catForm.nombre} onChange={e => setCatForm({...catForm, nombre: e.target.value.toUpperCase()})} placeholder="Ej: CARNES Y AVES" className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none uppercase text-sm text-[#2C211F] font-medium" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Pertenece al Área</label>
                  <select value={catForm.area_id} onChange={e => setCatForm({...catForm, area_id: e.target.value})} className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none cursor-pointer text-sm text-[#2C211F] font-medium">
                    {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
            {viewState === 'FORM_AREA' && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Nombre del Área</label>
                <input type="text" value={areaForm.nombre} onChange={e => setAreaForm({...areaForm, nombre: e.target.value.toUpperCase()})} placeholder="Ej: COCINA PRINCIPAL" className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none uppercase text-sm text-[#2C211F] font-medium" />
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-3 pt-5 border-t border-[#E9DFD9]">
            <button onClick={cancelView} disabled={isSubmitting} className="px-5 py-2.5 border border-[#D8CBC5] rounded-xl hover:bg-[#FAF7F4] font-medium cursor-pointer text-sm text-[#5D4B47]">Cancelar</button>
            <button onClick={viewState === 'FORM_PROD' ? handleSaveProduct : viewState === 'FORM_CAT' ? handleSaveCategory : handleSaveArea} disabled={isSubmitting} className="px-6 py-2.5 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold text-sm cursor-pointer shadow-md transition-all">
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative animate-fade-in pb-10">
      
      {/* BREADCRUMBS */}
      <nav className="flex flex-wrap items-center justify-between bg-white px-5 py-3.5 rounded-2xl card-soft border border-[#E9DFD9] gap-y-2">
        <div className="flex flex-wrap items-center text-sm font-medium">
          <button onClick={handleGoHome} className="flex items-center cursor-pointer rounded-lg px-2 py-1 -ml-2 transition-colors text-[#2C211F] hover:text-[#A80F14]">
            <Home size={16} className="mr-1.5 text-[#A80F14]" /> <span className={(!activeAreaId && !isArchivedView) ? 'font-bold text-[#A80F14]' : ''}>Inventario</span>
          </button>
          
          {isArchivedView && (
            <>
              <ChevronRight size={16} className="mx-1.5 text-[#D8CBC5]" />
              <span className="flex items-center font-bold px-2 py-1 text-[#B45309]">
                <Archive size={16} className="mr-1.5" /> Papelera
              </span>
            </>
          )}
        
        {activeAreaId && (
          <>
            <ChevronRight size={16} className="mx-1.5 text-[#D8CBC5]" />
            <button onClick={() => handleOpenArea(activeAreaId)} className="flex items-center cursor-pointer rounded-lg px-2 py-1 transition-colors text-[#5D4B47] hover:text-[#A80F14]">
              <Layers size={16} className="mr-1.5 text-[#D6A24A]" /> <span className={!activeCategoryId ? 'font-bold text-[#3A0F0F]' : ''}>{activeAreaObj?.nombre}</span>
            </button>
          </>
        )}

        {activeCategoryId && (
          <>
            <ChevronRight size={16} className="mx-1.5 text-[#D8CBC5]" />
            <button onClick={() => handleOpenCategory(activeCategoryId)} className="flex items-center cursor-pointer rounded-lg px-2 py-1 transition-colors text-[#5D4B47] hover:text-[#A80F14]">
              <FolderOpen size={16} className="mr-1.5 text-[#D6A24A]" /> <span className={!activeProductId ? 'font-bold text-[#A80F14]' : ''}>{activeCategoryObj?.nombre}</span>
            </button>
          </>
        )}
        
        {activeProductId && !isArchivedView && (
          <>
            <ChevronRight size={16} className="mx-1.5 text-[#D8CBC5]" />
            <span className="flex items-center font-bold px-2 py-1 text-[#2C211F]">
              <Package size={16} className="mr-1.5 text-[#A80F14]" /> {activeProductObj?.nombre}
            </span>
          </>
        )}
        </div>

        {isAdmin && !isArchivedView && (
          <button onClick={() => { handleGoHome(); setIsArchivedView(true); }} className="flex items-center text-xs font-bold text-[#5D4B47] hover:text-[#A80F14] transition-colors cursor-pointer px-3 py-1.5 border border-[#D8CBC5] rounded-xl bg-[#FAF7F4] hover:bg-[#FFF9F0]">
            <Archive size={14} className="mr-1.5 text-[#D6A24A]" /> Papelera
          </button>
        )}
      </nav>

      {/* VISTA ARCHIVADOS */}
      {isArchivedView && !activeProductId && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#3A0F0F]">Papelera de Reciclaje</h2>
              <p className="text-sm text-[#5D4B47] mt-0.5">Productos archivados en {activeSede?.nombre || 'esta sede'}</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-2xl card-soft border border-[#E9DFD9] relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#877571]" size={20} />
            <input type="text" placeholder="Buscar productos archivados..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#FAF7F4] border-none rounded-xl outline-none text-sm font-medium text-[#2C211F]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {products.filter(p => (p.sede_activo === false || p.activo === false) && p.nombre.toLowerCase().includes(searchLower)).map(product => (
              <div key={product.id} onClick={() => handleOpenProduct(product)} className="bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex flex-col relative overflow-hidden group cursor-pointer hover:border-[#D6A24A] transition-all">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B45309] rounded-l-2xl"></div>
                <div className="pl-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-[#2C211F] group-hover:text-[#A80F14] transition-colors">{product.nombre}</h3>
                    <p className="text-[10px] font-bold text-[#877571] uppercase tracking-wider mt-1">{product.categorias?.nombre}</p>
                    <p className="text-[#877571] text-xs mt-0.5">SKU: {product.unidad_medida}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#877571] uppercase tracking-wider font-bold">Stock</p>
                    <p className="text-xl font-black text-[#2C211F]">{product.stock_actual}</p>
                  </div>
                </div>
                <div className="pl-3 mt-4 pt-3 border-t border-[#E9DFD9] flex justify-end">
                  <button onClick={(e) => confirmDelete(e, product, 'PRODUCT_RESTORE')} className="flex items-center px-4 py-2 text-[#15803D] bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold text-xs cursor-pointer transition-colors w-full justify-center border border-emerald-200">
                    <Archive size={14} className="mr-2" /> Restaurar Producto
                  </button>
                </div>
              </div>
            ))}
            {products.filter(p => p.sede_activo === false || p.activo === false).length === 0 && (
              <div className="col-span-full text-center py-16 text-[#877571] border-2 border-dashed border-[#E9DFD9] rounded-2xl flex flex-col items-center">
                <Archive size={40} className="text-[#877571] mb-3 opacity-60" />
                <p>La papelera de esta sede está vacía.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NIVEL 1: ÁREAS */}
      {!activeAreaId && !isArchivedView && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#2C211F]">Áreas Principales</h2>
              <p className="text-sm text-[#5D4B47] mt-0.5">Selecciona un área para ver sus categorías</p>
            </div>
            <button onClick={openCreateArea} className="flex items-center px-5 py-2.5 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold shadow-md cursor-pointer hover:shadow-lg transition-all text-sm">
              <Plus size={18} className="mr-2"/> Nueva Área
            </button>
          </div>
          
          <div className="bg-white p-3 rounded-2xl card-soft border border-[#E9DFD9] relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#877571]" size={20} />
            <input type="text" placeholder="Buscar áreas, categorías o productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#FAF7F4] border-none rounded-xl outline-none text-sm text-[#2C211F] font-medium" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {filteredAreas.map(area => (
              <div key={area.id} onClick={() => handleOpenArea(area.id)} className="bg-white p-6 rounded-2xl card-soft border border-[#E9DFD9] hover:border-[#A80F14]/40 cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative min-h-[160px] transition-all">
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditArea(e, area)} aria-label={`Editar área ${area.nombre}`} title="Editar área" className="p-1.5 text-[#877571] hover:text-[#2C211F] bg-[#FAF7F4] rounded-lg cursor-pointer"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, area, 'AREA')} aria-label={`Eliminar área ${area.nombre}`} title="Eliminar área" className="p-1.5 text-[#877571] hover:text-[#B42318] bg-[#FAF7F4] rounded-lg cursor-pointer"><Trash2 size={14}/></button>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-[#FFF9F0] text-[#A80F14] border border-[#E7C77A]">
                  <Layers size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-[#2C211F]">{area.nombre}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF7F4] text-[#5D4B47] border border-[#E9DFD9]">
                  {categories.filter(c => c.area_id === area.id).length} categorías
                </span>
              </div>
            ))}
            {filteredAreas.length === 0 && (
               <div className="col-span-full text-center py-16 text-[#877571] border-2 border-dashed border-[#E9DFD9] rounded-2xl">No se encontraron resultados.</div>
            )}
          </div>
        </div>
      )}

      {/* NIVEL 2: CATEGORÍAS */}
      {activeAreaId && !activeCategoryId && !isArchivedView && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#2C211F]">Categorías</h2>
              <p className="text-sm text-[#5D4B47] mt-0.5">en {activeAreaObj?.nombre}</p>
            </div>
            <button onClick={openCreateCategory} className="flex items-center px-5 py-2.5 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold shadow-md cursor-pointer hover:shadow-lg transition-all text-sm">
              <Plus size={18} className="mr-2"/> Nueva Categoría
            </button>
          </div>
          
          <div className="bg-white p-3 rounded-2xl card-soft border border-[#E9DFD9] relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#877571]" size={20} />
            <input type="text" placeholder={`Buscar categorías o productos en ${activeAreaObj?.nombre}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#FAF7F4] border-none rounded-xl outline-none text-sm text-[#2C211F] font-medium" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {filteredCategories.map(cat => (
              <div key={cat.id} onClick={() => handleOpenCategory(cat.id)} className="bg-white p-6 rounded-2xl card-soft border border-[#E9DFD9] hover:border-[#D6A24A] cursor-pointer group flex flex-col items-center justify-center text-center space-y-3 relative min-h-[160px] transition-all">
                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => openEditCategory(e, cat)} aria-label={`Editar categoría ${cat.nombre}`} title="Editar categoría" className="p-1.5 text-[#877571] hover:text-[#2C211F] bg-[#FAF7F4] rounded-lg cursor-pointer"><Edit2 size={14}/></button>
                  <button onClick={(e) => confirmDelete(e, cat, 'CATEGORY')} aria-label={`Eliminar categoría ${cat.nombre}`} title="Eliminar categoría" className="p-1.5 text-[#877571] hover:text-[#B42318] bg-[#FAF7F4] rounded-lg cursor-pointer"><Trash2 size={14}/></button>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-[#F8EEDF] text-[#3A0F0F] border border-[#E7C77A]">
                  <FolderOpen size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-[#2C211F]">{cat.nombre}</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF7F4] text-[#5D4B47] border border-[#E9DFD9]">
                  {products.filter(p => p.categoria_id === cat.id).length} productos
                </span>
              </div>
            ))}
            {filteredCategories.length === 0 && (
               <div className="col-span-full text-center py-16 text-[#877571] border-2 border-dashed border-[#E9DFD9] rounded-2xl">No se encontraron categorías.</div>
            )}
          </div>
        </div>
      )}

      {/* NIVEL 3: PRODUCTOS */}
      {activeCategoryId && !activeProductId && !isArchivedView && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#2C211F]">Productos</h2>
              <p className="text-sm text-[#5D4B47] mt-0.5">en {activeCategoryObj?.nombre}</p>
            </div>
            <button onClick={openCreateProduct} className="flex items-center px-5 py-2.5 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold shadow-md cursor-pointer hover:shadow-lg transition-all text-sm">
              <Plus size={18} className="mr-2"/> Nuevo Producto
            </button>
          </div>
          
          <div className="bg-white p-3 rounded-2xl card-soft border border-[#E9DFD9] relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[#877571]" size={20} />
            <input type="text" placeholder={`Buscar en ${activeCategoryObj?.nombre}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#FAF7F4] border-none rounded-xl outline-none text-sm text-[#2C211F] font-medium" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filteredProducts.map(product => {
              const isArchived = product.sede_activo === false || product.activo === false
              const stock = Number(product.stock_actual || 0)
              const stockColor = stock > 10 ? 'text-[#15803D]' : stock > 0 ? 'text-[#B45309]' : 'text-[#B42318]'
              return (
                <div key={product.id} onClick={() => handleOpenProduct(product)} className={`bg-white p-5 rounded-2xl card-soft border border-[#E9DFD9] flex justify-between items-center cursor-pointer group relative overflow-hidden hover:border-[#A80F14]/40 transition-all ${isArchived ? 'opacity-60 grayscale' : ''}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isArchived ? 'bg-slate-300' : 'bg-[#A80F14]'}`}></div>
                  <div className="pl-3">
                    <h3 className="text-base font-bold text-[#2C211F] group-hover:text-[#A80F14] transition-colors">
                      {product.nombre}
                      {isArchived && <span className="ml-2 text-[10px] bg-rose-100 text-[#B42318] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Archivado</span>}
                    </h3>
                    <p className="text-[#877571] text-xs mt-0.5 font-medium">SKU: {product.unidad_medida}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#877571] uppercase tracking-wider font-bold">Stock</p>
                    <p className={`text-xl font-black tabular-nums ${stockColor}`}>{product.stock_actual}</p>
                  </div>
                </div>
              )
            })}
            {filteredProducts.length === 0 && <div className="col-span-full text-center py-16 text-[#877571] border-2 border-dashed border-[#E9DFD9] rounded-2xl">No se encontraron productos.</div>}
          </div>
        </div>
      )}

      {/* NIVEL 4: DETALLE DEL PRODUCTO (KARDEX) */}
      {activeProductId && activeProductObj && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white rounded-3xl card-soft border border-[#E9DFD9] overflow-hidden">
            {/* Accent bar Mama Julia */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#A80F14] via-[#D6A24A] to-[#3A0F0F]"></div>
            <div className="p-6 border-b border-[#E9DFD9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#2C211F]">{activeProductObj.nombre}</h2>
                <p className="text-[#5D4B47] font-medium flex items-center mt-1 text-xs"><Package size={14} className="mr-1.5 text-[#A80F14]" /> Unidad / SKU: {activeProductObj.unidad_medida}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => openEditProduct(e, activeProductObj)} className="flex items-center px-4 py-2 text-[#5D4B47] bg-[#FAF7F4] hover:bg-[#F3ECE8] rounded-xl font-bold text-xs cursor-pointer border border-[#D8CBC5] transition-colors"><Settings size={14} className="mr-1.5" /> Configurar</button>
                {(activeProductObj.sede_activo === false || activeProductObj.activo === false) ? (
                  <button onClick={(e) => confirmDelete(e, activeProductObj, 'PRODUCT_RESTORE')} className="flex items-center px-4 py-2 text-[#15803D] bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold text-xs cursor-pointer border border-emerald-200 transition-colors"><Archive size={14} className="mr-1.5" /> Restaurar</button>
                ) : (
                  <button onClick={(e) => confirmDelete(e, activeProductObj, 'PRODUCT')} className="flex items-center px-4 py-2 text-[#B45309] bg-amber-50 hover:bg-amber-100 rounded-xl font-bold text-xs cursor-pointer border border-amber-200 transition-colors"><Archive size={14} className="mr-1.5" /> Archivar</button>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#FAF7F4]">
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-[#877571] uppercase tracking-widest mb-2">Stock Actual en {activeSede?.nombre || 'Sede'}</p>
                <div className="flex items-baseline justify-center md:justify-start space-x-2">
                  <span className="text-5xl sm:text-6xl font-black text-[#2C211F] tracking-tight tabular-nums">{activeProductObj.stock_actual}</span>
                  <span className="text-base font-bold text-[#877571] uppercase">{activeProductObj.unidad_medida}</span>
                </div>
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <button onClick={() => openTxModal('INGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-5 min-w-[130px] bg-emerald-50 text-[#15803D] hover:bg-[#15803D] hover:text-white rounded-2xl font-bold shadow-sm group cursor-pointer transition-all border border-emerald-200">
                  <ArrowDownCircle size={28} className="mb-1.5 group-hover:scale-110 transition-transform" /> Ingreso
                </button>
                <button onClick={() => openTxModal('EGRESO')} className="flex-1 md:flex-none flex flex-col items-center justify-center p-5 min-w-[130px] bg-rose-50 text-[#B42318] hover:bg-[#B42318] hover:text-white rounded-2xl font-bold shadow-sm group cursor-pointer transition-all border border-rose-200">
                  <ArrowUpCircle size={28} className="mb-1.5 group-hover:scale-110 transition-transform" /> Egreso
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl card-soft border border-[#E9DFD9] overflow-hidden">
            <div className="p-5 border-b border-[#E9DFD9] flex items-center space-x-2 bg-[#FAF7F4]">
              <BarChart3 size={18} className="text-[#A80F14]" /><h3 className="font-bold text-[#2C211F] text-sm">Historial de Transacciones (Kardex)</h3>
            </div>
            {isLoadingMovements ? (
              <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-[#A80F14]" size={32} /></div>
            ) : movements.length === 0 ? (
              <div className="text-center py-16 text-[#877571] text-sm">No hay movimientos registrados para este producto.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F4] text-[11px] uppercase tracking-wider text-[#5D4B47] border-b border-[#E9DFD9]">
                      <th className="p-4 font-bold">Fecha</th>
                      <th className="p-4 font-bold">Operación</th>
                      <th className="p-4 font-bold text-right">Cant.</th>
                      <th className="p-4 font-bold text-right">Stock Final</th>
                      <th className="p-4 font-bold">Obs.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9DFD9]/60">
                    {movements.map(mov => (
                      <tr key={mov.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                        <td className="p-4 text-sm text-[#5D4B47]">{new Date(mov.fecha).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${mov.tipo_movimiento==='INGRESO'?'bg-emerald-50 text-[#15803D] border border-emerald-200':mov.tipo_movimiento==='EGRESO'?'bg-rose-50 text-[#B42318] border border-rose-200':'bg-amber-50 text-[#B45309] border border-amber-200'}`}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-black text-right tabular-nums ${mov.tipo_movimiento==='INGRESO'?'text-[#15803D]':mov.tipo_movimiento==='EGRESO'?'text-[#B42318]':'text-[#2C211F]'}`}>
                          {mov.tipo_movimiento==='INGRESO'?'+':mov.tipo_movimiento==='EGRESO'?'-':''}{mov.cantidad}
                        </td>
                        <td className="p-4 text-sm font-black text-right text-[#2C211F] tabular-nums">{mov.stock_resultante}</td>
                        <td className="p-4 text-sm text-[#877571]">{mov.observaciones || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ARCHIVAR / ELIMINAR */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-fade-in-up border border-[#E9DFD9]">
            {deleteType === 'PRODUCT' ? (
              <Archive className="text-[#B45309] w-12 h-12 mx-auto mb-4 bg-amber-50 p-2.5 rounded-2xl border border-amber-200" />
            ) : deleteType === 'PRODUCT_RESTORE' ? (
              <Archive className="text-[#15803D] w-12 h-12 mx-auto mb-4 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200" />
            ) : (
              <Trash2 className="text-[#B42318] w-12 h-12 mx-auto mb-4 bg-rose-50 p-2.5 rounded-2xl border border-rose-200" />
            )}
            <h3 className="text-xl font-bold text-[#2C211F]">
              {deleteType === 'PRODUCT' ? 'Archivar Producto' : deleteType === 'PRODUCT_RESTORE' ? 'Restaurar Producto' : `Eliminar ${deleteType === 'AREA' ? 'Área' : 'Categoría'}`}?
            </h3>
            <p className="text-[#5D4B47] text-sm mt-2 mb-6 leading-relaxed">
              {deleteType === 'PRODUCT' ? (
                <><strong className="text-[#2C211F]">{itemToDelete.nombre}</strong> se ocultará del inventario de tu sede pero conservará su historial.</>
              ) : deleteType === 'PRODUCT_RESTORE' ? (
                <><strong className="text-[#2C211F]">{itemToDelete.nombre}</strong> volverá a estar visible y disponible en tu sede.</>
              ) : (
                <><strong className="text-[#2C211F]">{itemToDelete.nombre}</strong> se eliminará permanentemente del catálogo.</>
              )}
            </p>
            <div className="flex gap-3">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 px-4 py-2.5 border border-[#D8CBC5] rounded-xl hover:bg-[#FAF7F4] font-medium cursor-pointer text-sm text-[#5D4B47]">Cancelar</button>
              <button onClick={handleDelete} disabled={isSubmitting} className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold flex justify-center cursor-pointer text-sm transition-all ${deleteType === 'PRODUCT' ? 'bg-[#B45309] hover:bg-amber-700' : deleteType === 'PRODUCT_RESTORE' ? 'bg-[#15803D] hover:bg-emerald-800' : 'bg-[#B42318] hover:bg-rose-800'}`}>
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (deleteType === 'PRODUCT' ? 'Archivar' : deleteType === 'PRODUCT_RESTORE' ? 'Restaurar' : 'Eliminar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TRANSACCIÓN KARDEX */}
      {viewState === 'TX_MODAL' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden border border-[#E9DFD9]">
            <div className={`p-6 border-b flex justify-between items-center ${txType === 'INGRESO' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <h3 className={`text-xl font-black flex items-center ${txType === 'INGRESO' ? 'text-[#15803D]' : 'text-[#B42318]'}`}>
                {txType === 'INGRESO' ? <ArrowDownCircle className="mr-2"/> : <ArrowUpCircle className="mr-2"/>} Registrar {txType}
              </h3>
              <button onClick={cancelView} aria-label="Cerrar modal" title="Cerrar" className="p-2 cursor-pointer rounded-lg hover:bg-black/5 text-[#5D4B47]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2">Cantidad a {txType === 'INGRESO' ? 'sumar al stock' : 'restar del stock'}</label>
                <input type="number" inputMode="decimal" step="0.01" min="0" aria-label="Cantidad de movimiento" value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus className="w-full px-5 py-4 bg-[#FAF7F4] border-2 border-[#D8CBC5] rounded-2xl outline-none text-3xl font-black text-center focus:border-[#A80F14] text-[#2C211F] min-h-[44px]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider mb-2">Observación (Opcional)</label>
                <textarea value={txObs} onChange={e => setTxObs(e.target.value)} placeholder="Ej: Compra proveedor / Merma cocina" className="w-full px-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none resize-none h-20 text-sm text-[#2C211F]" />
              </div>
            </div>
            <div className="p-5 border-t border-[#E9DFD9] bg-[#FAF7F4] flex gap-3">
              <button onClick={cancelView} disabled={isSubmitting} className="flex-1 py-3 bg-white border border-[#D8CBC5] rounded-2xl font-bold cursor-pointer hover:bg-[#FAF7F4] text-sm text-[#5D4B47]">Cancelar</button>
              <button onClick={handleSaveTransaction} disabled={isSubmitting} className={`flex-1 py-3 text-white rounded-2xl font-black cursor-pointer text-sm shadow-md transition-all ${txType === 'INGRESO' ? 'bg-[#15803D] hover:bg-emerald-800' : 'bg-[#B42318] hover:bg-rose-800'}`}>
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
