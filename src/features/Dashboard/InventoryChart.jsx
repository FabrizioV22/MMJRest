import React from 'react'
import { Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function InventoryChart({ chartData, filterArea, setFilterArea, availableAreas }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const uniqueDetails = Array.from(new Set(data.details)).slice(0, 5);
      return (
        <div className="bg-white p-3.5 rounded-xl shadow-xl border border-[#E9DFD9] text-sm">
          <p className="font-bold text-[#2C211F] mb-2">{label}</p>
          <div className="flex space-x-4 mb-2">
            <p className="text-[#15803D] font-bold">Ingresos: {data.ingresos}</p>
            <p className="text-[#B42318] font-bold">Egresos: {data.egresos}</p>
          </div>
          {uniqueDetails.length > 0 && (
            <div className="text-xs text-[#5D4B47] border-t border-[#E9DFD9] pt-2">
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
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl card-soft border border-[#E9DFD9]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="text-[#A80F14]" size={20} />
          <h3 className="text-base font-bold text-[#2C211F]">Flujo de Movimiento de Kardex</h3>
        </div>
        <select 
          value={filterArea} 
          aria-label="Filtrar por área"
          onChange={(e) => setFilterArea(e.target.value)}
          className="px-3 py-1.5 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl text-xs font-bold text-[#5D4B47] outline-none cursor-pointer focus:border-[#A80F14]"
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9DFD9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#877571', fontSize: 12, fontFamily: 'Karla'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#877571', fontSize: 12, fontFamily: 'Karla'}} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" name="Ingresos" dataKey="ingresos" stroke="#15803D" strokeWidth={2.5} dot={{ r: 4, fill: '#15803D' }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Egresos" dataKey="egresos" stroke="#B42318" strokeWidth={2.5} dot={{ r: 4, fill: '#B42318' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
