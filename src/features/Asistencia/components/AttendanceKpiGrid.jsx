import React from 'react'
import { Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export function AttendanceKpiGrid({ stats = { programados: 0, aTiempo: 0, tardanzas: 0, sinMarcar: 0 } }) {
  const cards = [
    {
      title: 'Programados Hoy',
      value: stats.programados,
      icon: Users,
      color: 'text-[#2C211F]',
      bgIcon: 'bg-[#FAF7F4]',
      borderColor: 'border-[#E9DFD9]',
      description: 'Personal en turno activo'
    },
    {
      title: 'A Tiempo',
      value: stats.aTiempo,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgIcon: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Puntualidad en ingreso'
    },
    {
      title: 'Tardanzas',
      value: stats.tardanzas,
      icon: Clock,
      color: 'text-amber-700',
      bgIcon: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Ingresos con retraso'
    },
    {
      title: 'Sin Marcar',
      value: stats.sinMarcar,
      icon: AlertCircle,
      color: 'text-rose-700',
      bgIcon: 'bg-rose-50',
      borderColor: 'border-rose-200',
      description: 'Pendientes de registrar'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl p-4 md:p-5 border ${card.borderColor} shadow-xs flex flex-col justify-between transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5D4B47] uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`p-2.5 rounded-xl ${card.bgIcon}`}>
              <card.icon className={card.color} size={20} />
            </div>
          </div>

          <div className="mt-3">
            <div className={`text-2xl md:text-3xl font-black ${card.color} font-display`}>
              {card.value}
            </div>
            <p className="text-[11px] text-[#877571] font-medium mt-0.5">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
