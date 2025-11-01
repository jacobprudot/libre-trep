import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDNI(dni: string): string {
  // Format: 0801-1990-12345
  const cleaned = dni.replace(/\D/g, '')
  if (cleaned.length !== 13) return dni
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`
}

export function normalizeDNI(dni: string): string {
  // Remove all non-digits
  return dni.replace(/\D/g, '')
}

export function validateDNI(dni: string): boolean {
  const normalized = normalizeDNI(dni)
  return /^\d{13}$/.test(normalized)
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return /^\d{8}$/.test(cleaned)
}

export function validateQRCode(qrCode: string): boolean {
  return /^[A-Za-z0-9\-_]{10,100}$/.test(qrCode)
}

export function validateGPSHonduras(lat: number, lng: number): boolean {
  // Honduras bounds: 13.0-16.5° N, -89.5 to -83.0° W
  return lat >= 13.0 && lat <= 16.5 && lng >= -89.5 && lng <= -83.0
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula for distance in meters
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-HN').format(num)
}
