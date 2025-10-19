'use client'

import { Earthquake } from '@/types/hazard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, MapPin, Clock, Activity, Gauge } from 'lucide-react'

interface EarthquakeStatsProps {
  earthquakes: Earthquake[]
  timeRangeDays: number
}

export function EarthquakeStats({ earthquakes, timeRangeDays }: EarthquakeStatsProps) {
  // No need to filter here - the API already filters by time range
  // The earthquakes array already contains only the data for the selected time range
  
  if (earthquakes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earthquakes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data available for {timeRangeDays} {timeRangeDays === 1 ? 'day' : 'days'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate statistics using all earthquakes (already filtered by API)
  const totalCount = earthquakes.length
  const averageMagnitude = earthquakes.reduce((sum, eq) => sum + eq.magnitude, 0) / totalCount
  const strongestEarthquake = earthquakes.reduce((max, eq) => 
    eq.magnitude > max.magnitude ? eq : max
  )
  const latestEarthquake = earthquakes.reduce((latest, eq) => 
    new Date(eq.timestamp) > new Date(latest.timestamp) ? eq : latest
  )
  const averageDepth = earthquakes.reduce((sum, eq) => sum + eq.depth, 0) / totalCount
  const minDepth = Math.min(...earthquakes.map(eq => eq.depth))
  const maxDepth = Math.max(...earthquakes.map(eq => eq.depth))

  const formatLocation = (place: string) => {
    return place.length > 30 ? place.substring(0, 30) + '...' : place
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const eqTime = new Date(timestamp)
    const diffMs = now.getTime() - eqTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}m ago`
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earthquakes</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            in selected time range
          </p>
        </CardContent>
      </Card>

      {/* Average Magnitude */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Magnitude</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageMagnitude.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Richter scale
          </p>
        </CardContent>
      </Card>

      {/* Strongest Earthquake */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Strongest</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">M{strongestEarthquake.magnitude.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {formatLocation(strongestEarthquake.place)}
          </p>
        </CardContent>
      </Card>

      {/* Latest Earthquake */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">M{latestEarthquake.magnitude.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {formatTimeAgo(latestEarthquake.timestamp)}
          </p>
        </CardContent>
      </Card>

      {/* Average Depth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Depth</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageDepth.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            kilometers
          </p>
        </CardContent>
      </Card>

      {/* Depth Range */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Depth Range</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{minDepth.toFixed(1)} - {maxDepth.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            km (min - max)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
