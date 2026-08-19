import React from 'react'
import { Clock, CheckCircle, XCircle, Download } from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function HistoryTable({ turnos, turnoFlowsMap = {} }) {

  const handleExportCSV = () => {
    if (!turnos || turnos.length === 0) return

    const headers = [
      'Fecha Cierre',
      'Sede',
      'Responsable',
      'Apertura (S/)',
      'Ingresos (S/)',
      'Egresos (S/)',
      'Físico Real (S/)',
      'Diferencia (S/)',
      'Estado'
    ]

    const rows = turnos.map(t => {
      const flows = turnoFlowsMap[t.id] || { ingresos: 0, egresos: 0 }
      const fecha = new Date(t.fecha_cierre).toLocaleString('es-PE')
      const sede = `"${t.sedes?.nombre || ''}"`
      const usuario = `"${t.usuarios?.nombre_completo || ''}"`
      
      return [
        fecha,
        sede,
        usuario,
        t.monto_apertura || 0,
        flows.ingresos || 0,
        flows.egresos || 0,
        t.monto_cierre_real || 0,
        t.diferencia || 0,
        t.estado
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `auditoria_cierres_caja_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-2xl card-soft border border-[#E9DFD9] overflow-hidden mt-6">
      <div className="p-5 border-b border-[#E9DFD9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F4]">
        <div className="flex items-center space-x-2">
          <Clock className="text-[#A80F14]" size={18} />
          <h3 className="font-bold text-[#2C211F] text-sm">Auditoría Histórica de Cierres</h3>
          <span className="text-xs font-bold text-[#3A0F0F] bg-[#F8EEDF] px-2.5 py-0.5 rounded-full border border-[#E7C77A]">{turnos.length} cierres</span>
        </div>
        
        {turnos.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-[#D8CBC5] hover:bg-[#FAF7F4] hover:border-[#A80F14] rounded-xl text-xs font-bold text-[#2C211F] shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Download size={14} className="text-[#A80F14]" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>
      
      {/* Mobile View: Card list */}
      <div className="md:hidden divide-y divide-[#E9DFD9]">
        {turnos.length === 0 ? (
          <div className="p-8 text-center text-[#877571] text-sm">No hay cierres de caja registrados en este rango.</div>
        ) : (
          turnos.map(turno => {
            const diff = Number(turno.diferencia || 0)
            const isAnulada = turno.estado === 'ANULADA'
            const flows = turnoFlowsMap[turno.id] || { ingresos: 0, egresos: 0 }

            return (
              <div key={turno.id} className="p-4 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-[#2C211F]">{turno.sedes?.nombre}</span>
                    <p className="text-xs text-[#5D4B47] font-medium">
                      {new Date(turno.fecha_cierre).toLocaleString('es-PE', { 
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-[11px] text-[#877571] mt-0.5">{turno.usuarios?.nombre_completo}</p>
                  </div>

                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    isAnulada ? 'bg-[#FAF7F4] text-[#877571] border border-[#D8CBC5]' : 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                  }`}>
                    {isAnulada ? <XCircle size={13} /> : <CheckCircle size={13} />}
                    <span>{turno.estado}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F4] p-2.5 rounded-xl border border-[#E9DFD9]">
                  <div>
                    <span className="text-[10px] text-[#877571] font-bold block uppercase">Ingresos</span>
                    <span className="font-bold text-[#15803D]">S/ {fmt(flows.ingresos)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#877571] font-bold block uppercase">Egresos</span>
                    <span className="font-bold text-[#B42318]">S/ {fmt(flows.egresos)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#877571] font-bold block uppercase">Físico Real</span>
                    <span className="font-black text-[#2C211F]">S/ {fmt(turno.monto_cierre_real)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#877571] font-bold block uppercase">Descuadre</span>
                    <span className={`font-black ${diff === 0 ? 'text-[#15803D]' : diff > 0 ? 'text-[#B45309]' : 'text-[#B42318]'}`}>
                      {diff > 0 ? '+' : ''}S/ {fmt(diff)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        {turnos.length === 0 ? (
          <div className="p-12 text-center text-[#877571] text-sm">No hay cierres de caja en este rango.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#FAF7F4] text-[11px] uppercase tracking-wider text-[#5D4B47] border-b border-[#E9DFD9]">
                <th className="p-4 font-bold">Fecha Cierre</th>
                <th className="p-4 font-bold">Sede</th>
                <th className="p-4 font-bold">Responsable</th>
                <th className="p-4 font-bold text-right">Apertura</th>
                <th className="p-4 font-bold text-right">Ingresos</th>
                <th className="p-4 font-bold text-right">Egresos</th>
                <th className="p-4 font-bold text-right">Físico</th>
                <th className="p-4 font-bold text-right">Diferencia</th>
                <th className="p-4 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DFD9]/60">
              {turnos.map(turno => {
                const diff = Number(turno.diferencia || 0)
                const isAnulada = turno.estado === 'ANULADA'
                const flows = turnoFlowsMap[turno.id] || { ingresos: 0, egresos: 0 }
                
                return (
                  <tr key={turno.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                    <td className="p-4 text-sm font-medium text-[#5D4B47]">
                      {new Date(turno.fecha_cierre).toLocaleString('es-PE', { 
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="p-4 text-sm font-bold text-[#2C211F]">
                      {turno.sedes?.nombre}
                    </td>
                    <td className="p-4 text-xs font-medium text-[#5D4B47]">
                      {turno.usuarios?.nombre_completo}
                    </td>
                    <td className="p-4 text-sm text-right tabular-nums text-[#877571]">
                      {fmt(turno.monto_apertura)}
                    </td>
                    <td className="p-4 text-sm text-right tabular-nums text-[#15803D] font-bold">
                      S/ {fmt(flows.ingresos)}
                    </td>
                    <td className="p-4 text-sm text-right tabular-nums text-[#B42318] font-bold">
                      S/ {fmt(flows.egresos)}
                    </td>
                    <td className="p-4 text-sm font-bold text-right tabular-nums text-[#2C211F]">
                      S/ {fmt(turno.monto_cierre_real)}
                    </td>
                    <td className={`p-4 text-sm font-black text-right tabular-nums ${
                      diff === 0 ? 'text-[#15803D]' : diff > 0 ? 'text-[#B45309]' : 'text-[#B42318]'
                    }`}>
                      {diff > 0 ? '+' : ''}S/ {fmt(diff)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isAnulada 
                          ? 'bg-[#FAF7F4] text-[#877571] border border-[#D8CBC5]'
                          : 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                      }`}>
                        {isAnulada ? <XCircle size={13} /> : <CheckCircle size={13} />}
                        <span>{turno.estado}</span>
                      </span>
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
