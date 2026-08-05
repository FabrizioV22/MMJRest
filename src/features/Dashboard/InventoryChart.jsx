import React from 'react'
import { Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function InventoryChart({ chartData, filterArea, setFilterArea, availableAreas }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const uniqueDetails = Array.from(new Set(data.details)).slice(0, 5);
      return (
        <div className="bg-white p-3.5 rounded-xl shadow-xl border border-slate-100 text-sm">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          <div className="flex space-x-4 mb-2">
            <p className="text-[#16A34A] font-bold">Ingresos: {data.ingresos}</p>
            <p className="text-[#DC2626] font-bold">Egresos: {data.egresos}</p>
          </div>
          {uniqueDetails.length > 0 && (
            <div className="text-xs text-slate-500 border-t border-slate-100 pt-2">
              <p className="font-semibold mb-1">Movimientos destacados:</p>
              <ul className="space-y-1">
                {uniqueDetails.map((det, i) => (
                  <li key={i}>{det}</li>
                ))}
                {data.details.length > 5 && <li>... y más</li>}
              </ul>
            </div>
          )}
        </div>
      )
    }
    return null;
  }

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl card-soft border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="text-[#A16207]" size={20} />
          <h3 className="text-base font-bold text-[#1F2937]">Flujo de Movimiento de Kardex</h3>
        </div>
        <select 
          value={filterArea} 
          aria-label="Filtrar por área"
          onChange={(e) => setFilterArea(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
        >
          <option value="ALL">Todas las Áreas</option>
          {availableAreas.map(area => (
            <option key={area.id} value={area.id}>{area.nombre}</option>
          ))}
        </select>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontFamily: 'Karla'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontFamily: 'Karla'}} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" name="Ingresos" dataKey="ingresos" stroke="#16A34A" strokeWidth={2.5} dot={{ r: 4, fill: '#16A34A' }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Egresos" dataKey="egresos" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 4, fill: '#DC2626' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
