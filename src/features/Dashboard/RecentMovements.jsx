import React from 'react'
import { Clock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

export function RecentMovements({ recentMovements }) {
  return (
    <div className="bg-white rounded-2xl card-soft border border-[#E9DFD9] overflow-hidden mt-6">
      <div className="p-5 border-b border-[#E9DFD9] flex items-center space-x-2 bg-[#FAF7F4]">
        <Clock className="text-[#877571]" size={18} />
        <h3 className="font-bold text-[#2C211F] text-sm">Actividad Reciente en Kardex</h3>
      </div>
      
      {/* Mobile View: Cards */}
      <div className="md:hidden divide-y divide-[#E9DFD9]">
        {recentMovements.length === 0 ? (
          <div className="p-8 text-center text-[#877571] text-sm">No hay movimientos recientes.</div>
        ) : (
          recentMovements.map(mov => {
            const rawDate = mov.fecha || mov.created_at
            return (
              <div key={mov.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm text-[#2C211F]">{mov.productos?.nombre}</p>
                    <p className="text-[10px] text-[#877571] font-bold uppercase tracking-wider">
                      {mov.productos?.categorias?.nombre} {mov.sedes?.nombre ? `• ${mov.sedes.nombre}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-50 text-[#15803D] border border-emerald-200' :
                    mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-50 text-[#B42318] border border-rose-200' :
                    'bg-amber-50 text-[#B45309] border border-amber-200'
                  }`}>
                    {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={12} />}
                    {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={12} />}
                    <span>{mov.tipo_movimiento}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#5D4B47] pt-1">
                  <span>Hora: {rawDate ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  <span className={`font-black text-sm ${
                    mov.tipo_movimiento === 'INGRESO' ? 'text-[#15803D]' :
                    mov.tipo_movimiento === 'EGRESO' ? 'text-[#B42318]' :
                    'text-[#2C211F]'
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
          <div className="p-12 text-center text-[#877571] text-sm">No hay movimientos recientes registrados.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF7F4] text-[11px] uppercase tracking-wider text-[#5D4B47] border-b border-[#E9DFD9]">
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Operación</th>
                <th className="p-4 font-bold text-right">Cant.</th>
                <th className="p-4 font-bold">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DFD9]/60">
              {recentMovements.map(mov => {
                const rawDate = mov.fecha || mov.created_at
                return (
                  <tr key={mov.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-[#2C211F]">{mov.productos?.nombre}</p>
                      <p className="text-[10px] text-[#877571] font-medium uppercase tracking-wider">
                        {mov.productos?.categorias?.nombre} {mov.sedes?.nombre ? `• ${mov.sedes.nombre}` : ''}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        mov.tipo_movimiento === 'INGRESO' ? 'bg-emerald-50 text-[#15803D] border border-emerald-200' :
                        mov.tipo_movimiento === 'EGRESO' ? 'bg-rose-50 text-[#B42318] border border-rose-200' :
                        'bg-amber-50 text-[#B45309] border border-amber-200'
                      }`}>
                        {mov.tipo_movimiento === 'INGRESO' && <ArrowDownCircle size={13} />}
                        {mov.tipo_movimiento === 'EGRESO' && <ArrowUpCircle size={13} />}
                        <span>{mov.tipo_movimiento}</span>
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-black text-right ${
                        mov.tipo_movimiento === 'INGRESO' ? 'text-[#15803D]' :
                        mov.tipo_movimiento === 'EGRESO' ? 'text-[#B42318]' :
                        'text-[#2C211F]'
                      }`}>
                      {mov.tipo_movimiento === 'INGRESO' ? '+' : mov.tipo_movimiento === 'EGRESO' ? '-' : ''}
                      {mov.cantidad} <span className="text-[10px] font-normal text-[#877571]">{mov.productos?.unidad_medida}</span>
                    </td>
                    <td className="p-4 text-sm font-medium text-[#5D4B47]">
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
