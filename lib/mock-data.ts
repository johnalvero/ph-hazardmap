import { Earthquake, Volcano } from '@/types/hazard'

// Mock earthquake data (based on recent Philippine earthquakes)
export const mockEarthquakes: Earthquake[] = [
  {
    id: 'eq_1',
    type: 'earthquake',
    magnitude: 6.7,
    depth: 10,
    location: 'Mindanao, Philippines',
    coordinates: [126.4, 6.9],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    place: '12 km SE of Davao City',
    alert: 'orange',
    tsunami: false,
    felt: 156,
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'eq_2',
    type: 'earthquake',
    magnitude: 5.4,
    depth: 35,
    location: 'Luzon, Philippines',
    coordinates: [120.9, 14.6],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    place: '15 km NW of Manila',
    alert: 'yellow',
    tsunami: false,
    felt: 89,
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'eq_3',
    type: 'earthquake',
    magnitude: 4.2,
    depth: 8,
    location: 'Visayas, Philippines',
    coordinates: [123.9, 10.3],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    place: '8 km E of Cebu City',
    alert: 'green',
    tsunami: false,
    felt: 23,
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'eq_4',
    type: 'earthquake',
    magnitude: 7.2,
    depth: 25,
    location: 'Mindanao, Philippines',
    coordinates: [125.5, 6.2],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    place: '45 km S of General Santos',
    alert: 'red',
    tsunami: true,
    felt: 342,
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'eq_5',
    type: 'earthquake',
    magnitude: 3.8,
    depth: 15,
    location: 'Luzon, Philippines',
    coordinates: [121.0, 16.4],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    place: '22 km N of Baguio',
    alert: 'green',
    tsunami: false,
    felt: 12,
    url: 'https://earthquake.usgs.gov/'
  },
  {
    id: 'eq_6',
    type: 'earthquake',
    magnitude: 5.9,
    depth: 42,
    location: 'Mindanao, Philippines',
    coordinates: [124.8, 8.5],
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    place: '18 km W of Cagayan de Oro',
    alert: 'orange',
    tsunami: false,
    felt: 178,
    url: 'https://earthquake.usgs.gov/'
  }
]

// Mock volcano data (active Philippine volcanoes)
export const mockVolcanoes: Volcano[] = [
  {
    id: 'vol_1',
    type: 'volcano',
    name: 'Mayon',
    location: 'Albay, Luzon',
    coordinates: [123.685, 13.257],
    elevation: 2463,
    status: 'advisory',
    activityLevel: 2,
    lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    description: 'Moderate level of volcanic earthquake activity detected. Alert Level 2 maintained.',
    country: 'Philippines'
  },
  {
    id: 'vol_2',
    type: 'volcano',
    name: 'Taal',
    location: 'Batangas, Luzon',
    coordinates: [120.993, 14.002],
    elevation: 311,
    status: 'watch',
    activityLevel: 3,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Increased volcanic unrest with volcanic earthquakes and degassing. Alert Level 3.',
    country: 'Philippines'
  },
  {
    id: 'vol_3',
    type: 'volcano',
    name: 'Pinatubo',
    location: 'Zambales, Luzon',
    coordinates: [120.35, 15.13],
    elevation: 1486,
    status: 'normal',
    activityLevel: 0,
    lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: 'No unusual activity. Background seismicity at normal levels.',
    country: 'Philippines'
  },
  {
    id: 'vol_4',
    type: 'volcano',
    name: 'Kanlaon',
    location: 'Negros, Visayas',
    coordinates: [123.132, 10.412],
    elevation: 2465,
    status: 'advisory',
    activityLevel: 1,
    lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    description: 'Low level seismic activity. Slight increase in volcanic gas emission.',
    country: 'Philippines'
  },
  {
    id: 'vol_5',
    type: 'volcano',
    name: 'Bulusan',
    location: 'Sorsogon, Luzon',
    coordinates: [124.05, 12.77],
    elevation: 1565,
    status: 'normal',
    activityLevel: 0,
    lastUpdate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    description: 'Normal background activity. No significant changes observed.',
    country: 'Philippines'
  },
  {
    id: 'vol_6',
    type: 'volcano',
    name: 'Hibok-Hibok',
    location: 'Camiguin, Mindanao',
    coordinates: [124.673, 9.203],
    elevation: 1332,
    status: 'normal',
    activityLevel: 0,
    lastUpdate: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    description: 'Seismic monitoring shows background levels. No volcanic earthquakes.',
    country: 'Philippines'
  }
]

