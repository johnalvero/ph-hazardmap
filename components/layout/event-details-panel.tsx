'use client'

import { HazardEvent } from '@/types/hazard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { X, ExternalLink, MapPin, Activity, Calendar, Layers } from 'lucide-react'
import { formatDate, formatDistance, formatMagnitude, getAlertLevelColor } from '@/lib/utils'

interface EventDetailsPanelProps {
  event: HazardEvent
  onClose: () => void
}

export function EventDetailsPanel({ event, onClose }: EventDetailsPanelProps) {
  const isEarthquake = event.type === 'earthquake'

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7) return 'bg-red-500'
    if (magnitude >= 6) return 'bg-orange-500'
    if (magnitude >= 5) return 'bg-yellow-500'
    if (magnitude >= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getAlertColor = (alert?: string) => {
    switch (alert) {
      case 'red': return 'destructive'
      case 'orange': return 'default'
      case 'yellow': return 'secondary'
      case 'green': return 'outline'
      default: return 'outline'
    }
  }

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
    <div className="absolute top-4 right-4 z-10 w-full sm:w-96 max-w-md px-4 sm:px-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {isEarthquake ? '🌎' : '🌋'}
                </span>
                <CardTitle className="text-lg">
                  {isEarthquake ? 'Earthquake' : event.name}
                </CardTitle>
              </div>
              {isEarthquake && (
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getMagnitudeColor(event.magnitude)}`} />
                  <span className="text-2xl font-bold">
                    M {formatMagnitude(event.magnitude)}
                  </span>
                </div>
              )}
              {!isEarthquake && (
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${getAlertLevelColor(event.activityLevel)}`} />
                  <span className="text-2xl font-bold">
                    Level {event.activityLevel}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {isEarthquake ? event.place : event.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEarthquake ? (
            <>
              {/* Earthquake Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Layers className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Depth</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistance(event.depth)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Coordinates</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {event.coordinates[1].toFixed(4)}°, {event.coordinates[0].toFixed(4)}°
                    </p>
                  </div>
                </div>

                {event.alert && (
                  <div className="flex items-start gap-2">
                    <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Alert Level</p>
                      <Badge variant={getAlertColor(event.alert)} className="mt-1">
                        {event.alert.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}

                {event.tsunami && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm font-semibold text-destructive">
                      ⚠️ Tsunami Warning
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {event.url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(event.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on USGS
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Volcano Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={getStatusColor(event.status)} className="mt-1">
                      {event.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>


                <div className="flex items-start gap-2">
                  <Layers className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Elevation</p>
                    <p className="text-sm text-muted-foreground">
                      {event.elevation.toLocaleString()} m
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.country}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {event.coordinates[1].toFixed(4)}°, {event.coordinates[0].toFixed(4)}°
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Update</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.lastUpdate)}
                    </p>
                  </div>
                </div>


                {/* Parameters Section */}
                {event.parameters && Object.keys(event.parameters).length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-green-500 rounded-sm"></div>
                        <div className="w-1 h-3 bg-red-500 rounded-sm"></div>
                        <div className="w-1 h-3 bg-blue-500 rounded-sm"></div>
                      </div>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        Monitoring Parameters
                      </p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(event.parameters).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <div className="flex">
                            <span className="text-blue-700 dark:text-blue-300 font-medium min-w-0 flex-shrink-0">
                              {key}:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 ml-2 break-words">
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Should Not Be Allowed Section */}
                {event.shouldNotBeAllowed && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-3">
                      Should not be allowed:
                    </p>
                    <div className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                      <ul className="ml-4 space-y-1">
                        {event.shouldNotBeAllowed.split(';').map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2 mt-0.5">•</span>
                            <span>{item.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Reminder Section */}
                {event.reminder && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                      Reminder:
                    </p>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">
                      <ul className="ml-4 space-y-1">
                        {event.reminder.split(';').map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                            <span>{item.trim()}</span>
                          </li>
                        ))}
                      </ul>
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
            </>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground italic">
            Data from official sources. Always verify during emergencies.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

