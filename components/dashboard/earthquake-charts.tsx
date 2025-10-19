'use client'

import { Earthquake } from '@/types/hazard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { TrendingUp, Activity, BarChart3 } from 'lucide-react'

interface EarthquakeChartsProps {
  earthquakes: Earthquake[]
  timeRangeDays: number
}

export function EarthquakeCharts({ earthquakes, timeRangeDays }: EarthquakeChartsProps) {
  // No need to filter here - the API already filters by time range
  // The earthquakes array already contains only the data for the selected time range
  
  if (earthquakes.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Earthquake Visualizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No earthquake data available for the selected time range ({timeRangeDays} {timeRangeDays === 1 ? 'day' : 'days'})
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for magnitude over time chart
  const magnitudeOverTimeData = earthquakes
    .map(eq => ({
      time: new Date(eq.timestamp).toLocaleDateString(),
      magnitude: eq.magnitude,
      timestamp: eq.timestamp,
      place: eq.place,
      depth: eq.depth
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Group earthquakes by date for tooltip and calculate representative magnitude
  const magnitudeOverTime = magnitudeOverTimeData.reduce((acc, eq) => {
    const existingDate = acc.find(item => item.time === eq.time)
    if (existingDate) {
      existingDate.earthquakes.push(eq)
      // Update to show the highest magnitude earthquake of the day
      if (eq.magnitude > existingDate.magnitude) {
        existingDate.magnitude = eq.magnitude
        existingDate.timestamp = eq.timestamp
      }
    } else {
      acc.push({
        time: eq.time,
        magnitude: eq.magnitude,
        timestamp: eq.timestamp,
        earthquakes: [eq]
      })
    }
    return acc
  }, [] as Array<{
    time: string
    magnitude: number
    timestamp: string
    earthquakes: Array<{
      time: string
      magnitude: number
      timestamp: string
      place: string
      depth: number
    }>
  }>)

  // Prepare data for magnitude vs depth scatter plot
  const magnitudeVsDepth = earthquakes.map(eq => ({
    magnitude: eq.magnitude,
    depth: eq.depth,
    place: eq.place,
    timestamp: eq.timestamp
  }))

  // Prepare data for magnitude distribution histogram
  const magnitudeRanges = [
    { range: '0-2', min: 0, max: 2, count: 0, color: '#22c55e', earthquakes: [] as Earthquake[] },
    { range: '2-4', min: 2, max: 4, count: 0, color: '#3b82f6', earthquakes: [] as Earthquake[] },
    { range: '4-6', min: 4, max: 6, count: 0, color: '#eab308', earthquakes: [] as Earthquake[] },
    { range: '6-8', min: 6, max: 8, count: 0, color: '#f97316', earthquakes: [] as Earthquake[] },
    { range: '8+', min: 8, max: 10, count: 0, color: '#ef4444', earthquakes: [] as Earthquake[] }
  ]

  // Count earthquakes in each magnitude range and store the actual earthquakes
  magnitudeRanges.forEach(range => {
    const earthquakesInRange = earthquakes.filter(eq => {
      if (range.max === 10) {
        // For 8+ range, include all earthquakes >= 8
        return eq.magnitude >= range.min
      } else {
        // For other ranges, use standard range logic
        return eq.magnitude >= range.min && eq.magnitude < range.max
      }
    })
    range.count = earthquakesInRange.length
    range.earthquakes = earthquakesInRange
  })

  // Prepare hourly activity data (last 24 hours)
  const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - (23 - i), 0, 0, 0)
    const nextHour = new Date(hour)
    nextHour.setHours(nextHour.getHours() + 1)
    
    const earthquakesInHour = earthquakes.filter(eq => {
      const eqTime = new Date(eq.timestamp)
      return eqTime >= hour && eqTime < nextHour
    })

    return {
      hour: hour.getHours(),
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
      count: earthquakesInHour.length,
      earthquakes: earthquakesInHour // Store the actual earthquakes for tooltip
    }
  })


  const ScatterTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { place: string; magnitude: number; depth: number; timestamp: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.place}</p>
          <p className="text-primary">Magnitude: {data.magnitude.toFixed(2)}</p>
          <p className="text-muted-foreground">Depth: {data.depth} km</p>
          <p className="text-xs text-muted-foreground">
            {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  const HourlyActivityTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { time: string; count: number; earthquakes: Earthquake[]; hour: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const earthquakes = data.earthquakes || []
      const hour = data.hour
      const nextHour = (hour + 1) % 24
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium mb-1">Hour: {data.time}</p>
          <p className="text-xs text-muted-foreground mb-2">
            {hour.toString().padStart(2, '0')}:00 - {nextHour.toString().padStart(2, '0')}:00
          </p>
          <p className="text-primary mb-2 font-semibold">Earthquakes: {data.count}</p>
          
          {earthquakes.length > 0 ? (
            <div className="space-y-2">
              {earthquakes.map((eq, index) => (
                <div key={index} className="text-sm border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <p className="font-medium text-foreground">{eq.place}</p>
                  <p className="text-primary font-semibold">Magnitude: {eq.magnitude.toFixed(2)}</p>
                  <p className="text-muted-foreground">Depth: {eq.depth.toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(eq.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No earthquakes in this hour</p>
          )}
        </div>
      )
    }
    return null
  }

  const MagnitudeDistributionTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { range: string; count: number; earthquakes: Earthquake[]; color: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const earthquakes = data.earthquakes || []
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium mb-1">Magnitude Range: {data.range}</p>
          <p className="text-primary mb-2 font-semibold">Earthquakes: {data.count}</p>
          
          {earthquakes.length > 0 ? (
            <div className="space-y-2">
              {earthquakes.map((eq, index) => (
                <div key={index} className="text-sm border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <p className="font-medium text-foreground">{eq.place}</p>
                  <p className="text-primary font-semibold">Magnitude: {eq.magnitude.toFixed(2)}</p>
                  <p className="text-muted-foreground">Depth: {eq.depth.toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(eq.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No earthquakes in this magnitude range</p>
          )}
        </div>
      )
    }
    return null
  }

  const MagnitudeOverTimeTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { time: string; magnitude: number; timestamp: string; earthquakes: Array<{ time: string; magnitude: number; timestamp: string; place: string; depth: number }> } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const earthquakes = data.earthquakes || []
      
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium mb-1">Date: {data.time}</p>
          <p className="text-primary mb-1 font-semibold">Highest Magnitude: {data.magnitude.toFixed(2)}</p>
          <p className="text-muted-foreground mb-2 text-sm">Total Earthquakes: {earthquakes.length}</p>
          
          {earthquakes.length > 0 ? (
            <div className="space-y-2">
              {earthquakes.map((eq, index) => (
                <div key={index} className="text-sm border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <p className="font-medium text-foreground">{eq.place}</p>
                  <p className="text-primary font-semibold">Magnitude: {eq.magnitude.toFixed(2)}</p>
                  <p className="text-muted-foreground">Depth: {eq.depth.toFixed(1)} km</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(eq.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No earthquakes on this date</p>
          )}
        </div>
      )
    }
    return null
  }


  return (
    <div className="space-y-6">
      {/* Magnitude Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Highest Magnitude Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={magnitudeOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<MagnitudeOverTimeTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="magnitude" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Magnitude vs Depth Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Magnitude vs Depth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={magnitudeVsDepth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="magnitude" 
                  name="Magnitude"
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="depth" 
                  name="Depth (km)"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter 
                  dataKey="depth" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Magnitude Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Magnitude Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={magnitudeRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<MagnitudeDistributionTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {magnitudeRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Activity (Last 24 Hours) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Hourly Activity (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<HourlyActivityTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
