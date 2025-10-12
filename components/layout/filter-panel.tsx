'use client'

import { useState } from 'react'
import { FilterState } from '@/types/hazard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Filter, ChevronLeft, CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateFilters = (updates: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...updates })
  }

  const toggleHazardType = (type: 'earthquake' | 'volcano') => {
    const newTypes = filters.hazardTypes.includes(type)
      ? filters.hazardTypes.filter(t => t !== type)
      : [...filters.hazardTypes, type]
    
    updateFilters({ hazardTypes: newTypes })
  }

  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={() => setIsCollapsed(false)}
          size="icon"
          className="shadow-lg"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="absolute top-4 left-4 z-10 w-full sm:w-80 max-w-md px-4 sm:px-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Customize hazard visualization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hazard Types */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Hazard Types</h4>
            <div className="flex items-center justify-between">
              <label htmlFor="earthquake" className="text-sm">
                🌎 Earthquakes
              </label>
              <Switch
                id="earthquake"
                checked={filters.hazardTypes.includes('earthquake')}
                onCheckedChange={() => toggleHazardType('earthquake')}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="volcano" className="text-sm">
                🌋 Volcanoes
              </label>
              <Switch
                id="volcano"
                checked={filters.hazardTypes.includes('volcano')}
                onCheckedChange={() => toggleHazardType('volcano')}
              />
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Date Range</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">From:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start ? format(filters.dateRange.start, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) => updateFilters({ dateRange: { ...filters.dateRange, start: date || null } })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">To:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.end ? format(filters.dateRange.end, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) => updateFilters({ dateRange: { ...filters.dateRange, end: date || null } })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  const now = new Date()
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                  updateFilters({ dateRange: { start: weekAgo, end: now } })
                }}
              >
                7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  const now = new Date()
                  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                  updateFilters({ dateRange: { start: monthAgo, end: now } })
                }}
              >
                30 days
              </Button>
            </div>
          </div>

          <Separator />

          {/* Magnitude Range */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Earthquake Magnitude: {filters.magnitudeRange.min.toFixed(1)} - {filters.magnitudeRange.max.toFixed(1)}
            </h4>
            <Slider
              min={0}
              max={10}
              step={0.1}
              value={[filters.magnitudeRange.min, filters.magnitudeRange.max]}
              onValueChange={([min, max]) => 
                updateFilters({ magnitudeRange: { min, max } })
              }
              className="w-full"
            />
          </div>

          <Separator />

          {/* Base Layers */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Base Layers</h4>
          <div className="flex items-center justify-between">
            <label htmlFor="majorfaults" className="text-sm">
              ⚠️ Major Fault Lines
            </label>
            <Switch
              id="majorfaults"
              checked={filters.showMajorFaults}
              onCheckedChange={(checked) => 
                updateFilters({ showMajorFaults: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="minorfaults" className="text-sm text-muted-foreground">
              Minor Fault Lines
            </label>
            <Switch
              id="minorfaults"
              checked={filters.showMinorFaults}
              onCheckedChange={(checked) => 
                updateFilters({ showMinorFaults: checked })
              }
            />
          </div>
            <div className="flex items-center justify-between">
              <label htmlFor="population" className="text-sm">
                Population Density
              </label>
              <Switch
                id="population"
                checked={filters.showPopulation}
                onCheckedChange={(checked) => 
                  updateFilters({ showPopulation: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="boundaries" className="text-sm">
                Admin Boundaries
              </label>
              <Switch
                id="boundaries"
                checked={filters.showAdminBoundaries}
                onCheckedChange={(checked) => 
                  updateFilters({ showAdminBoundaries: checked })
                }
              />
            </div>
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full"
          onClick={() => {
            const now = new Date()
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            updateFilters({
              hazardTypes: ['earthquake', 'volcano'],
              dateRange: { start: weekAgo, end: now },
              magnitudeRange: { min: 0, max: 10 },
              showPopulation: false,
              showAdminBoundaries: false,
              showMajorFaults: true,
              showMinorFaults: false
            })
          }}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

