import React, { useState, useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { CreditCard } from 'lucide-react'

export function PaymentTrendChart({ data }) {
  const [mode, setMode] = useState('amount') // 'amount' | 'percent'

  const PAYMENT_COLORS = {
    'Efectivo': '#15803D',
    'Yape': '#7C3AED',
    'Plin': '#0D9488',
    'Visa': '#2563EB',
    'Transferencia': '#D6A24A'
  }

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []
    if (mode === 'amount') return data

    return data.map(item => {
      const total = item.total || 1
      return {
        ...item,
        Efectivo: Number(((item.Efectivo || 0) / total * 100).toFixed(1)),
        Yape: Number(((item.Yape || 0) / total * 100).toFixed(1)),
        Plin: Number(((item.Plin || 0) / total * 100).toFixed(1)),
        Visa: Number(((item.Visa || 0) / total * 100).toFixed(1)),
        Transferencia: Number(((item.Transferencia || 0) / total * 100).toFixed(1)),
      }
    })
  }, [data, mode])

  const fmt = (val) => mode === 'percent' 
    ? `${val}%` 
    : `S/ ${Number(val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl card-soft border border-[#E9DFD9] min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#FFF9F0] text-[#D6A24A] border border-[#E7C77A] rounded-xl">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#2C211F]">Evolución de Métodos de Pago</h3>
            <p className="text-[11px] sm:text-xs text-[#5D4B47]">Tendencia mensual de recaudación por canal de cobro</p>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="inline-flex p-1 bg-[#FAF7F4] border border-[#E9DFD9] rounded-xl text-xs font-bold text-[#5D4B47] self-start sm:self-auto">
          <button
            onClick={() => setMode('amount')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${mode === 'amount' ? 'bg-white text-[#2C211F] shadow-sm font-bold' : 'hover:text-[#2C211F]'}`}
          >
            Monto (S/)
          </button>
          <button
            onClick={() => setMode('percent')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${mode === 'percent' ? 'bg-white text-[#2C211F] shadow-sm font-bold' : 'hover:text-[#2C211F]'}`}
          >
            Porcentaje (%)
          </button>
        </div>
      </div>

      <div className="h-[280px] sm:h-[300px] w-full min-w-0">
        {(!processedData || processedData.length === 0) ? (
          <div className="flex justify-center items-center h-full text-[#877571] text-xs sm:text-sm">
            No hay datos suficientes de métodos de pago en el tiempo.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9DFD9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#877571', fontSize: 11, fontFamily: 'Karla' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#877571', fontSize: 11, fontFamily: 'Karla' }} 
                tickFormatter={(v) => mode === 'percent' ? `${v}%` : `S/ ${v}`}
              />
              <Tooltip 
                cursor={{ stroke: '#D8CBC5', strokeWidth: 1 }}
                formatter={(val, name) => [fmt(val), name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E9DFD9', boxShadow: '0 10px 15px -3px rgba(58, 15, 15, 0.08)', fontSize: '12px' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
              {Object.entries(PAYMENT_COLORS).map(([metodo, color]) => (
                <Area 
                  key={metodo}
                  type="monotone" 
                  dataKey={metodo} 
                  name={metodo} 
                  stackId="1" 
                  stroke={color} 
                  fill={color} 
                  fillOpacity={0.8} 
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
