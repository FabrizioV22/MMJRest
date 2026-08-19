import React, { useState } from 'react'
import { Lock, Mail, Loader2, AlertCircle, Sparkles, ChefHat } from 'lucide-react'
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
    } catch (err) {
      setError('Credenciales inválidas o cuenta no registrada.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans overflow-hidden" style={{ backgroundColor: '#FAF7F4' }}>
      
      {/* Background Decorativo Cálido y Gastronómico */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-[#A80F14]/5 blur-3xl"></div>
        <div className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-[#D6A24A]/10 blur-3xl"></div>
      </div>

      {/* Contenedor Principal Split-Screen / Card */}
      <div className="w-full max-w-4xl mx-4 my-8 bg-white rounded-3xl shadow-xl border border-[#E9DFD9] overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10 animate-fade-in-up">
        
        {/* Columna Izquierda: Hero de Marca Mama Julia (Desktop) */}
        <div className="hidden md:flex md:col-span-5 bg-[#211716] p-8 lg:p-10 flex-col justify-between relative overflow-hidden text-white border-r border-[#3A0F0F]">
          {/* Acento visual superior */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#A80F14]/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D6A24A]/15 rounded-full blur-2xl pointer-events-none"></div>

          {/* Logo y Encabezado de Marca */}
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#3A0F0F] border border-[#D6A24A]/50 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <span className="font-display font-black text-2xl text-[#E7C77A]">MJ</span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-wider text-[#FFF9F0] leading-tight">
              MAMA JULIA
            </h1>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#D6A24A] mt-1.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#D6A24A]" />
              Sabor & Tradición
            </p>
          </div>

          {/* Frase Tradicional & Detalle Gastronómico */}
          <div className="relative z-10 my-8 py-6 border-y border-[#3A0F0F]/80">
            <p className="text-sm font-medium italic text-[#F8EEDF] leading-relaxed">
              “Sabor que nos une, tradición que nos representa.”
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#D8CBC5]">
              <ChefHat size={16} className="text-[#D6A24A]" />
              <span>Control Operativo & ERP Gastronómico</span>
            </div>
          </div>

          {/* Footer del Hero */}
          <div className="relative z-10 text-[11px] text-[#877571]">
            <p>© {new Date().getFullYear()} Mama Julia. Sedes Lince & Pueblo Libre.</p>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Autenticación */}
        <div className="col-span-1 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          
          {/* Header Móvil de Marca */}
          <div className="md:hidden text-center mb-6">
            <div className="inline-flex w-12 h-12 bg-[#3A0F0F] border border-[#D6A24A]/40 rounded-2xl items-center justify-center shadow-md mb-2">
              <span className="font-display font-black text-xl text-[#E7C77A]">MJ</span>
            </div>
            <h1 className="font-display text-2xl font-black text-[#2C211F] tracking-wider">MAMA JULIA</h1>
            <p className="text-xs text-[#877571] font-medium mt-0.5">Gestión Gastronómica</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2C211F]">Iniciar Sesión</h2>
            <p className="text-sm text-[#5D4B47] mt-1">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 animate-fade-in">
              <AlertCircle className="text-[#B42318] shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium text-[#B42318] leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#877571] group-focus-within:text-[#A80F14] transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@mamajulia.com" 
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none focus:border-[#A80F14] focus:bg-white focus:ring-4 focus:ring-[#A80F14]/10 transition-all text-[#2C211F] text-sm font-medium placeholder:text-[#877571]"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5D4B47] uppercase tracking-wider">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#877571] group-focus-within:text-[#A80F14] transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F4] border border-[#D8CBC5] rounded-xl outline-none focus:border-[#A80F14] focus:bg-white focus:ring-4 focus:ring-[#A80F14]/10 transition-all text-[#2C211F] text-sm font-medium placeholder:text-[#877571]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold flex justify-center items-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" size={19} /> : 'Ingresar al Sistema'}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-[#E9DFD9] pt-4">
            <p className="text-[11px] font-bold text-[#877571] uppercase tracking-wider">
              Acceso Restringido — Personal Autorizado
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
