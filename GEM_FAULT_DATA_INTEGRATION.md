# GEM Global Active Faults Integration

## ✅ Successfully Integrated Real Fault Data

Your GeoSafe Map now uses **official, peer-reviewed scientific data** from the GEM Global Active Faults Database.

## What is GEM?

The **GEM (Global Earthquake Model) Foundation** is an international non-profit organization that develops and maintains high-quality seismic hazard and risk models. Their Global Active Faults Database is the most comprehensive, scientifically vetted collection of active fault traces worldwide.

## Data Details

- **Total Philippine Faults**: 162 mapped fault lines
- **Source**: GEM Global Active Faults Database
- **License**: CC BY-SA 4.0 (free to use with attribution)
- **Scientific Citation**: 
  > Styron, R., and M. Pagani (2020). The GEM Global Active Faults Database. Earthquake Spectra, 36, 160-180. doi:10.1177/8755293019899953
- **Repository**: https://github.com/GEMScienceTools/gem-global-active-faults

## How It Works

### Data Processing Pipeline

1. **Download**: Full GEM database downloaded from GitHub
2. **Filter**: Extracted only Philippine faults (116-127°E, 5-22°N)
3. **Transform**: Converted to TypeScript for Next.js compatibility
4. **Risk Classification**: Faults categorized by:
   - **High Risk**: Major known faults (Philippine Fault Zone, Marikina Valley Fault, etc.)
   - **Moderate Risk**: Strike-slip, thrust, and reverse faults
   - **Low Risk**: Other mapped faults

### Files Created

```
lib/data/
├── philippines-faults-gem.ts    (162 fault lines, GeoJSON format)
└── fault-lines.ts               (Processing logic, types, risk classification)
```

## Risk Level Classification

The app categorizes faults into three risk levels:

### High Risk (Red) 🔴
Faults identified by name as major seismic hazards:
- Philippine Fault Zone
- Marikina Valley Fault System
- West Valley Fault
- East Valley Fault
- Manila Trench
- Cotabato Fault
- Surigao Fault

### Moderate Risk (Orange) 🟠
Faults with active slip mechanisms:
- Sinistral (left-lateral) strike-slip
- Dextral (right-lateral) strike-slip  
- Thrust faults
- Reverse faults

### Low Risk (Yellow) 🟡
All other mapped active faults in the GEM database

## Fault Properties

Each fault includes:
- `name`: Official fault name from GEM catalog
- `catalog_id`: Unique GEM identifier (e.g., "PHL_0")
- `slip_type`: Fault kinematics (Sinistral, Dextral, Thrust, etc.)
- `coordinates`: LineString geometry (multiple lat/lon points)
- `riskLevel`: Our classification (high/moderate/low)
- `description`: Auto-generated description with slip type

## Data Accuracy

### What GEM Data Is Good For ✅
- Educational visualization
- General hazard awareness
- Research and analysis
- Public information
- Community preparedness

### What GEM Data Is NOT ✋
- NOT for construction planning
- NOT for property development decisions
- NOT for official seismic hazard assessments
- NOT a substitute for local government hazard maps

**For construction or property decisions**, always consult:
- **PHIVOLCS** (Philippine Institute of Volcanology and Seismology)
  - Website: https://www.phivolcs.dost.gov.ph/
  - Email: askphivolcs@phivolcs.dost.gov.ph
- **Local government hazard maps**
- **Licensed geotechnical engineers**

## Technical Implementation

### Data Loading
```typescript
import gemFaultsData from './philippines-faults-gem'

export const philippineFaultLines: FaultLine[] = 
  gemFaultsData.features.map((feature, index) => ({
    id: feature.properties.catalog_id || `gem-fault-${index}`,
    name: feature.properties.name || `Fault ${index + 1}`,
    type: 'major',
    coordinates: feature.geometry.coordinates,
    riskLevel: determineRiskLevel(feature.properties),
    // ...
  }))
```

### Mapbox Rendering
```typescript
<Source id="fault-lines" type="geojson" data={faultLinesToGeoJSON()}>
  <Layer
    id="fault-lines"
    type="line"
    paint={{
      'line-color': [
        'match',
        ['get', 'riskLevel'],
        'high', '#ef4444',      // Red
        'moderate', '#f97316',  // Orange  
        'low', '#eab308',       // Yellow
        '#6b7280'               // Gray default
      ],
      'line-width': 3,
      'line-opacity': 0.8,
      'line-dasharray': [2, 2]
    }}
  />
</Source>
```

## License Compliance

GEM data is licensed under **CC BY-SA 4.0**, which requires:

1. **Attribution** ✅ - We credit GEM in:
   - Source code comments
   - UI info panel
   - Data attribution export
   
2. **ShareAlike** ✅ - Derivative works must use same license
   
3. **Free to Use** ✅ - Commercial and non-commercial use allowed

## Updating the Data

To update to the latest GEM database:

```bash
cd lib/data

# Download latest GEM data
curl -o gem-faults-full.geojson \
  "https://raw.githubusercontent.com/GEMScienceTools/gem-global-active-faults/master/geojson/gem_active_faults.geojson"

# Filter for Philippines (116-127°E, 5-22°N)
jq '{
  type: "FeatureCollection",
  features: [.features[] | select(
    .geometry.type == "LineString" and
    (.geometry.coordinates | .[0][0] >= 116 and .[0][0] <= 127 and .[0][1] >= 5 and .[0][1] <= 22)
  )]
}' gem-faults-full.geojson > philippines-faults-gem.geojson

# Convert to TypeScript
echo "export default $(cat philippines-faults-gem.geojson)" > philippines-faults-gem.ts

# Clean up
rm gem-faults-full.geojson philippines-faults-gem.geojson

# Rebuild
npm run build
```

## Data Sources Summary

| Hazard Type | Data Source | Status |
|-------------|-------------|--------|
| 🌍 Earthquakes | USGS Real-time Feed | ✅ Official, Live |
| 🌋 Volcanoes | Mock Data (PHIVOLCS format) | ⚠️ Demo Only |
| ⚠️ Fault Lines | GEM Global Active Faults | ✅ Official, Peer-reviewed |

## Next Steps

To further improve data quality:

1. **Volcano Data**: Integrate real PHIVOLCS volcano monitoring data
   - API: Contact PHIVOLCS for access
   - Alternative: Web scraping from PHIVOLCS bulletin pages

2. **Earthquake Enhancements**: 
   - Add felt reports from USGS DYFI
   - Integrate ShakeMap overlays
   - Add aftershock clustering

3. **Fault Enhancements**:
   - Add slip rate data visualization
   - Show earthquake recurrence intervals
   - Display last known rupture dates

## References

1. Styron, R., and M. Pagani (2020). The GEM Global Active Faults Database. *Earthquake Spectra*, 36, 160-180. https://doi.org/10.1177/8755293019899953

2. GEM Foundation. (2023). *GEM Global Active Faults Database*. GitHub. https://github.com/GEMScienceTools/gem-global-active-faults

3. Philippine Institute of Volcanology and Seismology (PHIVOLCS). https://www.phivolcs.dost.gov.ph/

---

**Last Updated**: October 12, 2025  
**GEM Database Version**: Latest from GitHub  
**Fault Count**: 162 Philippine faults

