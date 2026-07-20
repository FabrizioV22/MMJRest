import React, { useState } from 'react'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'
import { authService } from '../../services/authService'

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
      // App.jsx escuchará el cambio de sesión y actualizará la UI
    } catch (err) {
      setError('Credenciales inválidas o cuenta no registrada.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 font-sans">
      
      {/* Soft decorative background elements (Minimal & Professional + Floating) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-indigo-200/30 blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-emerald-200/20 blur-3xl opacity-50 animate-float-reverse"></div>
        <div className="absolute top-[40%] right-[30%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-sky-200/20 blur-3xl opacity-40 animate-float" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="w-full max-w-[420px] p-8 sm:p-10 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 z-10 animate-fade-in-up relative">
        <div className="text-center mb-10 pt-2">
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-wider">MAMA JULIA</h1>
          <p className="text-slate-400 text-sm mt-2">Acceso al Sistema de Gestión</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 animate-fade-in">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-red-800 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mamajulia.com" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-800/5 transition-all text-slate-800 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-700 transition-colors" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-800/5 transition-all text-slate-800 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-colors"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-10 text-center border-t border-slate-100 pt-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solo Personal Autorizado</p>
        </div>
      </div>
    </div>
  )
}
