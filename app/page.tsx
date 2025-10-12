'use client'

import { useState, useEffect } from 'react'
import { MapContainer } from '@/components/map/map-container'
import { FilterPanel } from '@/components/layout/filter-panel'
import { EventDetailsPanel } from '@/components/layout/event-details-panel'
import { MobileBottomSheet } from '@/components/layout/mobile-bottom-sheet'
import { Header } from '@/components/layout/header'
import { MapLegend } from '@/components/map/legend'
import { HazardEvent, FilterState } from '@/types/hazard'

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState<HazardEvent | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    hazardTypes: ['earthquake', 'volcano'],
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date() // now
    },
    magnitudeRange: {
      min: 0,
      max: 10
    },
    showPopulation: false,
    showAdminBoundaries: false,
    showMajorFaults: true,
    showMinorFaults: false
  })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 relative">
        <MapContainer 
          filters={filters}
          selectedEvent={selectedEvent}
          onEventSelect={setSelectedEvent}
        />
        <FilterPanel 
          filters={filters}
          onFilterChange={setFilters}
        />
        
        {/* Desktop: Event details panel on right */}
        {selectedEvent && !isMobile && (
          <EventDetailsPanel 
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
        
        {/* Mobile: Bottom sheet */}
        {isMobile && (
          <MobileBottomSheet 
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}

        {/* Map Legend - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 hidden md:block">
          <MapLegend />
        </div>
      </div>
    </div>
  )
}

