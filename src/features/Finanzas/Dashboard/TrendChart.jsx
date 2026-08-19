import React from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

export function TrendChart({ data, sedes }) {
  const fmt = (val) => `S/ ${Number(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

  const SEDE_COLORS = {
    'Lince': '#A80F14',
    'Pueblo Libre': '#D6A24A',
  }
  const FALLBACK_COLORS = ['#3A0F0F', '#15803D', '#2563EB', '#B45309']

  const activeSedes = sedes && sedes.length > 0 ? sedes.map(s => s.nombre) : ['Lince', 'Pueblo Libre']

  return (
    <div className="bg-white p-6 rounded-2xl card-soft border border-[#E9DFD9]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-rose-50 text-[#A80F14] border border-rose-100 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2C211F]">Evolución de Ganancias Mensuales</h3>
            <p className="text-xs text-[#5D4B47]">Comparativa histórica de ingresos netos por sede</p>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full">
        {(!data || data.length === 0) ? (
          <div className="flex justify-center items-center h-full text-[#877571] text-sm">
            No hay suficiente historial mensual registrado para graficar la tendencia.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                {activeSedes.map((sede, idx) => {
                  const color = SEDE_COLORS[sede] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
                  return (
                    <linearGradient key={sede} id={`colorGrad_${sede.replace(/\s+/g, '_')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9DFD9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#877571', fontSize: 12, fontFamily: 'Karla' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#877571', fontSize: 12, fontFamily: 'Karla' }} 
                tickFormatter={(v) => `S/ ${v}`}
              />
              <Tooltip 
                cursor={{ stroke: '#D8CBC5', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(val) => [fmt(val), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E9DFD9', boxShadow: '0 10px 15px -3px rgba(58, 15, 15, 0.08)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              
              {activeSedes.map((sede, idx) => {
                const color = SEDE_COLORS[sede] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
                return (
                  <Area 
                    key={sede}
                    type="monotone" 
                    dataKey={sede} 
                    name={sede} 
                    stroke={color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill={`url(#colorGrad_${sede.replace(/\s+/g, '_')})`} 
                  />
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
