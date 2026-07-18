import React, { useState, useEffect } from 'react'
import { Search, ChevronLeft, ArrowDownCircle, ArrowUpCircle, Clock, Loader2, Package } from 'lucide-react'
import { kardexService } from '../../services/kardexService'

export function KardexModule() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado de Producto Seleccionado (Drill-down)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [movements, setMovements] = useState([])
  const [isLoadingMovements, setIsLoadingMovements] = useState(false)
  
  // Estado del Modal de Transacción
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [txType, setTxType] = useState('INGRESO')
  const [txAmount, setTxAmount] = useState('')
  const [txObs, setTxObs] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await kardexService.getProductsForSelect()
      setProducts(data)
    } catch (error) {
      console.error(error)
      alert('Error cargando los productos.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product)
    setIsLoadingMovements(true)
    setSearchTerm('') // Limpiar búsqueda
    try {
      const data = await kardexService.getProductMovements(product.id)
      setMovements(data)
    } catch (error) {
      console.error(error)
      alert('Error cargando el historial del producto.')
    } finally {
      setIsLoadingMovements(false)
    }
  }

  const handleBack = () => {
    setSelectedProduct(null)
    setMovements([])
  }

  const openTxModal = (type) => {
    setTxType(type)
    setTxAmount('')
    setTxObs('')
    setIsTxModalOpen(true)
  }

  const handleSaveTransaction = async () => {
    if (!txAmount || isNaN(txAmount) || Number(txAmount) <= 0) {
      alert('Por favor ingresa una cantidad válida mayor a 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await kardexService.registerMovement({
        p_producto_id: selectedProduct.id,
        p_tipo_movimiento: txType,
        p_cantidad: Number(txAmount),
        p_observaciones: txObs || null
      })
      
      // Refrescar datos
      setIsTxModalOpen(false)
      const [updatedProducts, newMovements] = await Promise.all([
        kardexService.getProductsForSelect(),
        kardexService.getProductMovements(selectedProduct.id)
      ])
      
      setProducts(updatedProducts)
      setMovements(newMovements)
      
      // Actualizar el producto seleccionado actual en memoria para reflejar nuevo stock
      const updatedSel = updatedProducts.find(p => p.id === selectedProduct.id)
      if (updatedSel) setSelectedProduct(updatedSel)
      
    } catch (error) {
      console.error(error)
      alert('Error registrando el movimiento. Asegúrate de haber ejecutado el script RPC en Supabase.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- FILTROS ---
  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.categorias?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative animate-in fade-in">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          {selectedProduct && (
            <button 
              onClick={handleBack}
              className="p-2 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              title="Volver a Búsqueda"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedProduct ? `Kardex: ${selectedProduct.nombre}` : 'Control de Inventarios (Kardex)'}
            </h2>
            <p className="text-gray-500 text-sm">
              {selectedProduct 
                ? `Categoría: ${selectedProduct.categorias?.nombre || 'General'}` 
                : 'Selecciona un producto para registrar ingresos o egresos'
              }
            </p>
          </div>
        </div>
      </div>

      {!selectedProduct ? (
        /* VISTA 1: BUSCADOR DE PRODUCTOS */
        <>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
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
                onClick={() => handleSelectProduct(product)}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">{product.categorias?.nombre}</span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors">{product.nombre}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                  <p className={`text-xl font-bold ${product.stock_actual > 10 ? 'text-green-600' : 'text-orange-500'}`}>
                    {product.stock_actual} <span className="text-sm font-normal text-gray-500">{product.unidad_medida}</span>
                  </p>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-semibold text-gray-900">No se encontraron productos</h3>
                <p className="mt-1 text-sm text-gray-500">Prueba con otra búsqueda.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* VISTA 2: DETALLE DEL PRODUCTO (KARDEX) */
        <div className="space-y-6 animate-in slide-in-from-right-4">
          
          {/* Tarjeta Resumen y Botones de Acción */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-slate-50 to-white">
              <div className="text-center md:text-left">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Stock Actual disponible</p>
                <div className="flex items-baseline justify-center md:justify-start space-x-2">
                  <span className="text-5xl font-black text-gray-900 tracking-tight">{selectedProduct.stock_actual}</span>
                  <span className="text-xl font-semibold text-gray-400">{selectedProduct.unidad_medida}</span>
                </div>
              </div>
              
              <div className="flex w-full md:w-auto gap-3">
                <button 
                  onClick={() => openTxModal('INGRESO')}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-4 md:py-3 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  <ArrowDownCircle size={22} />
                  <span>Ingreso</span>
                </button>
                <button 
                  onClick={() => openTxModal('EGRESO')}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-4 md:py-3 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  <ArrowUpCircle size={22} />
                  <span>Egreso</span>
                </button>
              </div>
            </div>
          </div>

          {/* Historial de Movimientos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/50">
              <Clock className="text-gray-400" size={20} />
              <h3 className="font-bold text-gray-800">Historial de Movimientos</h3>
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
                      <th className="p-4 font-semibold">Tipo</th>
                      <th className="p-4 font-semibold text-right">Cantidad</th>
                      <th className="p-4 font-semibold text-right">Stock Resultante</th>
                      <th className="p-4 font-semibold">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map(mov => (
                      <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(mov.fecha).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            mov.tipo_movimiento === 'INGRESO' ? 'bg-green-100 text-green-700' :
                            mov.tipo_movimiento === 'EGRESO' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {mov.tipo_movimiento}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-bold text-right ${
                          mov.tipo_movimiento === 'INGRESO' ? 'text-green-600' :
                          mov.tipo_movimiento === 'EGRESO' ? 'text-red-600' :
                          'text-gray-700'
                        }`}>
                          {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                          {mov.cantidad}
                        </td>
                        <td className="p-4 text-sm font-bold text-gray-900 text-right">
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

      {/* Modal de Transacción (Ingreso/Egreso) */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in">
            <div className={`p-6 border-b flex justify-between items-center ${txType === 'INGRESO' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`text-xl font-bold ${txType === 'INGRESO' ? 'text-green-800' : 'text-red-800'}`}>
                Registrar {txType === 'INGRESO' ? 'Ingreso' : 'Egreso'}
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className={`p-2 rounded-full transition-colors ${txType === 'INGRESO' ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Cantidad ({selectedProduct?.unidad_medida})
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Ej. 10"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-lg font-semibold"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium">{selectedProduct?.unidad_medida}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Observación (Opcional)</label>
                <textarea 
                  value={txObs}
                  onChange={(e) => setTxObs(e.target.value)}
                  placeholder="Ej. Compra de mercado, Merma, Plato devuelto..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none h-24"
                />
              </div>
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex gap-3">
              <button 
                onClick={() => setIsTxModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTransaction}
                disabled={isSubmitting}
                className={`flex-1 flex justify-center items-center px-4 py-3 text-white rounded-xl font-bold shadow-sm transition-all ${
                  txType === 'INGRESO' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
