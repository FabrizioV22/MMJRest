import React from 'react'
import { Clock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export function RecentMovements({ recentMovements }) {
  return (
    <div className="bg-white rounded-2xl card-soft border border-slate-200/80 overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50">
        <Clock className="text-slate-400" size={18} />
        <h3 className="font-bold text-[#1F2937] text-sm">Actividad Reciente en Kardex</h3>
      </div>
      
      {/* Mobile View: Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {recentMovements.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No hay movimientos recientes.</div>
        ) : (
          recentMovements.map(mov => {
            const rawDate = mov.fecha || mov.created_at
            return (
              <div key={mov.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-[#1F2937]">{mov.productos?.nombre}</p>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">
                      {mov.productos?.categorias?.nombre} {mov.sedes?.nombre ? `• ${mov.sedes.nombre}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold ${
                    mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-[#16A34A]' :
                    mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-100 text-[#DC2626]' :
                    'bg-amber-100 text-[#A16207]'
                  }`}>
                    {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={12} />}
                    {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={12} />}
                    <span>{mov.tipo_movimiento}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#6B7280] pt-1">
                  <span>Hora: {rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  <span className={`font-black text-sm ${
                    mov.tipo_movimiento === 'INGRESO' ? 'text-[#16A34A]' :
                    mov.tipo_movimiento === 'EGRESO' ? 'text-[#DC2626]' :
                    'text-[#1F2937]'
                  }`}>
                    {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                    {mov.cantidad} {mov.productos?.unidad_medida}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        {recentMovements.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No hay movimientos recientes registrados.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-[#6B7280] border-b border-slate-100">
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Operación</th>
                <th className="p-4 font-bold text-right">Cant.</th>
                <th className="p-4 font-bold">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentMovements.map(mov => {
                const rawDate = mov.fecha || mov.created_at
                return (
                  <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-[#1F2937]">{mov.productos?.nombre}</p>
                      <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                        {mov.productos?.categorias?.nombre} {mov.sedes?.nombre ? `• ${mov.sedes.nombre}` : ''}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-[#16A34A]' :
                        mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-100 text-[#DC2626]' :
                        'bg-amber-100 text-[#A16207]'
                      }`}>
                        {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={13} />}
                        {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={13} />}
                        <span>{mov.tipo_movimiento}</span>
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-black text-right ${
                        mov.tipo_movimiento === 'INGRESO' ? 'text-[#16A34A]' :
                        mov.tipo_movimiento === 'EGRESO' ? 'text-[#DC2626]' :
                        'text-[#1F2937]'
                      }`}>
                      {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                      {mov.cantidad} <span className="text-[10px] font-normal text-[#6B7280]">{mov.productos?.unidad_medida}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-[#6B7280]">
                      {rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
