import React from 'react'

export const AnimatedBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
    <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-indigo-300 to-purple-300 blur-3xl opacity-30 animate-float mix-blend-multiply"></div>
    <div className="absolute bottom-[5%] right-[5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-emerald-300 to-teal-200 blur-3xl opacity-30 animate-float-reverse mix-blend-multiply"></div>
    <div 
      className="absolute top-[35%] left-[60%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-gradient-to-tr from-sky-300 to-blue-300 blur-3xl opacity-20 animate-float mix-blend-multiply" 
      style={{ animationDelay: '-7s' }}
    ></div>
  </div>
)
