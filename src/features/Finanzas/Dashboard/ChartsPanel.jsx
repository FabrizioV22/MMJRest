import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, PieChart as PieIcon } from 'lucide-react'
import { TrendChart } from './TrendChart'
import { PaymentTrendChart } from './PaymentTrendChart'

export function ChartsPanel({ chartSedesData, monthlyTrendData, paymentMethodsData, paymentMethodsTrendData, sedes }) {
  return (
    <div className="space-y-6">
      {/* 1. EVOLUCIÓN MENSUAL DE GANANCIAS (FULL WIDTH) */}
      <TrendChart data={monthlyTrendData} sedes={sedes} />

      {/* 2. COMPARATIVA DIARIA Y DISTRIBUCIÓN GLOBAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparativa Diaria de Sedes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl card-soft border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="text-emerald-500" size={20} />
            <h3 className="text-base font-bold text-slate-700">Comparativa Diaria de Sedes (Ingresos)</h3>
          </div>
          
          <div className="h-[300px] w-full">
            {chartSedesData.length === 0 ? (
              <div className="flex justify-center items-center h-full text-slate-400">No hay datos suficientes para graficar.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSedesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Karla'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Karla'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(val) => `S/ ${Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Lince" name="Lince" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Pueblo Libre" name="Pueblo Libre" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribución Global de Medios de Pago */}
        <div className="bg-white p-6 rounded-2xl card-soft border border-slate-100 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <PieIcon className="text-indigo-500" size={20} />
            <h3 className="text-base font-bold text-slate-700">Distribución de Medios</h3>
          </div>
          
          <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
            {paymentMethodsData.length === 0 ? (
              <div className="text-slate-400 text-sm">Sin datos registrados.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `S/ ${Number(value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {paymentMethodsData.length > 0 && (
            <div className="mt-4 space-y-2">
              {paymentMethodsData.sort((a,b) => b.value - a.value).map((entry, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-slate-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 tabular-nums">
                    S/ {Number(entry.value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. TENDENCIA DE MÉTODOS DE PAGO (FULL WIDTH) */}
      <PaymentTrendChart data={paymentMethodsTrendData} />
    </div>
  )
}
