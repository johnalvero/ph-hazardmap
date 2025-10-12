'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function MapLegend() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Legend</CardTitle>
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

