export const MAPBOX_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
} as const

export const DEFAULT_MAP_CENTER = {
  PHILIPPINES: {
    longitude: 122.5,
    latitude: 12.8,
    zoom: 5
  },
  GLOBAL: {
    longitude: 0,
    latitude: 20,
    zoom: 2
  }
} as const

export const MAGNITUDE_THRESHOLDS = {
  MAJOR: 7.0,
  STRONG: 6.0,
  MODERATE: 5.0,
  LIGHT: 4.0,
  MINOR: 3.0
} as const

export const VOLCANO_STATUS_LEVELS = {
  NORMAL: 0,
  ADVISORY: 1,
  WATCH: 2,
  WARNING: 3,
  CRITICAL: 4
} as const

export const DATA_SOURCES = {
  USGS: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/',
  PHIVOLCS: 'https://www.phivolcs.dost.gov.ph/',
  GVP: 'https://volcano.si.edu/'
} as const

export const UPDATE_INTERVALS = {
  EARTHQUAKES: 5 * 60 * 1000, // 5 minutes
  VOLCANOES: 60 * 60 * 1000,  // 1 hour
  WEATHER: 15 * 60 * 1000     // 15 minutes
} as const

