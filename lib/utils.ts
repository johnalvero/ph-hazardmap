import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function formatDateWithTimezone(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(date))
}

export function formatEarthquakeTime(date: string | Date): string {
  const dateObj = new Date(date)
  
  const localTime = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(dateObj)
  
  return localTime
}

export function formatDistance(distance: number): string {
  return `${distance.toFixed(2)} km`
}

export function formatMagnitude(magnitude: number): string {
  return magnitude.toFixed(1)
}

export function getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7.0) return 'bg-red-500'
  if (magnitude >= 6.0) return 'bg-orange-500'
  if (magnitude >= 5.0) return 'bg-yellow-500'
  if (magnitude >= 4.0) return 'bg-green-500'
  return 'bg-blue-500'
}

export function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'warning': return 'destructive'
    case 'watch': return 'destructive'
    case 'advisory': return 'secondary'
    case 'normal': return 'default'
    default: return 'outline'
  }
}

export function getAlertLevelColor(level: number): string {
  if (level >= 4) return 'bg-red-500'
  if (level >= 3) return 'bg-orange-500'
  if (level >= 2) return 'bg-yellow-500'
  if (level >= 1) return 'bg-blue-500'
  return 'bg-gray-500'
}

