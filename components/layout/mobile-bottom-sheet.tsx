'use client'

import { useState } from 'react'
import { HazardEvent } from '@/types/hazard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { formatDate, formatDistance, formatMagnitude } from '@/lib/utils'

interface MobileBottomSheetProps {
  event: HazardEvent | null
  onClose: () => void
}

export function MobileBottomSheet({ event, onClose }: MobileBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!event) return null

  const isEarthquake = event.type === 'earthquake'

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl transition-transform duration-300 ${
        isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'
      }`}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isEarthquake ? '🌎' : '🌋'}</span>
          <div>
            <p className="font-semibold">
              {isEarthquake ? `M ${formatMagnitude(event.magnitude)}` : event.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {isEarthquake ? event.place : event.location}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="max-h-[50vh] overflow-y-auto p-4 pt-0 space-y-4">
          {isEarthquake ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{formatDate(event.timestamp)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Depth</p>
                  <p className="font-medium">{formatDistance(event.depth)}</p>
                </div>
              </div>
              {event.alert && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Alert Level</p>
                  <Badge>{event.alert.toUpperCase()}</Badge>
                </div>
              )}
              {event.url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(event.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge>{event.status.toUpperCase()}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Elevation</p>
                  <p className="font-medium">{event.elevation.toLocaleString()} m</p>
                </div>
              </div>
              {event.description && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
          )}
          
          <Button
            variant="destructive"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  )
}

