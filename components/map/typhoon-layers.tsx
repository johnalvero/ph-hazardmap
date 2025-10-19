'use client'

import { Source, Layer } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import { Typhoon } from '@/types/hazard'
import { getTyphoonColor, calculateUncertaintyCone } from '@/lib/data/typhoons'

interface TyphoonLayersProps {
  typhoons: Typhoon[]
}

export function TyphoonLayers({ typhoons }: TyphoonLayersProps) {
  try {
    return (
      <>
        {typhoons.map((typhoon) => (
          <TyphoonLayerGroup key={typhoon.id} typhoon={typhoon} />
        ))}
      </>
    )
  } catch (error) {
    console.error('Error rendering typhoon layers:', error)
    return null
  }
}

function TyphoonLayerGroup({ typhoon }: { typhoon: Typhoon }) {
  try {
    // Validate typhoon data
    if (!typhoon || !typhoon.coordinates || !Array.isArray(typhoon.coordinates) || typhoon.coordinates.length !== 2) {
      console.warn('Invalid typhoon data:', typhoon)
      return null
    }

    const [lon, lat] = typhoon.coordinates
    if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      console.warn('Invalid typhoon coordinates:', typhoon.coordinates)
      return null
    }

    const color = getTyphoonColor(typhoon.category)
    
    // Validate forecast data
    const validForecast = typhoon.forecast?.filter(f => 
      f && 
      f.coordinates && 
      Array.isArray(f.coordinates) && 
      f.coordinates.length === 2 &&
      !isNaN(f.coordinates[0]) && 
      !isNaN(f.coordinates[1])
    ) || []

    // Only create forecast layers if we have valid forecast data
    const hasValidForecast = validForecast.length > 0

    // Create forecast track GeoJSON (only if we have forecast data)
    const forecastTrackGeoJSON = hasValidForecast ? {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          typhoon.coordinates,
          ...validForecast.map(f => f.coordinates)
        ]
      },
      properties: {
        name: typhoon.name,
        category: typhoon.category
      }
    } : null
    
    // Create forecast points GeoJSON (only if we have forecast data)
    const forecastPointsGeoJSON = hasValidForecast ? {
      type: 'FeatureCollection' as const,
      features: validForecast.map((point, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: point.coordinates
        },
        properties: {
          hour: (index + 1) * 24,
          category: point.category || typhoon.category,
          windSpeed: point.windSpeed || typhoon.windSpeed
        }
      }))
    } : null
    
    // Create uncertainty cone GeoJSON (only if we have forecast data)
    const coneCoordinates = hasValidForecast ? calculateUncertaintyCone(validForecast) : []
    const uncertaintyConeGeoJSON = coneCoordinates.length > 0 ? {
      type: 'FeatureCollection' as const,
      features: coneCoordinates.map((coords, index) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [coords]
        },
        properties: {
          hour: (index + 1) * 24
        }
      }))
    } : null
  
  // Create wind radii circles GeoJSON (simple point features)
  const windRadiiGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: typhoon.coordinates
    },
    properties: {}
  }
  
  // Layer styles with validation
  const uncertaintyConeLayer: LayerProps = {
    id: `uncertainty-cone-${typhoon.id}`,
    type: 'fill',
    paint: {
      'fill-color': color || '#FF0000',
      'fill-opacity': 0.1
    }
  }
  
  const forecastTrackLayer: LayerProps = {
    id: `forecast-track-${typhoon.id}`,
    type: 'line',
    paint: {
      'line-color': color || '#FF0000',
      'line-width': 3,
      'line-dasharray': [2, 2]
    }
  }
  
  const forecastPointsLayer: LayerProps = {
    id: `forecast-points-${typhoon.id}`,
    type: 'circle',
    paint: {
      'circle-color': color || '#FF0000',
      'circle-radius': 6,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  }
  
  const maxRadius34 = typhoon.windRadii?.radius34kt 
    ? Math.max(
        typhoon.windRadii.radius34kt.ne || 0,
        typhoon.windRadii.radius34kt.se || 0,
        typhoon.windRadii.radius34kt.sw || 0,
        typhoon.windRadii.radius34kt.nw || 0
      ) * 1.852 * 0.15 // Convert NM to km and scale for visual
    : 50

  const maxRadius50 = typhoon.windRadii?.radius50kt 
    ? Math.max(
        typhoon.windRadii.radius50kt.ne || 0,
        typhoon.windRadii.radius50kt.se || 0,
        typhoon.windRadii.radius50kt.sw || 0,
        typhoon.windRadii.radius50kt.nw || 0
      ) * 1.852 * 0.15
    : 30

  const maxRadius64 = typhoon.windRadii?.radius64kt 
    ? Math.max(
        typhoon.windRadii.radius64kt.ne || 0,
        typhoon.windRadii.radius64kt.se || 0,
        typhoon.windRadii.radius64kt.sw || 0,
        typhoon.windRadii.radius64kt.nw || 0
      ) * 1.852 * 0.15
    : 15

  const windRadii34Layer: LayerProps = {
    id: `wind-radii-34-${typhoon.id}`,
    type: 'circle',
    paint: {
      'circle-radius': Math.max(maxRadius34, 1), // Ensure minimum radius
      'circle-color': '#F59E0B',
      'circle-opacity': 0.15,
      'circle-stroke-color': '#F59E0B',
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.6
    }
  }
  
  const windRadii50Layer: LayerProps = {
    id: `wind-radii-50-${typhoon.id}`,
    type: 'circle',
    paint: {
      'circle-radius': Math.max(maxRadius50, 1), // Ensure minimum radius
      'circle-color': '#F97316',
      'circle-opacity': 0.2,
      'circle-stroke-color': '#F97316',
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.7
    }
  }
  
  const windRadii64Layer: LayerProps = {
    id: `wind-radii-64-${typhoon.id}`,
    type: 'circle',
    paint: {
      'circle-radius': Math.max(maxRadius64, 1), // Ensure minimum radius
      'circle-color': '#EF4444',
      'circle-opacity': 0.25,
      'circle-stroke-color': '#EF4444',
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.8
    }
  }
  
  return (
    <>
      {/* Uncertainty Cone - Only render if we have valid forecast data */}
      {uncertaintyConeGeoJSON && (
        <Source
          id={`uncertainty-cone-source-${typhoon.id}`}
          type="geojson"
          data={uncertaintyConeGeoJSON}
        >
          <Layer {...uncertaintyConeLayer} />
        </Source>
      )}
      
      {/* Wind Radii - 34kt (outermost) */}
      {typhoon.windRadii?.radius34kt && (
        <Source
          id={`wind-radii-34-source-${typhoon.id}`}
          type="geojson"
          data={windRadiiGeoJSON}
        >
          <Layer {...windRadii34Layer} />
        </Source>
      )}
      
      {/* Wind Radii - 50kt */}
      {typhoon.windRadii?.radius50kt && (
        <Source
          id={`wind-radii-50-source-${typhoon.id}`}
          type="geojson"
          data={windRadiiGeoJSON}
        >
          <Layer {...windRadii50Layer} />
        </Source>
      )}
      
      {/* Wind Radii - 64kt (innermost) */}
      {typhoon.windRadii?.radius64kt && (
        <Source
          id={`wind-radii-64-source-${typhoon.id}`}
          type="geojson"
          data={windRadiiGeoJSON}
        >
          <Layer {...windRadii64Layer} />
        </Source>
      )}
      
      {/* Forecast Track Line - Only render if we have valid forecast data */}
      {forecastTrackGeoJSON && (
        <Source
          id={`forecast-track-source-${typhoon.id}`}
          type="geojson"
          data={forecastTrackGeoJSON}
        >
          <Layer {...forecastTrackLayer} />
        </Source>
      )}
      
      {/* Forecast Points - Only render if we have valid forecast data */}
      {forecastPointsGeoJSON && (
        <Source
          id={`forecast-points-source-${typhoon.id}`}
          type="geojson"
          data={forecastPointsGeoJSON}
        >
          <Layer {...forecastPointsLayer} />
        </Source>
      )}
    </>
  )
  } catch (error) {
    console.error('Error rendering typhoon layer group:', error)
    return null
  }
}

