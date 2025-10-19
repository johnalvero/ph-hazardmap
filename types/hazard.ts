export type HazardType = 'earthquake' | 'volcano' | 'typhoon'

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

export interface AIInsight {
  summary: string
  riskAssessment: string
  recommendations: string[]
  keyPoints: string[]
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
  aiInsight?: AIInsight // AI-generated insight for citizens
}

export interface ForecastPoint {
  timestamp: string
  coordinates: [number, number] // [longitude, latitude]
  windSpeed: number // knots
  category: string // TD, TS, Cat1-5
  pressure?: number // mb
}

export interface WindRadii {
  radius34kt?: { ne?: number; se?: number; sw?: number; nw?: number } // nautical miles
  radius50kt?: { ne?: number; se?: number; sw?: number; nw?: number }
  radius64kt?: { ne?: number; se?: number; sw?: number; nw?: number }
}

export interface Typhoon {
  id: string
  type: 'typhoon'
  name: string
  basin: string // e.g., "Western Pacific"
  category: string // TD, TS, Cat1, Cat2, Cat3, Cat4, Cat5
  coordinates: [number, number] // [longitude, latitude] - current position
  timestamp: string // last update time
  windSpeed: number // knots
  windSpeedKph?: number // km/h
  pressure: number // millibars
  movementSpeed: number // knots
  movementDirection: number // degrees (0-360)
  forecast: ForecastPoint[] // 3-5 day forecast
  windRadii?: WindRadii
  warnings?: string[]
  status: string // e.g., "Active", "Dissipating"
  jtwcUrl?: string
}

export type HazardEvent = Earthquake | Volcano | Typhoon

export type TimeRangePreset = '24h' | '7d' | '30d' | 'custom'

export interface FilterState {
  hazardTypes: HazardType[]
  daysAgo: number // Number of days ago to fetch data (1-30)
  timeRangePreset?: TimeRangePreset // Quick time range presets (optional, used in dashboard)
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

