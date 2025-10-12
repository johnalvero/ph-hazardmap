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
              PH Hazard Map provides real-time visualization of natural hazards including earthquakes and volcanic activity.
            </p>
          </div>
          
          <div className="space-y-1 text-xs">
            <p className="font-semibold">Data Sources:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Earthquakes:</strong> USGS Real-time Feed (Official)</li>
              <li><strong>Volcanoes:</strong> Demo data (PHIVOLCS format)</li>
              <li><strong>Fault Lines:</strong> GEM Global Active Faults (Scientific, peer-reviewed)</li>
            </ul>
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

