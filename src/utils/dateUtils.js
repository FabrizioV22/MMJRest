/**
 * Utilidades de Fecha y Hora con soporte estricto de Zona Horaria Perú (America/Lima)
 */

/**
 * Obtiene la fecha en formato 'YYYY-MM-DD' en la zona horaria de Perú (America/Lima)
 * @param {Date|string} [date=new Date()]
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function getLimaDateString(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : (date || new Date())
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)
}

/**
 * Obtiene el día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado) en la zona horaria de Perú
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {number} 0 a 6
 */
export function getLimaDayOfWeek(dateString) {
  if (!dateString) return new Date().getDay()
  const [year, month, day] = dateString.split('-').map(Number)
  // Se evalúa a mediodía local para evitar cualquier salto de fecha por desfasaje UTC
  const d = new Date(year, month - 1, day, 12, 0, 0)
  return d.getDay()
}

/**
 * Formatea una hora ISO en formato legible 12h/24h en hora de Perú
 * @param {string|Date} isoString 
 * @returns {string} ej. '08:25 AM' o '08:25'
 */
export function formatLimaTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit'
  })
}
