import React, { useState, useEffect } from 'react'
import { useSede } from '../../context/SedeContext'
import { useAuth } from '../../context/AuthContext'
import { cajaService } from '../../services/cajaService'
import { Loader2, Wallet, Plus, DollarSign, Trash2, CheckCircle, AlertTriangle, Edit2, Check, X } from 'lucide-react'

const DENOMINACIONES = [100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1];
const METODOS_DIGITALES = ['Yape', 'Plin', 'Visa', 'Transferencia'];

export function CajaModule() {
  const { activeSede, loading: sedeLoading } = useSede();
  const { userProfile, session } = useAuth();
  
  // ================= INICIALIZACIÓN SINCRONIZADA (CACHÉ) =================
  const getInitialCache = () => {
    if (!activeSede) return { turno: null, draft: null };
    try {
      const t = JSON.parse(localStorage.getItem('mmj_last_turno'));
      if (t && t.sede_id === activeSede.id) {
        const d = JSON.parse(localStorage.getItem(`mmj_caja_draft_${t.id}`));
        return { turno: t, draft: d };
      }
    } catch(e) {}
    return { turno: null, draft: null };
  }

  const [cache] = useState(getInitialCache);

  const [turnoActivo, setTurnoActivo] = useState(cache.turno);
  const [loading, setLoading] = useState(!cache.turno);

  // ================= ESTADOS =================
  const [montoAperturaInput, setMontoAperturaInput] = useState('');
  const [arqueo, setArqueo] = useState(cache.draft?.arqueo || {});
  
  // ================= ESTADOS DE FLUJOS =================
  const [ventasPOS, setVentasPOS] = useState(cache.draft?.ventasPOS ?? '');
  const [digitales, setDigitales] = useState(cache.draft?.digitales || { Yape: '', Plin: '', Visa: '', Transferencia: '' });
  const [gastos, setGastos] = useState(cache.draft?.gastos || []);
  const [propinas, setPropinas] = useState(cache.draft?.propinas || []);
  const [ingresosExtra, setIngresosExtra] = useState(cache.draft?.ingresosExtra || { Baño: '', Fresquitos: '' });

  // ================= ESTADOS DE EDICIÓN =================
  const [editandoFondo, setEditandoFondo] = useState(false);
  const [nuevoFondo, setNuevoFondo] = useState('');

  useEffect(() => {
    if (sedeLoading) return;
    if (activeSede) {
      cargarTurno();
    } else {
      setLoading(false);
    }
  }, [activeSede, sedeLoading])

  // Guardar en caché automáticamente cuando cambian los datos
  useEffect(() => {
    if (turnoActivo && !loading) {
      const draft = { arqueo, ventasPOS, digitales, gastos, propinas, ingresosExtra };
      localStorage.setItem(`mmj_caja_draft_${turnoActivo.id}`, JSON.stringify(draft));
    }
  }, [arqueo, ventasPOS, digitales, gastos, propinas, ingresosExtra, turnoActivo, loading]);

  const loadDraft = (turnoId) => {
    try {
      const saved = localStorage.getItem(`mmj_caja_draft_${turnoId}`);
      if (saved) {
        const d = JSON.parse(saved);
        setArqueo(d.arqueo || {});
        setVentasPOS(d.ventasPOS !== undefined ? d.ventasPOS : '');
        setDigitales(d.digitales || { Yape: '', Plin: '', Visa: '', Transferencia: '' });
        setGastos(d.gastos || []);
        setPropinas(d.propinas || []);
        setIngresosExtra(d.ingresosExtra || { Baño: '', Fresquitos: '' });
        return true;
      }
    } catch(e) { console.error("Error cargando draft", e); }
    return false;
  }

  const cargarTurno = async () => {
    // Si cambiamos de sede, o no hay caché, mostramos loader
    if (!turnoActivo || turnoActivo.sede_id !== activeSede.id) {
      setLoading(true);
    }
    try {
      const turno = await cajaService.getTurnoAbierto(activeSede.id);
      setTurnoActivo(turno);
      if (turno) {
        localStorage.setItem('mmj_last_turno', JSON.stringify(turno));
        const hasDraft = loadDraft(turno.id);
        if (!hasDraft) resetForms();
      } else {
        localStorage.removeItem('mmj_last_turno');
        resetForms();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const resetForms = () => {
    setArqueo({});
    setVentasPOS('');
    setDigitales({ Yape: '', Plin: '', Visa: '', Transferencia: '' });
    setGastos([]);
    setPropinas([]);
    setIngresosExtra({ Baño: '', Fresquitos: '' });
    setMontoAperturaInput('');
  }

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    if (!montoAperturaInput || isNaN(montoAperturaInput) || Number(montoAperturaInput) < 0) {
      return alert("Ingresa un monto de apertura válido.");
    }
    setLoading(true);
    try {
      await cajaService.abrirCaja(activeSede.id, session.user.id, Number(montoAperturaInput));
      await cargarTurno();
    } catch (e) {
      alert("Error al abrir caja: " + e.message);
      setLoading(false);
    }
  }

  const handleGuardarFondo = async () => {
    if (isNaN(nuevoFondo) || Number(nuevoFondo) < 0) return alert("Fondo inválido.");
    try {
      await cajaService.actualizarFondo(turnoActivo.id, Number(nuevoFondo));
      setEditandoFondo(false);
      await cargarTurno();
    } catch (e) {
      alert("Error actualizando fondo: " + e.message);
    }
  }

  // ================= CÁLCULOS =================
  const getTotalEfectivo = () => {
    return DENOMINACIONES.reduce((acc, den) => acc + (den * (arqueo[den] || 0)), 0);
  }

  const getTotalGastos = () => gastos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  const getTotalPropinas = () => propinas.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
  const getTotalIngresosExtra = () => (Number(ingresosExtra.Baño) || 0) + (Number(ingresosExtra.Fresquitos) || 0);
  
  const getTotalDigitales = () => METODOS_DIGITALES.reduce((acc, m) => acc + (Number(digitales[m]) || 0), 0);
  const getVentasEfectivo = () => Math.max(0, Number(ventasPOS) - getTotalDigitales());

  const getMontoEsperado = () => {
    if (!turnoActivo) return 0;
    // Efectivo Esperado = Fondo + Ventas Efectivo + Ingresos Extra - Gastos - Propinas
    return Number(turnoActivo.monto_apertura) + getVentasEfectivo() + getTotalIngresosExtra() - getTotalGastos() - getTotalPropinas();
  }

  const getDiferencia = () => {
    return getTotalEfectivo() - getMontoEsperado();
  }

  const isAdmin = userProfile?.roles?.includes('ADMIN');

  // ================= SUBMIT CIERRE =================
  const handleCerrarCaja = async () => {
    if (!window.confirm(`¿Estás seguro de cerrar la caja de ${activeSede?.nombre}?`)) return;

    if (!ventasPOS || Number(ventasPOS) < 0) {
      return alert("Por favor ingresa las Ventas del Sistema (POS). Si no hay ventas, ingresa 0.");
    }

    const detallesArqueo = Object.entries(arqueo).map(([denominacion, cantidad]) => ({
      denominacion: Number(denominacion),
      cantidad: Number(cantidad)
    })).filter(a => a.cantidad > 0);

    const movimientosCierre = [];

    // Digitales (Ventas)
    Object.entries(digitales).forEach(([metodo, monto]) => {
      if (Number(monto) > 0) {
        movimientosCierre.push({ tipo: 'INGRESO', categoria: 'Ventas', descripcion: `Ventas por ${metodo}`, monto: Number(monto), metodo_pago: metodo });
      }
    });

    // Ventas en Efectivo Calculadas
    const ventasEfectivo = getVentasEfectivo();
    if (ventasEfectivo > 0) {
      movimientosCierre.push({ tipo: 'INGRESO', categoria: 'Ventas', descripcion: 'Ventas en Efectivo (Calculadas)', monto: ventasEfectivo, metodo_pago: 'Efectivo' });
    }

    // Ingresos Extra (Efectivo)
    Object.entries(ingresosExtra).forEach(([k, v]) => {
      if (Number(v) > 0) {
        movimientosCierre.push({ tipo: 'INGRESO', categoria: 'Extras', descripcion: k, monto: Number(v), metodo_pago: 'Efectivo' });
      }
    });

    // Gastos (Egresos Efectivo)
    gastos.forEach(g => {
      if (Number(g.monto) > 0) {
        movimientosCierre.push({ tipo: 'EGRESO', categoria: 'Gastos', descripcion: g.desc || 'Gasto General', monto: Number(g.monto), metodo_pago: 'Efectivo' });
      }
    });

    // Propinas (Egresos Efectivo)
    propinas.forEach(p => {
      if (Number(p.monto) > 0) {
        movimientosCierre.push({ tipo: 'EGRESO', categoria: 'Propinas', descripcion: `Propina ${p.desc}`, monto: Number(p.monto), metodo_pago: 'Efectivo' });
      }
    });

    setLoading(true);
    try {
      const result = await cajaService.cerrarCaja(turnoActivo.id, detallesArqueo, movimientosCierre);
      localStorage.removeItem(`mmj_caja_draft_${turnoActivo.id}`); // Limpiar caché al cerrar exitosamente
      localStorage.removeItem('mmj_last_turno'); // Limpiar turno en caché
      alert(`Caja Cerrada Exitosamente.\nDiferencia: S/ ${result.diferencia}`);
      await cargarTurno();
    } catch (e) {
      alert("Error al cerrar caja: " + e.message);
      setLoading(false);
    }
  }


  if (sedeLoading || loading) return <div className="p-12 text-center text-slate-500 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!activeSede) return <div className="p-12 text-center text-slate-500">No hay sede seleccionada.</div>;

  // ================= VISTA APERTURA =================
  if (!turnoActivo) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-3xl card-soft border border-slate-100 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wallet size={32} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Apertura de Caja</h2>
        <p className="text-slate-500 text-sm mb-8">No hay un turno abierto en la sede <strong>{activeSede.nombre}</strong>.</p>
        
        <form onSubmit={handleAbrirCaja} className="space-y-6 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monto de Apertura (Fondo)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
              <input 
                type="number" step="0.1" min="0" required autoFocus
                value={montoAperturaInput} onChange={e => setMontoAperturaInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-lg outline-none focus:border-emerald-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2">
            <CheckCircle size={20} />
            <span>Abrir Turno</span>
          </button>
        </form>
      </div>
    )
  }

  // ================= VISTA CUADRE (3 COLUMNAS) =================
  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Cuadre de Caja</h2>
        <p className="text-slate-400 text-sm mt-1">Turno abierto por <strong>{turnoActivo.usuarios?.nombre_completo}</strong> en <strong>{activeSede.nombre}</strong></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: EFECTIVO */}
        <div className="bg-white rounded-3xl card-soft border border-slate-100 flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3 bg-emerald-50/50 rounded-t-3xl">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={18} /></div>
            <h3 className="font-bold text-slate-800">Efectivo Físico</h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto space-y-3">
            {DENOMINACIONES.map(den => (
              <div key={den} className="flex items-center justify-between group py-0.5">
                <div className="w-16 text-right shrink-0">
                  <span className="text-xs font-bold text-slate-700">S/ {den.toFixed(2)}</span>
                </div>
                <span className="w-4 text-center text-slate-300 text-xs font-bold shrink-0">x</span>
                <input 
                  type="number" min="0" placeholder="0"
                  value={arqueo[den] || ''}
                  onChange={e => setArqueo({...arqueo, [den]: parseInt(e.target.value) || 0})}
                  className="w-16 py-1 px-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-sm outline-none focus:border-emerald-500 transition-colors shrink-0"
                />
                <span className="w-4 text-center text-slate-300 text-xs font-bold shrink-0">=</span>
                <div className="w-20 text-right shrink-0">
                  <span className="text-sm font-black text-slate-800">{(den * (arqueo[den] || 0)).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Físico</span>
            <span className="text-xl font-black text-emerald-600">S/ {getTotalEfectivo().toFixed(2)}</span>
          </div>
        </div>

        {/* COLUMNA 2: FLUJOS DIGITALES Y EXTRAS */}
        <div className="bg-white rounded-3xl card-soft border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3 bg-blue-50/50">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Wallet size={18} /></div>
            <h3 className="font-bold text-slate-800">Digitales y Flujos</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* VENTAS DEL SISTEMA */}
            <section className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2">Ventas del Sistema (POS)</label>
              <input 
                type="number" step="0.1" min="0" placeholder="Total de ventas..."
                value={ventasPOS} onChange={e => setVentasPOS(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-emerald-200 rounded-lg font-bold text-base outline-none focus:border-emerald-500 text-emerald-900 shadow-sm"
              />
              <p className="text-[10px] text-emerald-600 font-medium mt-1">Ingresa el total que figura en el reporte del sistema.</p>
            </section>

            {/* DIGITALES */}
            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ingresos Digitales</h4>
              <div className="grid grid-cols-2 gap-3">
                {METODOS_DIGITALES.map(metodo => (
                  <div key={metodo}>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{metodo}</label>
                    <input 
                      type="number" step="0.1" min="0" placeholder="0.00"
                      value={digitales[metodo]} onChange={e => setDigitales({...digitales, [metodo]: e.target.value})}
                      className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* INGRESOS EXTRA (Lince suele usarlos, pero disponibles para todos) */}
            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ingresos Extra (Efectivo)</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(ingresosExtra).map(k => (
                  <div key={k}>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{k}</label>
                    <input 
                      type="number" step="0.1" min="0" placeholder="0.00"
                      value={ingresosExtra[k]} onChange={e => setIngresosExtra({...ingresosExtra, [k]: e.target.value})}
                      className="w-full py-1.5 px-3 bg-emerald-50 border border-emerald-100 rounded-lg font-bold text-sm outline-none focus:border-emerald-500 text-emerald-800"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* GASTOS */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gastos (Efectivo)</h4>
                <button onClick={() => setGastos([...gastos, {desc:'', monto:''}])} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold flex items-center transition-colors">
                  <Plus size={10} className="mr-1" /> Agregar
                </button>
              </div>
              <div className="space-y-2">
                {gastos.map((g, i) => (
                  <div key={i} className="flex space-x-2">
                    <input type="text" placeholder="Detalle..." value={g.desc} onChange={e => { const ng = [...gastos]; ng[i].desc = e.target.value; setGastos(ng); }} className="flex-1 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-red-400" />
                    <input type="number" placeholder="0.00" value={g.monto} onChange={e => { const ng = [...gastos]; ng[i].monto = e.target.value; setGastos(ng); }} className="w-20 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-red-400" />
                    <button onClick={() => setGastos(gastos.filter((_, idx) => idx !== i))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                  </div>
                ))}
                {gastos.length === 0 && <p className="text-xs text-slate-400 italic">No hay gastos registrados.</p>}
              </div>
            </section>

            {/* PROPINAS (Requerido para Pueblo Libre) */}
            {(activeSede.nombre.toLowerCase().includes('pueblo libre') || propinas.length > 0) && (
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Propinas Meseros</h4>
                  <button onClick={() => setPropinas([...propinas, {desc:'', monto:''}])} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold flex items-center transition-colors">
                    <Plus size={10} className="mr-1" /> Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {propinas.map((p, i) => (
                    <div key={i} className="flex space-x-2">
                      <input type="text" placeholder="Nombre..." value={p.desc} onChange={e => { const np = [...propinas]; np[i].desc = e.target.value; setPropinas(np); }} className="flex-1 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-orange-400" />
                      <input type="number" placeholder="0.00" value={p.monto} onChange={e => { const np = [...propinas]; np[i].monto = e.target.value; setPropinas(np); }} className="w-20 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-orange-400" />
                      <button onClick={() => setPropinas(propinas.filter((_, idx) => idx !== i))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>

        {/* COLUMNA 3: CONSOLIDADO */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-slate-900/20 relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold mb-1">Cierre de Caja</h3>
              <p className="text-slate-400 text-xs">Revisa los saldos antes de confirmar</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium">Fondo Inicial</span>
                {editandoFondo ? (
                  <div className="flex items-center space-x-1">
                    <input 
                      type="number" step="0.1" min="0" autoFocus
                      value={nuevoFondo} onChange={e => setNuevoFondo(e.target.value)}
                      className="w-16 py-0.5 px-1 bg-white text-slate-900 rounded font-bold text-xs outline-none"
                    />
                    <button onClick={handleGuardarFondo} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"><Check size={14}/></button>
                    <button onClick={() => setEditandoFondo(false)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><X size={14}/></button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">S/ {Number(turnoActivo.monto_apertura).toFixed(2)}</span>
                    <button onClick={() => { setNuevoFondo(turnoActivo.monto_apertura); setEditandoFondo(true); }} className="text-slate-500 hover:text-white transition-colors">
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium">Ventas (POS)</span>
                <span className="text-sm font-bold">S/ {Number(ventasPOS || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium">Flujos Digitales</span>
                <span className="text-sm font-bold text-blue-400">- S/ {getTotalDigitales().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-medium">Gastos / Propinas</span>
                <span className="text-sm font-bold text-red-400">- S/ {(getTotalGastos() + getTotalPropinas()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-white/10">
                <span className="text-xs font-medium">Ingresos Extras</span>
                <span className="text-sm font-bold text-emerald-400">+ S/ {getTotalIngresosExtra().toFixed(2)}</span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-300">Efectivo Esperado</span>
                <span className="text-lg font-bold">S/ {getMontoEsperado().toFixed(2)}</span>
              </div>
              
              <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-emerald-500/30 mt-2">
                <span className="text-sm font-bold text-emerald-400">Efectivo Físico</span>
                <span className="text-xl font-black text-emerald-400">S/ {getTotalEfectivo().toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              {isAdmin ? (
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 text-center">Cuadre (Diferencia)</p>
                  <p className={`text-3xl font-black text-center ${getDiferencia() === 0 ? 'text-emerald-400' : getDiferencia() > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {getDiferencia() > 0 ? '+' : ''}{getDiferencia().toFixed(2)}
                  </p>
                  <p className="text-center text-[10px] text-slate-500 mt-1">
                    {getDiferencia() === 0 ? 'Caja cuadrada perfectamente' : getDiferencia() > 0 ? 'Sobrante detectado' : 'Faltante detectado'}
                  </p>
                </div>
              ) : (
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-2">
                  <AlertTriangle size={24} className="text-slate-500" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cuadre Ciego Activo</p>
                  <p className="text-[10px] text-slate-500">La diferencia se registrará internamente.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleCerrarCaja}
            className="mt-8 relative z-10 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center space-x-2"
          >
            <CheckCircle size={22} />
            <span>Confirmar Cierre</span>
          </button>
        </div>

      </div>
    </div>
  )
}
