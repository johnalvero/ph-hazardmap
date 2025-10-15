'use client'

import { useState } from 'react'
import { FilterState } from '@/types/hazard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Filter, ChevronUp, Clock } from 'lucide-react'

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  

  const updateFilters = (updates: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...updates })
  }

  const toggleHazardType = (type: 'earthquake' | 'volcano' | 'typhoon') => {
    const newTypes = filters.hazardTypes.includes(type)
      ? filters.hazardTypes.filter(t => t !== type)
      : [...filters.hazardTypes, type]
    
    updateFilters({ hazardTypes: newTypes })
  }

  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-[100]">
        <Button
          onClick={() => {
            setIsCollapsed(false)
          }}
          size="sm"
          className="shadow-lg h-10 w-10 p-0 bg-primary/90 backdrop-blur-sm text-primary-foreground border border-primary/30 hover:bg-primary hover:scale-105 transition-all duration-200 rounded-full"
          title="Open Filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="absolute top-4 left-4 z-10 w-full sm:w-80 max-w-md px-4 sm:px-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <Card className="shadow-xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-accent transition-all duration-200"
              onClick={() => {
                setIsCollapsed(true)
              }}
            >
              <ChevronUp className="h-4 w-4" />
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
            <div className="flex items-center justify-between">
              <label htmlFor="typhoon" className="text-sm">
                🌀 Typhoons
              </label>
              <Switch
                id="typhoon"
                checked={filters.hazardTypes.includes('typhoon')}
                onCheckedChange={() => toggleHazardType('typhoon')}
              />
            </div>
          </div>

          <Separator />

          {/* Time Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Time Range</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Days Ago:</label>
                <span className="text-xs font-medium">
                  {filters.daysAgo === 0 ? 'Today' : 
                   filters.daysAgo === 1 ? '1 day ago' : 
                   `${filters.daysAgo} days ago`}
                </span>
              </div>
              <Slider
                value={[filters.daysAgo]}
                onValueChange={(value) => updateFilters({ daysAgo: value[0] })}
                min={0}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Today</span>
                <span>30 days</span>
              </div>
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
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full"
          onClick={() => {
            updateFilters({
              hazardTypes: ['earthquake', 'volcano'],
              daysAgo: 7,
              magnitudeRange: { min: 0, max: 10 },
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

