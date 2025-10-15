'use client'

import { Source, Layer } from 'react-map-gl'
import type { LayerProps } from 'react-map-gl'
import { Typhoon } from '@/types/hazard'
import { getTyphoonColor, calculateUncertaintyCone } from '@/lib/data/typhoons'

interface TyphoonLayersProps {
  typhoons: Typhoon[]
}

export function TyphoonLayers({ typhoons }: TyphoonLayersProps) {
  return (
    <>
      {typhoons.map((typhoon) => (
        <TyphoonLayerGroup key={typhoon.id} typhoon={typhoon} />
      ))}
    </>
  )
}

function TyphoonLayerGroup({ typhoon }: { typhoon: Typhoon }) {
  const color = getTyphoonColor(typhoon.category)
  
  // Create forecast track GeoJSON
  const forecastTrackGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        typhoon.coordinates,
        ...typhoon.forecast.map(f => f.coordinates)
      ]
    },
    properties: {
      name: typhoon.name,
      category: typhoon.category
    }
  }
  
  // Create forecast points GeoJSON
  const forecastPointsGeoJSON = {
    type: 'FeatureCollection' as const,
    features: typhoon.forecast.map((point, index) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: point.coordinates
      },
      properties: {
        hour: (index + 1) * 24,
        category: point.category,
        windSpeed: point.windSpeed
      }
    }))
  }
  
  // Create uncertainty cone GeoJSON
  const coneCoordinates = calculateUncertaintyCone(typhoon.forecast)
  const uncertaintyConeGeoJSON = {
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
  }
  
  // Create wind radii circles GeoJSON (simple point features)
  const windRadiiGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: typhoon.coordinates
    },
    properties: {}
  }
  
  // Layer styles
  const uncertaintyConeLayer: LayerProps = {
    id: `uncertainty-cone-${typhoon.id}`,
    type: 'fill',
    paint: {
      'fill-color': color,
      'fill-opacity': 0.1
    }
  }
  
  const forecastTrackLayer: LayerProps = {
    id: `forecast-track-${typhoon.id}`,
    type: 'line',
    paint: {
      'line-color': color,
      'line-width': 3,
      'line-dasharray': [2, 2]
    }
  }
  
  const forecastPointsLayer: LayerProps = {
    id: `forecast-points-${typhoon.id}`,
    type: 'circle',
    paint: {
      'circle-color': color,
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
      'circle-radius': maxRadius34,
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
      'circle-radius': maxRadius50,
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
      'circle-radius': maxRadius64,
      'circle-color': '#EF4444',
      'circle-opacity': 0.25,
      'circle-stroke-color': '#EF4444',
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.8
    }
  }
  
  return (
    <>
      {/* Uncertainty Cone */}
      <Source
        id={`uncertainty-cone-source-${typhoon.id}`}
        type="geojson"
        data={uncertaintyConeGeoJSON}
      >
        <Layer {...uncertaintyConeLayer} />
      </Source>
      
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
      
      {/* Forecast Track Line */}
      <Source
        id={`forecast-track-source-${typhoon.id}`}
        type="geojson"
        data={forecastTrackGeoJSON}
      >
        <Layer {...forecastTrackLayer} />
      </Source>
      
      {/* Forecast Points */}
      <Source
        id={`forecast-points-source-${typhoon.id}`}
        type="geojson"
        data={forecastPointsGeoJSON}
      >
        <Layer {...forecastPointsLayer} />
      </Source>
    </>
  )
}

