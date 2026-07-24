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
    <div className="bg-white rounded-2xl card-soft border border-slate-100 overflow-hidden mt-6">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Clock className="text-slate-400" size={18} />
          <h3 className="font-bold text-slate-700 text-sm">Auditoría Histórica de Cierres</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">{turnos.length} registros</span>
        </div>
        
        {turnos.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
          >
            <Download size={14} className="text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        {turnos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No hay cierres de caja en este rango.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
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
            <tbody className="divide-y divide-slate-50">
              {turnos.map(turno => {
                const diff = Number(turno.diferencia || 0)
                const isAnulada = turno.estado === 'ANULADA'
                const flows = turnoFlowsMap[turno.id] || { ingresos: 0, egresos: 0 }
                
                return (
                  <tr key={turno.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-600">
                      {new Date(turno.fecha_cierre).toLocaleString('es-PE', { 
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-800">
                      {turno.sedes?.nombre}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {turno.usuarios?.nombre_completo}
                    </td>
                    <td className="p-4 text-sm text-right tabular-nums text-slate-500">
                      {fmt(turno.monto_apertura)}
                    </td>
                    <td className="p-4 text-sm text-right tabular-nums text-emerald-600 font-bold">
                      S/ {fmt(flows.ingresos)}
                    </td>
                    <td className="p-4 text-sm text-right tabular-nums text-rose-500 font-bold">
                      S/ {fmt(flows.egresos)}
                    </td>
                    <td className="p-4 text-sm font-bold text-right tabular-nums text-slate-900">
                      S/ {fmt(turno.monto_cierre_real)}
                    </td>
                    <td className={`p-4 text-sm font-black text-right tabular-nums ${
                      diff === 0 ? 'text-emerald-500' : diff > 0 ? 'text-blue-500' : 'text-red-500'
                    }`}>
                      {diff > 0 ? '+' : ''}S/ {fmt(diff)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isAnulada 
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-emerald-100 text-emerald-700'
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
