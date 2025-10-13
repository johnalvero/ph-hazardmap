/**
 * Philippine Fault Systems
 * 
 * DATA SOURCE: GEM Global Active Faults Database
 * Source: https://github.com/GEMScienceTools/gem-global-active-faults
 * License: CC BY-SA 4.0
 * Citation: Styron, R., and M. Pagani (2020). The GEM Global Active Faults Database. 
 *           Earthquake Spectra, 36, 160-180. doi:10.1177/8755293019899953
 * 
 * This data is OFFICIAL and peer-reviewed, suitable for:
 * - Educational purposes
 * - Research and analysis  
 * - Public awareness
 * - Hazard visualization
 * 
 * Attribution Required: Please credit GEM Foundation when using this data.
 */

export interface FaultLine {
  id: string
  name: string
  type: 'major' | 'minor'
  coordinates: [number, number][]
  description: string
  lastActivity?: string
  riskLevel: 'high' | 'moderate' | 'low'
  slipType?: string
}

interface GEMFaultProperties {
  catalog_id?: string
  catalog_name?: string
  name?: string
  slip_type?: string
  strike_slip_rate?: string
}

/**
 * Determine risk level based on fault properties
 */
function determineRiskLevel(properties: GEMFaultProperties): 'high' | 'moderate' | 'low' {
  const slipType = properties.slip_type?.toLowerCase() || ''
  const name = properties.name?.toLowerCase() || ''
  
  // Major known high-risk faults
  const highRiskFaults = [
    'philippine fault',
    'marikina',
    'west valley',
    'east valley',
    'manila trench',
    'cotabato',
    'surigao'
  ]
  
  if (highRiskFaults.some(fault => name.includes(fault))) {
    return 'high'
  }
  
  // Strike-slip and thrust faults are generally higher risk
  if (slipType.includes('sinistral') || slipType.includes('dextral') || 
      slipType.includes('thrust') || slipType.includes('reverse')) {
    return 'moderate'
  }
  
  return 'low'
}

interface GEMFeature {
  properties: Record<string, string | undefined>
  geometry: {
    type: string
    coordinates: number[][]
  }
}

interface GEMFeatureCollection {
  type: string
  features: GEMFeature[]
}

/**
 * Cache for loaded fault data
 */
let cachedFaultLines: FaultLine[] | null = null

/**
 * Load GEM fault data from public JSON file
 */
export async function loadPhilippineFaultLines(): Promise<FaultLine[]> {
  if (cachedFaultLines) {
    return cachedFaultLines
  }

  try {
    const response = await fetch('/data/philippines-faults-gem.json')
    if (!response.ok) {
      throw new Error(`Failed to load fault data: ${response.statusText}`)
    }
    
    const gemFaultsData = await response.json() as GEMFeatureCollection
    
    cachedFaultLines = gemFaultsData.features.map((feature: GEMFeature, index: number) => ({
      id: feature.properties.catalog_id || `gem-fault-${index}`,
      name: feature.properties.name || `Fault ${index + 1}`,
      type: 'major' as const,
      coordinates: feature.geometry.coordinates as [number, number][],
      description: `${feature.properties.slip_type || 'Unknown type'} fault.`,
      riskLevel: determineRiskLevel(feature.properties as GEMFaultProperties),
      slipType: feature.properties.slip_type
    }))
    
    return cachedFaultLines
  } catch (error) {
    console.error('Error loading fault data:', error)
    return []
  }
}

/**
 * Get cached fault lines (empty array if not loaded yet)
 */
export function getPhilippineFaultLines(): FaultLine[] {
  return cachedFaultLines || []
}

/**
 * Convert fault lines to GeoJSON format for Mapbox
 */
export function faultLinesToGeoJSON(faultLines: FaultLine[] = getPhilippineFaultLines()) {
  return {
    type: 'FeatureCollection',
    features: faultLines.map(fault => ({
      type: 'Feature',
      id: fault.id,
      properties: {
        name: fault.name,
        type: fault.type,
        description: fault.description,
        riskLevel: fault.riskLevel,
        slipType: fault.slipType
      },
      geometry: {
        type: 'LineString',
        coordinates: fault.coordinates
      }
    }))
  }
}

/**
 * Data attribution information
 */
export const faultDataAttribution = {
  source: 'GEM Global Active Faults Database',
  url: 'https://github.com/GEMScienceTools/gem-global-active-faults',
  license: 'CC BY-SA 4.0',
  citation: 'Styron, R., and M. Pagani (2020). The GEM Global Active Faults Database. Earthquake Spectra, 36, 160-180.',
  doi: '10.1177/8755293019899953',
  lastUpdated: '2023',
  faultCount: 162
}
