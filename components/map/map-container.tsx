'use client'

import { useEffect, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl, ScaleControl, FullscreenControl, Source, Layer } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import type mapboxgl from 'mapbox-gl'
import { HazardEvent, FilterState, Earthquake } from '@/types/hazard'
import { mockVolcanoes } from '@/lib/mock-data'
import { loadPhilippineFaultLines, faultLinesToGeoJSON, type FaultLine } from '@/lib/data/fault-lines'

interface MapContainerProps {
  filters: FilterState
  selectedEvent: HazardEvent | null
  onEventSelect: (event: HazardEvent | null) => void
}

export function MapContainer({ filters, onEventSelect }: MapContainerProps) {
  const mapRef = useRef(null)
  const [viewState, setViewState] = useState({
    longitude: 122.5,
    latitude: 12.8,
    zoom: 5
  })
  const [popupInfo, setPopupInfo] = useState<HazardEvent | null>(null)
  const [faultPopup, setFaultPopup] = useState<{
    name: string
    description: string
    riskLevel: string
    coordinates: [number, number]
  } | null>(null)
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [faultLines, setFaultLines] = useState<FaultLine[]>([])

  // Load fault lines data when enabled
  useEffect(() => {
    if ((filters.showMajorFaults || filters.showMinorFaults) && faultLines.length === 0) {
      loadPhilippineFaultLines().then(setFaultLines)
    }
  }, [filters.showMajorFaults, filters.showMinorFaults, faultLines.length])

  // Filter fault lines by risk level
  const majorFaultLines = faultLines.filter(fault => fault.riskLevel === 'high')
  const minorFaultLines = faultLines.filter(fault => fault.riskLevel === 'moderate' || fault.riskLevel === 'low')

  // Fetch real earthquake data from API
  useEffect(() => {
    async function fetchEarthquakes() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/earthquakes?timeframe=month&magnitude=all')
        
        if (!response.ok) {
          throw new Error('Failed to fetch earthquakes')
        }
        
        const data = await response.json()
        setEarthquakes(data.earthquakes)
        
        console.log(`Loaded ${data.earthquakes.length} earthquakes from ${data.metadata.source}`)
      } catch (err) {
        console.error('Error fetching earthquakes:', err)
        setError(err instanceof Error ? err.message : 'Failed to load earthquakes')
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch and set up interval if earthquakes are enabled
    if (!filters.hazardTypes.includes('earthquake')) {
      setIsLoading(false)
      return
    }

    // Initial fetch
    fetchEarthquakes()

    // Refresh earthquake data every 5 minutes
    const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [filters.hazardTypes])

  // Combine and filter events
  const events: HazardEvent[] = [
    ...(filters.hazardTypes.includes('earthquake') ? earthquakes : []),
    ...(filters.hazardTypes.includes('volcano') ? mockVolcanoes : [])
  ].filter(event => {
    if (event.type === 'earthquake') {
      // Filter by magnitude
      const magnitudeMatch = event.magnitude >= filters.magnitudeRange.min && 
                            event.magnitude <= filters.magnitudeRange.max
      
      // Filter by date range
      let dateMatch = true
      if (filters.dateRange.start && filters.dateRange.end) {
        const eventDate = new Date(event.timestamp)
        dateMatch = eventDate >= filters.dateRange.start && eventDate <= filters.dateRange.end
      }
      
      return magnitudeMatch && dateMatch
    }
    return true
  })

  const getMagnitudeSize = (magnitude: number) => {
    return Math.max(15, magnitude * 5)
  }

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7) return '#ef4444' // red
    if (magnitude >= 6) return '#f97316' // orange
    if (magnitude >= 5) return '#eab308' // yellow
    if (magnitude >= 4) return '#3b82f6' // blue
    return '#22c55e' // green
  }

  const getVolcanoColor = (status: string) => {
    switch (status) {
      case 'warning': return '#ef4444'
      case 'watch': return '#f97316'
      case 'advisory': return '#eab308'
      default: return '#6b7280'
    }
  }

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  // Show a message if Mapbox token is not set
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Mapbox Token Required</h2>
          <p className="text-muted-foreground mb-4">
            To use the map, please add your Mapbox access token to the environment variables.
          </p>
          <div className="text-left bg-background p-4 rounded-md border text-sm">
            <p className="font-mono text-xs mb-2">
              Create a file: <strong>.env.local</strong>
            </p>
            <p className="font-mono text-xs">
              NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Get your free token at{' '}
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Major fault line layer styles (high-risk)
  const majorFaultLineLayer: LayerProps = {
    id: 'major-fault-lines',
    type: 'line',
    paint: {
      'line-color': '#ef4444',      // Red for high risk
      'line-width': 3,
      'line-opacity': 0.9,
      'line-dasharray': [2, 2]
    }
  }

  // Minor fault line layer styles (moderate/low risk)
  const minorFaultLineLayer: LayerProps = {
    id: 'minor-fault-lines',
    type: 'line',
    paint: {
      'line-color': [
        'match',
        ['get', 'riskLevel'],
        'moderate', '#f97316',  // Orange for moderate
        'low', '#eab308',       // Yellow for low
        '#94a3b8'               // Gray default
      ],
      'line-width': 2,
      'line-opacity': 0.6,
      'line-dasharray': [3, 3]
    }
  }

  // Handle fault line hover
  const onFaultHover = (event: mapboxgl.MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0]
      const coordinates = event.lngLat
      
      setFaultPopup({
        name: feature.properties?.name || '',
        description: feature.properties?.description || '',
        riskLevel: feature.properties?.riskLevel || 'low',
        coordinates: [coordinates.lng, coordinates.lat]
      })
    }
  }

  const onFaultLeave = () => {
    setFaultPopup(null)
  }

  return (
    <div className="w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={[
          ...(filters.showMajorFaults ? ['major-fault-lines'] : []),
          ...(filters.showMinorFaults ? ['minor-fault-lines'] : [])
        ]}
        onMouseMove={(filters.showMajorFaults || filters.showMinorFaults) ? onFaultHover : undefined}
        onMouseLeave={(filters.showMajorFaults || filters.showMinorFaults) ? onFaultLeave : undefined}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <ScaleControl />
        <FullscreenControl position="top-right" />

        {/* Major Fault Lines Layer */}
        {filters.showMajorFaults && majorFaultLines.length > 0 && (
          <Source id="major-fault-lines-source" type="geojson" data={faultLinesToGeoJSON(majorFaultLines)}>
            <Layer {...majorFaultLineLayer} />
          </Source>
        )}

        {/* Minor Fault Lines Layer */}
        {filters.showMinorFaults && minorFaultLines.length > 0 && (
          <Source id="minor-fault-lines-source" type="geojson" data={faultLinesToGeoJSON(minorFaultLines)}>
            <Layer {...minorFaultLineLayer} />
          </Source>
        )}

        {/* Render earthquake markers */}
        {events.map(event => {
          if (event.type === 'earthquake') {
            const size = getMagnitudeSize(event.magnitude)
            const color = getMagnitudeColor(event.magnitude)
            
            return (
              <Marker
                key={event.id}
                longitude={event.coordinates[0]}
                latitude={event.coordinates[1]}
                anchor="center"
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={e => {
                    e.stopPropagation()
                    onEventSelect(event)
                  }}
                  onMouseEnter={() => setPopupInfo(event)}
                  onMouseLeave={() => setPopupInfo(null)}
                >
                  <div
                    className="rounded-full opacity-70 hover:opacity-100"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: color,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
              </Marker>
            )
          } else {
            const color = getVolcanoColor(event.status)
            
            return (
              <Marker
                key={event.id}
                longitude={event.coordinates[0]}
                latitude={event.coordinates[1]}
                anchor="bottom"
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={e => {
                    e.stopPropagation()
                    onEventSelect(event)
                  }}
                  onMouseEnter={() => setPopupInfo(event)}
                  onMouseLeave={() => setPopupInfo(null)}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 30 30"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  >
                    <path d="M15 5 L25 25 L5 25 Z" />
                  </svg>
                </div>
              </Marker>
            )
          }
        })}

        {/* Popup on hover for events */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.coordinates[0]}
            latitude={popupInfo.coordinates[1]}
            anchor="top"
            closeButton={false}
            closeOnClick={false}
            className="hazard-popup"
          >
            <div className="p-2 min-w-[200px]">
              <div className="font-semibold mb-1">
                {popupInfo.type === 'earthquake' 
                  ? `M ${popupInfo.magnitude.toFixed(1)} Earthquake`
                  : popupInfo.name
                }
              </div>
              <div className="text-xs text-muted-foreground">
                {popupInfo.type === 'earthquake' 
                  ? popupInfo.place
                  : popupInfo.location
                }
              </div>
            </div>
          </Popup>
        )}

        {/* Popup on hover for fault lines */}
        {faultPopup && (filters.showMajorFaults || filters.showMinorFaults) && (
          <Popup
            longitude={faultPopup.coordinates[0]}
            latitude={faultPopup.coordinates[1]}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            className="fault-popup"
            offset={10}
          >
            <div className="p-3 min-w-[250px] max-w-[300px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <div className="font-semibold text-sm">
                  {faultPopup.name}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${
                  faultPopup.riskLevel === 'high' ? 'bg-red-500' :
                  faultPopup.riskLevel === 'moderate' ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}>
                  {faultPopup.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {faultPopup.description}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Event count indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border z-10">
        <p className="text-sm font-medium">
          {isLoading ? (
            <>
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse mr-2" />
              Loading earthquakes...
            </>
          ) : error ? (
            <>
              <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2" />
              {error}
            </>
          ) : (
            <>
              {events.length} {events.length === 1 ? 'event' : 'events'} displayed
              {filters.hazardTypes.includes('earthquake') && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (Live USGS data)
                </span>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  )
}

