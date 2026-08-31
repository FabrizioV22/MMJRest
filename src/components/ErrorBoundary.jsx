import React, { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary atrapó un error no controlado:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[360px] flex items-center justify-center p-6 bg-white rounded-3xl card-soft border border-[#E9DFD9] shadow-sm my-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-[#A80F14] border border-rose-200 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2C211F]">
                {this.props.moduleName ? `Ocurrió un problema en ${this.props.moduleName}` : 'Ocurrió un problema inesperado'}
              </h3>
              <p className="text-xs text-[#5D4B47] mt-1 leading-relaxed">
                El módulo no pudo cargarse correctamente. Puedes intentar recargarlo o volver a la pantalla de inicio.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-[#FAF7F4] p-3 rounded-xl border border-[#D8CBC5] text-[11px] text-[#5D4B47] overflow-x-auto">
                <summary className="font-bold text-[#A80F14] cursor-pointer outline-none">
                  Ver detalle técnico del error
                </summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[10px] text-rose-900">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#A80F14] hover:bg-[#7F0C10] text-[#FFF9F0] rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5"
              >
                <RefreshCw size={14} />
                <span>Reintentar</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 py-2.5 px-4 bg-[#FAF7F4] hover:bg-[#F3ECE8] text-[#5D4B47] border border-[#D8CBC5] rounded-xl font-semibold text-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5"
              >
                <Home size={14} className="text-[#A80F14]" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
