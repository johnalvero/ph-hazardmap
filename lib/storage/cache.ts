import NodeCache from 'node-cache'
import { Volcano } from '@/types/hazard'

// Shared in-memory cache instance
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes TTL
  checkperiod: 60 // Check for expired keys every minute
})

export const volcanoCache = cache

/**
 * Get volcano data from cache
 */
export function getVolcanoesFromCache(): Volcano[] | null {
  const data = cache.get('phivolcs-volcanoes')
  return data ? (Array.isArray(data) ? data : []) : null
}

/**
 * Set volcano data in cache
 */
export function setVolcanoesInCache(volcanoes: Volcano[]): void {
  cache.set('phivolcs-volcanoes', volcanoes, 300) // 5 minutes TTL
}

/**
 * Clear volcano data from cache
 */
export function clearVolcanoesCache(): void {
  cache.del('phivolcs-volcanoes')
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    keys: cache.keys(),
    stats: cache.getStats()
  }
}
