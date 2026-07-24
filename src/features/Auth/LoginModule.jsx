import React, { useState } from 'react'
import { Lock, Mail, Loader2, AlertCircle, UtensilsCrossed } from 'lucide-react'
import { authService } from '../../services/authService'
import { AnimatedBackground } from './AnimatedBackground'

export function LoginModule() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await authService.login(email, password)
    } catch (err) {
      setError('Credenciales inválidas o cuenta no registrada.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 font-sans" style={{ backgroundColor: '#FFFBEB' }}>
      
      {/* Soft warm decorative background elements */}
      <AnimatedBackground />

      <div className="w-full max-w-[420px] p-8 sm:p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_12px_40px_rgba(161,98,7,0.08)] border border-amber-200/60 z-10 animate-fade-in-up relative">
        <div className="text-center mb-8 pt-2 flex flex-col items-center">
          <div className="w-12 h-12 mb-3 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-inner border border-amber-200">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="font-display text-2xl font-black text-amber-950 tracking-wider">MAMA JULIA</h1>
          <p className="text-amber-700/70 text-sm mt-1 font-medium">Gestión Gastronómica Peruana</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 animate-fade-in">
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-rose-800 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-700 transition-colors" size={19} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mamajulia.com" 
                className="w-full pl-12 pr-4 py-3.5 bg-amber-50/40 border border-slate-200 rounded-2xl outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-700 transition-colors" size={19} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-3.5 bg-amber-50/40 border border-slate-200 rounded-2xl outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ backgroundColor: '#A16207' }}
            className="w-full py-4 mt-2 text-white rounded-2xl font-bold hover:bg-[#9A3412] flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-amber-100 pt-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acceso Restringido — Personal Autorizado</p>
        </div>
      </div>
    </div>
  )
}
