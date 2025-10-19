'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Earthquake, TimeRangePreset } from '@/types/hazard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EarthquakeStats } from '@/components/dashboard/earthquake-stats'
import { EarthquakeCharts } from '@/components/dashboard/earthquake-charts'
import { EarthquakeTable } from '@/components/dashboard/earthquake-table'
import { 
  ArrowLeft, 
  Activity,
  TrendingUp,
  Table as TableIcon,
  Map,
  RefreshCw
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('stats')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('7d')
  const [daysAgo, setDaysAgo] = useState(7)

  const fetchEarthquakes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/earthquakes?daysAgo=${daysAgo}&magnitude=all`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch earthquakes')
      }
      
      const data = await response.json()
      setEarthquakes(data.earthquakes)
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Error fetching earthquakes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load earthquakes')
    } finally {
      setIsLoading(false)
    }
  }, [daysAgo])

  useEffect(() => {
    fetchEarthquakes()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchEarthquakes])

  const handleTimeRangePreset = (preset: TimeRangePreset) => {
    let newDaysAgo = daysAgo
    
    switch (preset) {
      case '24h':
        newDaysAgo = 1
        break
      case '7d':
        newDaysAgo = 7
        break
      case '30d':
        newDaysAgo = 30
        break
      case 'custom':
        // Keep current daysAgo value
        break
    }
    
    setTimeRangePreset(preset)
    setDaysAgo(newDaysAgo)
  }

  const handleEarthquakeSelect = (earthquake: Earthquake) => {
    // Navigate back to main page with selected earthquake
    router.push(`/?selected=${earthquake.id}`)
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never'
    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return lastUpdated.toLocaleString()
  }

  if (isLoading && earthquakes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading earthquake data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Map
              </Button>
              <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Earthquake Analytics</h1>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Time Range Presets */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Time Range:</span>
                <div className="flex gap-1">
                  <Button
                    variant={timeRangePreset === '24h' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangePreset('24h')}
                    className="text-xs h-8 px-2"
                  >
                    24h
                  </Button>
                  <Button
                    variant={timeRangePreset === '7d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangePreset('7d')}
                    className="text-xs h-8 px-2"
                  >
                    7d
                  </Button>
                  <Button
                    variant={timeRangePreset === '30d' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangePreset('30d')}
                    className="text-xs h-8 px-2"
                  >
                    30d
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Last updated: {formatLastUpdated()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEarthquakes}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                <p className="font-medium">Error loading earthquake data</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {earthquakes.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No Earthquake Data</h3>
                <p className="text-muted-foreground mb-4">
                  No earthquakes found for the selected time range. Try adjusting the filters or check back later.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2"
                >
                  <Map className="h-4 w-4" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Earthquake Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Earthquakes</p>
                    <p className="text-2xl font-bold text-primary">{earthquakes.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Range</p>
                    <p className="text-lg font-semibold">Last {daysAgo} {daysAgo === 1 ? 'day' : 'days'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-lg font-semibold">{formatLastUpdated()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                <TabsTrigger value="stats" className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Charts</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2 text-sm">
                  <TableIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Data Table</span>
                  <span className="sm:hidden">Table</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="space-y-6">
                <EarthquakeStats earthquakes={earthquakes} timeRangeDays={daysAgo} />
              </TabsContent>

              <TabsContent value="charts" className="space-y-6">
                <EarthquakeCharts earthquakes={earthquakes} timeRangeDays={daysAgo} />
              </TabsContent>

              <TabsContent value="table" className="space-y-6">
                <EarthquakeTable 
                  earthquakes={earthquakes} 
                  onEarthquakeSelect={handleEarthquakeSelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            View on Map
          </Button>
          <Button
            variant="outline"
            onClick={fetchEarthquakes}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
}
