export type HazardType = 'earthquake' | 'volcano'

export interface Earthquake {
  id: string
  type: 'earthquake'
  magnitude: number
  depth: number
  location: string
  coordinates: [number, number] // [longitude, latitude]
  timestamp: string
  url?: string
  place: string
  alert?: 'green' | 'yellow' | 'orange' | 'red'
  tsunami: boolean
  felt?: number
  cdi?: number
  mmi?: number
}

export interface Volcano {
  id: string
  type: 'volcano'
  name: string
  location: string
  coordinates: [number, number] // [longitude, latitude]
  elevation: number
  status: 'normal' | 'advisory' | 'watch' | 'warning'
  activityLevel: number
  lastUpdate: string
  description?: string
  country: string
  parameters?: { [key: string]: string | number } // Dynamic parameters from bulletin
  shouldNotBeAllowed?: string // "Should not be allowed" recommendations
  reminder?: string // "Reminder" recommendations
  bulletinUrl?: string // Link to original bulletin
  bulletinDate?: string // Date of the bulletin
}

export type HazardEvent = Earthquake | Volcano

export interface FilterState {
  hazardTypes: HazardType[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  magnitudeRange: {
    min: number
    max: number
  }
  showMajorFaults: boolean
  showMinorFaults: boolean
}

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch?: number
  bearing?: number
}

