'use client'

import { useState, useMemo } from 'react'
import { Earthquake } from '@/types/hazard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Download,
  MapPin,
  Calendar,
  Gauge,
  Activity
} from 'lucide-react'

interface EarthquakeTableProps {
  earthquakes: Earthquake[]
  onEarthquakeSelect: (earthquake: Earthquake) => void
}

type SortField = 'magnitude' | 'timestamp' | 'depth' | 'place'
type SortDirection = 'asc' | 'desc'

export function EarthquakeTable({ earthquakes, onEarthquakeSelect }: EarthquakeTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Filter and sort earthquakes
  const filteredAndSortedEarthquakes = useMemo(() => {
    // No need to filter by time range - the API already filters by time range
    // The earthquakes array already contains only the data for the selected time range
    
    // Filter by search term only
    const filtered = earthquakes.filter(eq =>
      eq.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.magnitude.toString().includes(searchTerm)
    )

    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number

      switch (sortField) {
        case 'magnitude':
          aValue = a.magnitude
          bValue = b.magnitude
          break
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'depth':
          aValue = a.depth
          bValue = b.depth
          break
        case 'place':
          aValue = a.place.toLowerCase()
          bValue = b.place.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [earthquakes, searchTerm, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEarthquakes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEarthquakes = filteredAndSortedEarthquakes.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7) return 'bg-red-500'
    if (magnitude >= 6) return 'bg-orange-500'
    if (magnitude >= 5) return 'bg-yellow-500'
    if (magnitude >= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getAlertBadge = (alert?: string) => {
    if (!alert) return null
    
    const colors = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={colors[alert as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {alert.toUpperCase()}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Magnitude', 'Location', 'Depth (km)', 'Time', 'Alert', 'Tsunami']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedEarthquakes.map(eq => [
        eq.magnitude,
        `"${eq.place}"`,
        eq.depth,
        new Date(eq.timestamp).toISOString(),
        eq.alert || '',
        eq.tsunami ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earthquakes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </span>
    </Button>
  )

  if (earthquakes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Earthquake List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No earthquake data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Earthquake List ({filteredAndSortedEarthquakes.length} total)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, magnitude..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton field="magnitude">
                    <Gauge className="h-4 w-4 mr-1" />
                    Magnitude
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="place">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="depth">
                    Depth (km)
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="timestamp">
                    <Calendar className="h-4 w-4 mr-1" />
                    Time
                  </SortButton>
                </TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Tsunami</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEarthquakes.map((earthquake) => (
                <TableRow 
                  key={earthquake.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onEarthquakeSelect(earthquake)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getMagnitudeColor(earthquake.magnitude)}`} />
                      <span className="font-medium">M{earthquake.magnitude}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{earthquake.place}</p>
                      <p className="text-sm text-muted-foreground truncate">{earthquake.location}</p>
                    </div>
                  </TableCell>
                  <TableCell>{earthquake.depth.toFixed(1)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatTimestamp(earthquake.timestamp)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAlertBadge(earthquake.alert)}
                  </TableCell>
                  <TableCell>
                    {earthquake.tsunami ? (
                      <Badge variant="destructive">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedEarthquakes.length)} of {filteredAndSortedEarthquakes.length} earthquakes
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
