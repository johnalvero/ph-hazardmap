'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronUp, Info } from 'lucide-react'

interface MapLegendProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function MapLegend({ isCollapsed, onToggle }: MapLegendProps) {
  if (isCollapsed) {
    return (
      <Button
        onClick={onToggle}
        size="sm"
        className="shadow-lg h-10 w-10 p-0 bg-primary/90 backdrop-blur-sm text-primary-foreground border border-primary/30 hover:bg-primary hover:scale-105 transition-all duration-200 rounded-full"
        title="Open Legend"
      >
        <Info className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Legend</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-accent transition-all duration-200"
            onClick={onToggle}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Earthquakes */}
        <div>
          <p className="font-semibold mb-2">🌎 Earthquakes</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>M 7.0+ (Major)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>M 6.0 - 6.9 (Strong)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>M 5.0 - 5.9 (Moderate)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span>M 4.0 - 4.9 (Light)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>M &lt; 4.0 (Minor)</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Volcanoes */}
        <div>
          <p className="font-semibold mb-2">🌋 Volcanoes</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2 L14 14 L2 14 Z" fill="#ef4444" stroke="white" strokeWidth="1" />
              </svg>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2 L14 14 L2 14 Z" fill="#f97316" stroke="white" strokeWidth="1" />
              </svg>
              <span>Watch</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2 L14 14 L2 14 Z" fill="#eab308" stroke="white" strokeWidth="1" />
              </svg>
              <span>Advisory</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 2 L14 14 L2 14 Z" fill="#6b7280" stroke="white" strokeWidth="1" />
              </svg>
              <span>Normal</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Fault Lines */}
        <div>
          <p className="font-semibold mb-2">⚠️ Fault Lines</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <svg width="20" height="12" viewBox="0 0 20 12">
                <line x1="0" y1="6" x2="20" y2="6" stroke="#ef4444" strokeWidth="3" strokeDasharray="2,2" opacity="0.9" />
              </svg>
              <span className="text-xs">Major (High Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="12" viewBox="0 0 20 12">
                <line x1="0" y1="6" x2="20" y2="6" stroke="#f97316" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
              </svg>
              <span className="text-xs text-muted-foreground">Minor (Moderate)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="12" viewBox="0 0 20 12">
                <line x1="0" y1="6" x2="20" y2="6" stroke="#eab308" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
              </svg>
              <span className="text-xs text-muted-foreground">Minor (Low)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

