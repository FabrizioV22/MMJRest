import React from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export function Toast({ id, type = 'info', message, onClose }) {
  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-600 shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-600 shrink-0" />,
    info: <Info size={18} className="text-amber-700 shrink-0" />
  }

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    warning: 'bg-amber-50 border-amber-200 text-amber-950',
    error: 'bg-rose-50 border-rose-200 text-rose-950',
    info: 'bg-amber-50/80 border-amber-200 text-amber-950'
  }

  return (
    <div className={`flex items-center justify-between space-x-3 p-3.5 px-4 rounded-2xl border shadow-lg max-w-md w-full animate-slide-right transition-all text-sm font-medium ${styles[type] || styles.info}`}>
      <div className="flex items-center space-x-2.5 min-w-0">
        {icons[type] || icons.info}
        <span className="truncate">{message}</span>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  )
}
