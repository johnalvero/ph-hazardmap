# Real Data Integration

This directory contains functions for fetching real-time hazard data from external APIs.

## Earthquakes (USGS)

### Status: ✅ **LIVE AND WORKING**

The earthquake data is now fetched in real-time from the **USGS Earthquake Hazards Program**.

### Features

- ✅ **Real-time data** from USGS GeoJSON feeds
- ✅ **Auto-refresh** every 5 minutes
- ✅ **Automatic fallback** to mock data if API fails
- ✅ **Caching** with Next.js 15 (5-minute revalidation)
- ✅ **Flexible queries** by timeframe and magnitude
- ✅ **Region-specific** queries (e.g., Philippines only)

### API Endpoints

#### USGS GeoJSON Feeds
```
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/[MAGNITUDE]_[TIMEFRAME].geojson
```

**Magnitude Options:**
- `all` - All earthquakes
- `significant` - Significant events only
- `M4.5` - Magnitude 4.5+
- `M2.5` - Magnitude 2.5+
- `M1.0` - Magnitude 1.0+

**Timeframe Options:**
- `hour` - Past hour
- `day` - Past 24 hours
- `week` - Past 7 days
- `month` - Past 30 days

### Usage Examples

#### Basic Usage (in API route)
```typescript
import { fetchUSGSEarthquakes } from '@/lib/data/earthquakes'

// Get all earthquakes from the past day
const earthquakes = await fetchUSGSEarthquakes('day', 'all')

// Get only significant earthquakes from the past week
const significant = await fetchUSGSEarthquakes('week', 'significant')

// Get magnitude 4.5+ earthquakes from the past hour
const major = await fetchUSGSEarthquakes('hour', 'M4.5')
```

#### Region-Specific Queries
```typescript
import { fetchPhilippineEarthquakes } from '@/lib/data/earthquakes'

// Get earthquakes in Philippines region (M2.5+, past 7 days)
const phEarthquakes = await fetchPhilippineEarthquakes(2.5, 7)
```

#### Custom Bounding Box
```typescript
import { fetchUSGSEarthquakesByRegion } from '@/lib/data/earthquakes'

// Define your region
const earthquakes = await fetchUSGSEarthquakesByRegion(
  minLatitude,
  maxLatitude,
  minLongitude,
  maxLongitude,
  startTime,
  minMagnitude
)
```

### API Route Usage

The earthquakes API route (`/api/earthquakes`) supports query parameters:

```
GET /api/earthquakes?timeframe=day&magnitude=all
GET /api/earthquakes?timeframe=week&magnitude=M4.5
GET /api/earthquakes?mock=true  // Use mock data for testing
```

### Response Format

```json
{
  "earthquakes": [...],
  "metadata": {
    "source": "USGS Earthquake Hazards Program",
    "api": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php",
    "generated": "2024-10-12T10:30:00.000Z",
    "count": 156,
    "timeframe": "day",
    "magnitude": "all",
    "mode": "live"
  }
}
```

### Caching Strategy

- **Client-side**: Data refreshes every 5 minutes automatically
- **Server-side**: Next.js revalidation set to 300 seconds (5 minutes)
- **Fallback**: Mock data used if USGS API is unavailable

### Data Transformation

USGS GeoJSON format is transformed to our application format:

```typescript
// USGS format (input)
{
  id: "us6000abc123",
  properties: {
    mag: 6.5,
    place: "12 km SE of Davao City, Philippines",
    time: 1697097600000,
    alert: "orange",
    tsunami: 0,
    // ... more fields
  },
  geometry: {
    coordinates: [125.5, 7.2, 10.0]  // [lng, lat, depth]
  }
}

// Our format (output)
{
  id: "us6000abc123",
  type: "earthquake",
  magnitude: 6.5,
  depth: 10.0,
  location: "Philippines",
  coordinates: [125.5, 7.2],
  timestamp: "2024-10-12T10:00:00.000Z",
  place: "12 km SE of Davao City, Philippines",
  alert: "orange",
  tsunami: false,
  url: "https://earthquake.usgs.gov/..."
}
```

### Error Handling

The implementation includes robust error handling:

1. **API Errors**: If USGS API fails, fallback to mock data
2. **Network Errors**: Graceful degradation with error message
3. **Invalid Data**: Filters out earthquakes with missing magnitude
4. **Console Logging**: Detailed logs for debugging

### Testing

To test with mock data (useful for development):
```
GET /api/earthquakes?mock=true
```

To test with live data:
```
GET /api/earthquakes
```

Check browser console for logs:
```
Loaded 156 earthquakes from USGS Earthquake Hazards Program
```

### Performance

- **Initial Load**: ~500ms - 2s (depends on USGS API)
- **Cached Load**: ~50ms - 100ms (Next.js cache hit)
- **Auto-refresh**: Background fetch every 5 minutes
- **Data Size**: Typically 50-500 earthquakes (varies by parameters)

### Rate Limits

USGS API has generous rate limits:
- No authentication required
- No hard rate limit documented
- Recommended: Cache responses for 5+ minutes

Our implementation respects this with:
- 5-minute server-side cache (Next.js revalidation)
- 5-minute client-side refresh interval

### Future Enhancements

- [ ] Add database caching (PostgreSQL + PostGIS)
- [ ] Add Redis caching for faster responses
- [ ] Add WebSocket for real-time updates
- [ ] Add push notifications for significant events
- [ ] Add historical data queries
- [ ] Add earthquake alerts/notifications

---

## Volcanoes

### Status: ⏳ **Coming Soon**

Volcano data will be implemented in Phase 2. Options:
1. PHIVOLCS bulletins (web scraping)
2. Smithsonian GVP (updated weekly)
3. Manual curation

See `NEXT_STEPS.md` for implementation guide.

---

## Resources

- **USGS Earthquake API**: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
- **USGS FDSNWS**: https://earthquake.usgs.gov/fdsnws/event/1/
- **API Documentation**: https://earthquake.usgs.gov/earthquakes/feed/v1.0/

