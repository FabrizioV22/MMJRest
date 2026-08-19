/**
 * Utilidades de Geolocalización y Geocercas para Control de Asistencia
 */

/**
 * Calcula la distancia en metros entre dos coordenadas geográficas mediante la fórmula de Haversine
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null

  const R = 6371000 // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Redondeado a 2 decimales
}

/**
 * Obtiene la posición GPS actual del navegador en forma de Promesa
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La geolocalización no está soportada por este navegador o dispositivo.'))
      return
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        let msg = 'Error obteniendo ubicación GPS.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Permiso de ubicación denegado. Habilita el GPS en tu navegador para continuar.'
            break
          case error.POSITION_UNAVAILABLE:
            msg = 'Ubicación no disponible. Verifica que tu GPS esté activado.'
            break
          case error.TIMEOUT:
            msg = 'Tiempo de espera agotado para obtener ubicación GPS.'
            break
          default:
            msg = error.message || msg
        }
        reject(new Error(msg))
      },
      defaultOptions
    )
  })
}
