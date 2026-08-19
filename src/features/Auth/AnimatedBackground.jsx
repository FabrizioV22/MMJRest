import React from 'react'

export const AnimatedBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
    {/* Warm Terracotta Glow */}
    <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-amber-400/40 to-orange-400/30 blur-3xl opacity-35 animate-float"></div>
    {/* Golden Amber Glow */}
    <div className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-amber-500/30 to-yellow-400/25 blur-3xl opacity-35 animate-float-reverse"></div>
    {/* Terracotta Deep Accent */}
    <div 
      className="absolute top-[35%] left-[60%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-gradient-to-tr from-orange-500/30 to-amber-300/20 blur-3xl opacity-25 animate-float" 
      style={{ animationDelay: '-7s' }}
    ></div>
  </div>
)
