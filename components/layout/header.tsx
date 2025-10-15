'use client'

import { Mountain, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function Header() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <header className="bg-background border-b border-border px-4 py-3 shadow-sm z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mountain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">PH Hazard Map</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Real-time hazard monitoring for safer communities
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className="relative"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showInfo && (
        <div className="mt-4 p-4 bg-muted rounded-lg text-sm space-y-3">
          <div>
            <h3 className="font-semibold mb-2">About PH Hazard Map</h3>
            <p className="text-muted-foreground mb-2">
              PH Hazard Map provides real-time visualization of natural hazards including earthquakes, volcanic activity, and typhoons across the Pacific Ring of Fire region, with special focus on tsunami risk assessment for the Philippines. Volcano data includes AI-powered insights for citizen-friendly guidance.
            </p>
          </div>
          
          <div className="space-y-1 text-xs">
            <p className="font-semibold">Data Sources:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Earthquakes:</strong> USGS Pacific Ring of Fire (-10.0°N-50.0°N, 100.0°E-160.0°E)</li>
              <li><strong>Volcanoes:</strong> Real-time PHIVOLCS bulletins with AI insights</li>
              <li><strong>Typhoons:</strong> NHC RSS Feeds (Atlantic & Eastern Pacific)</li>
              <li><strong>Fault Lines:</strong> GEM Global Active Faults (Scientific, peer-reviewed)</li>
            </ul>
          </div>

          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
            <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">🤖 AI-Powered Insights</p>
            <p className="text-blue-700 dark:text-blue-300">
              Volcano data is enhanced with AI-generated insights using AWS Bedrock (Claude 3 Haiku) to provide citizen-friendly explanations and recommendations.
            </p>
          </div>

          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs">
            <p className="font-semibold text-orange-800 dark:text-orange-200 mb-1">🌀 Typhoon Data</p>
            <p className="text-orange-700 dark:text-orange-300">
              Real-time typhoon data from{' '}
              <a href="https://www.nhc.noaa.gov/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                National Hurricane Center (NHC)
              </a>
              {' '}RSS feeds. Updates every 6 hours (00, 06, 12, 18 UTC). Covers Atlantic and Eastern Pacific basins.
            </p>
          </div>

          <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs">
            <p className="font-semibold text-green-800 dark:text-green-200 mb-1">✅ GEM Fault Data</p>
            <p className="text-green-700 dark:text-green-300">
              Fault lines from the{' '}
              <a href="https://github.com/GEMScienceTools/gem-global-active-faults" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                GEM Global Active Faults Database
              </a>
              {' '}(CC BY-SA 4.0). 162 faults mapped in the Philippines.
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            Always verify critical information with official sources during emergencies.
          </p>
        </div>
      )}
    </header>
  )
}

