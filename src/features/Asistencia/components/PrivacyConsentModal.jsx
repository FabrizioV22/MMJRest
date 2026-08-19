import React, { useState } from 'react'
import { ShieldCheck, MapPin, CheckCircle, AlertTriangle, X } from 'lucide-react'

export function PrivacyConsentModal({ isOpen, onAccept, onDecline, isSubmitting = false }) {
  const [hasAgreed, setHasAgreed] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full shadow-2xl border border-[#E9DFD9] animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 h-[88dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Fijo */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E9DFD9] shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-50 text-[#A80F14] rounded-xl shrink-0 border border-rose-200">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2C211F] leading-tight">
                Consentimiento de Geolocalización
              </h3>
              <p className="text-[11px] text-[#877571] mt-0.5">Conforme a la Ley N° 29733 (Protección de Datos Personales en Perú)</p>
            </div>
          </div>
          <button
            onClick={onDecline}
            className="p-2 text-[#877571] hover:bg-[#FAF7F4] rounded-full cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs text-[#5D4B47] leading-relaxed overscroll-contain">
          <div className="p-3.5 bg-[#FAF7F4] rounded-2xl border border-[#E9DFD9] space-y-3">
            <div className="flex items-start space-x-2.5">
              <MapPin size={16} className="text-[#A80F14] shrink-0 mt-0.5" />
              <p>
                <strong>Captura Puntual Exclusiva:</strong> La geolocalización solo se consultará en el instante exacto en que presiones el botón de registrar asistencia (ingreso, refrigerio o salida).
              </p>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>Prohibición de Rastreo Continuo:</strong> El sistema <u>NO realiza</u> seguimiento en tiempo real ni en segundo plano fuera del momento de la marcación.
              </p>
            </div>
            <div className="flex items-start space-x-2.5">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Alternativa en Local:</strong> Si no deseas usar el GPS de tu dispositivo personal, puedes marcar tu asistencia ingresando desde la tablet o computadora del restaurante.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#877571]">
            Al marcar la casilla, autorizas a <strong>Restaurante Mama Julia</strong> a validar que te encuentras en el perímetro del local de trabajo para el control de asistencia y cómputo de horas laboradas.
          </p>
        </div>

        {/* Footer Fijo con Checkbox y Botones */}
        <div className="p-4 sm:p-5 border-t border-[#E9DFD9] shrink-0 bg-white space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer p-2.5 bg-[#FAF7F4] hover:bg-gray-100 rounded-xl select-none border border-[#E9DFD9]">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-4 h-4 text-[#A80F14] rounded border-[#D8CBC5] focus:ring-[#A80F14] cursor-pointer accent-[#A80F14] shrink-0"
            />
            <span className="text-xs font-bold text-[#2C211F]">
              He leído y acepto los términos de geolocalización laboral
            </span>
          </label>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onDecline}
              disabled={isSubmitting}
              className="flex-1 py-3 text-xs font-semibold text-[#5D4B47] hover:bg-[#FAF7F4] rounded-xl border border-[#D8CBC5] cursor-pointer transition-colors"
            >
              No por ahora
            </button>
            <button
              onClick={onAccept}
              disabled={!hasAgreed || isSubmitting}
              className="flex-1 py-3 text-xs font-bold text-white bg-[#A80F14] hover:bg-[#7F0C10] disabled:opacity-40 rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck size={16} />
              <span>{isSubmitting ? 'Guardando...' : 'Aceptar y Continuar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
