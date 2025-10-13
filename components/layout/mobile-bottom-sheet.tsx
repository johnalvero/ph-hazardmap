'use client'

import { useState } from 'react'
import { HazardEvent } from '@/types/hazard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronDown, ChevronUp, ExternalLink, MapPin, Activity, Calendar, Layers } from 'lucide-react'
import { formatDate, formatDistance, formatMagnitude, getAlertLevelColor } from '@/lib/utils'

interface MobileBottomSheetProps {
  event: HazardEvent | null
  onClose: () => void
}

export function MobileBottomSheet({ event, onClose }: MobileBottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!event) return null

  const isEarthquake = event.type === 'earthquake'


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'destructive'
      case 'watch': return 'default'
      case 'advisory': return 'secondary'
      case 'normal': return 'outline'
      default: return 'outline'
    }
  }

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
        <div className="max-h-[70vh] overflow-y-auto p-4 pt-0 space-y-4">
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
            <div className="space-y-4">
              {/* Header with Alert Level */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌋</span>
                <div>
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${getAlertLevelColor(event.activityLevel)}`} />
                    <span className="text-lg font-bold">Level {event.activityLevel}</span>
                  </div>
                </div>
              </div>

              {/* Two-column layout for key info */}
              <div className="grid grid-cols-2 gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={getStatusColor(event.status)}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{event.elevation.toLocaleString()} m</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Elevation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{event.location}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Location</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(event.lastUpdate)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last Update</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Description */}
              {event.description && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Monitoring Parameters */}
              {event.parameters && Object.keys(event.parameters).length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      Monitoring Parameters
                    </p>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(event.parameters).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          {key}:
                        </span>
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Should not be allowed */}
              {event.shouldNotBeAllowed && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    Should not be allowed:
                  </p>
                  <div className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                    {event.shouldNotBeAllowed.split('\n').map((line, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-0.5">•</span>
                        <span>{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder */}
              {event.reminder && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Reminder:
                  </p>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                    {event.reminder.split('\n').map((line, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                        <span>{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight Section */}
              {event.aiInsight && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      AI Insight
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Summary */}
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Summary
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        {event.aiInsight.summary}
                      </p>
                    </div>

                    {/* Risk Assessment */}
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Risk Assessment
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        {event.aiInsight.riskAssessment}
                      </p>
                    </div>

                    {/* Key Points */}
                    {event.aiInsight.keyPoints && event.aiInsight.keyPoints.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                          Key Points
                        </p>
                        <ul className="space-y-1">
                          {event.aiInsight.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start text-xs text-blue-600 dark:text-blue-400">
                              <span className="text-blue-500 mr-2 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {event.aiInsight.recommendations && event.aiInsight.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                          Recommendations
                        </p>
                        <ul className="space-y-1">
                          {event.aiInsight.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start text-xs text-blue-600 dark:text-blue-400">
                              <span className="text-blue-500 mr-2 mt-0.5">•</span>
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bulletin Link */}
              {event.bulletinUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(event.bulletinUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View PHIVOLCS Bulletin
                </Button>
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

