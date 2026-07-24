import React, { useState, useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { CreditCard } from 'lucide-react'

export function PaymentTrendChart({ data }) {
  const [mode, setMode] = useState('amount') // 'amount' | 'percent'

  const PAYMENT_COLORS = {
    'Efectivo': '#10B981',
    'Yape': '#8B5CF6',
    'Plin': '#14B8A6',
    'Visa': '#3B82F6',
    'Transferencia': '#6366F1'
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
    <div className="bg-white p-6 rounded-2xl card-soft border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Evolución de Métodos de Pago</h3>
            <p className="text-xs text-slate-400">Tendencia mensual de recaudación por canal de cobro</p>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
          <button
            onClick={() => setMode('amount')}
            className={`px-3 py-1 rounded-lg transition-all ${mode === 'amount' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
          >
            Monto (S/)
          </button>
          <button
            onClick={() => setMode('percent')}
            className={`px-3 py-1 rounded-lg transition-all ${mode === 'percent' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
          >
            Porcentaje (%)
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {(!processedData || processedData.length === 0) ? (
          <div className="flex justify-center items-center h-full text-slate-400 text-sm">
            No hay datos suficientes de métodos de pago en el tiempo.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Karla' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Karla' }} 
                tickFormatter={(v) => mode === 'percent' ? `${v}%` : `S/ ${v}`}
              />
              <Tooltip 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                formatter={(val, name) => [fmt(val), name]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
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
