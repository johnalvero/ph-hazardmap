import * as cheerio from 'cheerio'
import { Volcano } from '@/types/hazard'
import fetch from 'node-fetch'
import https from 'https'

const BASE_URL = 'https://wovodat.phivolcs.dost.gov.ph'
const BULLETIN_LIST_URL = `${BASE_URL}/bulletin/list-of-bulletin`

// User-Agent to mimic a normal browser
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Add delay between requests to avoid overwhelming the server
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch HTML content from a URL
 */
async function fetchHtml(url: string): Promise<string> {
  try {
    console.log(`🌐 Fetching: ${url}`)
    
    // Create HTTPS agent that ignores SSL certificate issues
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    })
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      agent: httpsAgent
    })

    console.log(`📡 Response status: ${response.status} ${response.statusText}`)
    console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`📄 HTML length: ${html.length} characters`)
    console.log(`📄 HTML preview: ${html.substring(0, 200)}...`)
    
    return html
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error)
    throw error
  }
}

/**
 * Parse bulletin list page to extract bulletin URLs
 */
async function getBulletinUrls(): Promise<Array<{ url: string; volcano: string; date: string; bid: string }>> {
  try {
    console.log('🔍 Fetching bulletin list page...')
    const html = await fetchHtml(BULLETIN_LIST_URL)
    const $ = cheerio.load(html)

    const bulletins: Array<{ url: string; volcano: string; date: string; bid: string }> = []

    // Look for iframe sources with bulletin IDs - prioritize English versions
    $('iframe[src*="bulletin/activity"]').each((_, element) => {
      const src = $(element).attr('src')
      if (src) {
        // Parse URLs like "/bulletin/activity-bvo?bid=12514&lang=en" (English) or "/bulletin/activity-bvo?bid=12514" (Tagalog)
        const englishMatch = src.match(/\/bulletin\/activity-(\w+)\?bid=(\d+)&lang=en/)
        const tagalogMatch = src.match(/\/bulletin\/activity-(\w+)\?bid=(\d+)(?!&lang=)/)
        
        const match = englishMatch || tagalogMatch
        if (match) {
          const volcanoCode = match[1] // bvo, mvo, kvo, etc.
          const bid = match[2]
          const isEnglish = !!englishMatch
          
          // Map volcano codes to names
          const volcanoNames: { [key: string]: string } = {
            'bvo': 'Bulusan',
            'mvo': 'Mayon', 
            'kvo': 'Kanlaon',
            'tvo': 'Taal',
            'pvo': 'Pinatubo',
            'hvo': 'Hibok-Hibok'
          }
          
          const volcanoName = volcanoNames[volcanoCode] || volcanoCode.toUpperCase()
          
          // Check if we already have this volcano
          const existingBulletin = bulletins.find(b => b.volcano === volcanoName)
          
          if (!existingBulletin) {
            // No existing bulletin for this volcano, add it
            const url = isEnglish 
              ? `${BASE_URL}/bulletin/activity-${volcanoCode}?bid=${bid}&lang=en`
              : `${BASE_URL}/bulletin/activity-${volcanoCode}?bid=${bid}`
            const date = new Date().toISOString()
            
            bulletins.push({ url, volcano: volcanoName, date, bid })
            console.log(`✅ Found ${volcanoName} bulletin (${volcanoCode}, bid=${bid}, ${isEnglish ? 'English' : 'Tagalog'})`)
          } else if (isEnglish && !existingBulletin.url.includes('lang=en')) {
            // We have a Tagalog version but found an English version, replace it
            const url = `${BASE_URL}/bulletin/activity-${volcanoCode}?bid=${bid}&lang=en`
            existingBulletin.url = url
            console.log(`🔄 Upgraded ${volcanoName} bulletin to English version (${volcanoCode}, bid=${bid})`)
          }
        }
      }
    })

    // Also look for the alert level status in the scrolling text
    $('.scroll-item').each((_, element) => {
      const text = $(element).text().trim()
      console.log(`📊 Found alert level: ${text}`)
      
      // Parse format like "Taal - 1", "Kanlaon - 2", etc.
      const match = text.match(/^(\w+)\s*-\s*(\d+)$/)
      if (match) {
        const volcano = match[1]
        const level = match[2]
        
        // Check if we already have this volcano from iframe parsing
        const existingBulletin = bulletins.find(b => b.volcano === volcano)
        if (existingBulletin) {
          console.log(`📊 Alert Level ${level} confirmed for ${volcano}`)
        }
      }
    })

    console.log(`📋 Found ${bulletins.length} active volcano bulletins`)
    return bulletins
  } catch (error) {
    console.error('❌ Error fetching bulletin list:', error)
    throw new Error(`Failed to fetch bulletin list: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Scrape individual bulletin page for volcano data
 */
async function scrapeBulletinDetails(bulletinUrl: string): Promise<Partial<Volcano> | null> {
  try {
    const isEnglish = bulletinUrl.includes('lang=en')
    console.log(`📄 Scraping bulletin: ${bulletinUrl} (${isEnglish ? 'English' : 'Tagalog'})`)
    
    const html = await fetchHtml(bulletinUrl)
    const $ = cheerio.load(html)

    // Extract volcano name from the title
    let volcanoName = $('.p-title').first().text().trim()
    
    // Clean up volcano name for both English and Tagalog versions
    volcanoName = volcanoName
      .replace('BULKANG ', '')  // Remove "BULKANG" (Tagalog)
      .replace(' VOLCANO', '')  // Remove " VOLCANO" (English)
      .replace('VOLCANO ', '')  // Remove "VOLCANO " (English variant)
      .trim()
    
    if (!volcanoName) {
      volcanoName = 'Unknown Volcano'
    }
    
    console.log(`🌋 Found volcano: ${volcanoName}`)

    // Extract alert level from the circle div
    const alertLevelElement = $('.circle').first()
    const activityLevel = parseInt(alertLevelElement.text().trim()) || 0
    console.log(`🚨 Alert Level: ${activityLevel}`)

    // Map alert level to status
    let status: 'normal' | 'advisory' | 'watch' | 'warning' = 'normal'
    if (activityLevel === 0) {
      status = 'normal'
    } else if (activityLevel === 1) {
      status = 'advisory'
    } else if (activityLevel === 2) {
      status = 'advisory'
    } else if (activityLevel === 3) {
      status = 'watch'
    } else if (activityLevel >= 4) {
      status = 'warning'
    }

    // Extract bulletin date
    const rawBulletinDate = $('.txt-date').first().text().trim()
    let bulletinDate = new Date().toISOString() // fallback to current time
    
    if (rawBulletinDate) {
      try {
        // Try to parse the date - PHIVOLCS might use various formats
        const parsedDate = new Date(rawBulletinDate)
        if (!isNaN(parsedDate.getTime())) {
          bulletinDate = parsedDate.toISOString()
        } else {
          // If direct parsing fails, try common PHIVOLCS date formats
          // Example: "October 13, 2025" or "13 October 2025"
          const fallbackDate = new Date(rawBulletinDate.replace(/(\d{1,2})\s+(\w+)\s+(\d{4})/, '$2 $1, $3'))
          if (!isNaN(fallbackDate.getTime())) {
            bulletinDate = fallbackDate.toISOString()
          }
        }
      } catch {
        console.warn(`⚠️ Could not parse bulletin date: ${rawBulletinDate}`)
      }
    }
    
    console.log(`📅 Bulletin Date: ${rawBulletinDate} -> ${bulletinDate}`)

    // Extract parameters from the table (exclude recommendations sections)
    const parameters: { [key: string]: string | number } = {}
    
    $('.table-striped tr').each((_, row) => {
      const $row = $(row)
      const $cells = $row.find('td')
      
      if ($cells.length >= 2) {
        const parameterName = $cells.eq(0).find('b').text().trim()
        const parameterValue = $cells.eq(1).text().trim()
        
        // Filter out recommendation sections from parameters
        const isRecommendationSection = parameterName && (
          parameterName.toLowerCase().includes('should not be allowed') ||
          parameterName.toLowerCase().includes('reminder') ||
          parameterName.toLowerCase().includes('recommendation') ||
          parameterName.toLowerCase().includes('comment')
        )
        
        if (parameterName && parameterValue && !isRecommendationSection) {
          parameters[parameterName] = parameterValue
          console.log(`📊 Parameter: ${parameterName} = ${parameterValue}`)
        }
      }
    })

    // Extract recommendations/comments - handle both English and Tagalog
    let shouldNotBeAllowed = ''
    let reminder = ''
    const recommendationsSelector = isEnglish 
      ? '.title1:contains("RECOMMENDATION/COMMENT")'
      : '.title1:contains("REKOMENDASYON")'
    
    const recommendationsSection = $(recommendationsSelector).parent()
    
    if (recommendationsSection.length) {
      // Find the table with recommendations
      const recommendationsTable = recommendationsSection.find('table.table-striped')
      
      if (recommendationsTable.length) {
        // Parse "Should not be allowed" section
        const shouldNotBeAllowedRow = recommendationsTable.find('tr').filter((_, row) => {
          return $(row).find('td').text().includes(isEnglish ? 'Should not be allowed' : 'Hindi dapat pinapayagan')
        })
        
        if (shouldNotBeAllowedRow.length) {
          const shouldNotBeAllowedList: string[] = []
          shouldNotBeAllowedRow.find('ul li').each((_, li) => {
            const text = $(li).text().trim()
            if (text && !text.includes('Location of') && !text.includes('Volcano Preparedness') && !text.includes('Glossary')) {
              shouldNotBeAllowedList.push(text)
            }
          })
          shouldNotBeAllowed = shouldNotBeAllowedList.join('; ')
        }
        
        // Parse "Reminder" section
        const reminderRow = recommendationsTable.find('tr').filter((_, row) => {
          return $(row).find('td').text().includes(isEnglish ? 'Reminder' : 'Paalala')
        })
        
        if (reminderRow.length) {
          const reminderList: string[] = []
          reminderRow.find('ul li').each((_, li) => {
            const text = $(li).text().trim()
            if (text && !text.includes('Location of') && !text.includes('Volcano Preparedness') && !text.includes('Glossary')) {
              reminderList.push(text)
            }
          })
          reminder = reminderList.join('; ')
        }
        
        console.log(`💡 Should not be allowed (${isEnglish ? 'English' : 'Tagalog'}): ${shouldNotBeAllowed}`)
        console.log(`💡 Reminder (${isEnglish ? 'English' : 'Tagalog'}): ${reminder}`)
      }
    } else {
      console.log(`⚠️ No recommendations section found for ${isEnglish ? 'English' : 'Tagalog'} version`)
    }

    // Get coordinates from known volcano locations
    // Convert volcano name to title case for coordinate lookup
    const volcanoNameTitleCase = volcanoName.charAt(0).toUpperCase() + volcanoName.slice(1).toLowerCase()
    const volcanoCoordinates = getVolcanoCoordinates(volcanoNameTitleCase)

    return {
      id: `vol_${volcanoName.toLowerCase().replace(/\s+/g, '_')}`,
      type: 'volcano' as const,
      name: volcanoName,
      location: getVolcanoLocation(volcanoNameTitleCase),
      coordinates: volcanoCoordinates,
      elevation: getVolcanoElevation(volcanoNameTitleCase),
      status,
      activityLevel,
      lastUpdate: bulletinDate,
      description: `Alert Level ${activityLevel} - ${status}`,
      country: 'Philippines',
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      shouldNotBeAllowed: shouldNotBeAllowed || undefined,
      reminder: reminder || undefined,
      bulletinUrl,
      bulletinDate
    }
  } catch (error) {
    console.error(`❌ Error scraping bulletin ${bulletinUrl}:`, error)
    return null
  }
}

/**
 * Get coordinates for known Philippine volcanoes
 */
function getVolcanoCoordinates(volcanoName: string): [number, number] {
  const volcanoCoords: { [key: string]: [number, number] } = {
    'Mayon': [123.685, 13.257],
    'Taal': [120.993, 14.002],
    'Pinatubo': [120.35, 15.13],
    'Kanlaon': [123.132, 10.412],
    'Bulusan': [124.05, 12.77],
    'Hibok-Hibok': [124.67, 9.20],
    'Ragang': [124.5, 7.7],
    'Smith': [124.4, 19.5],
    'Makaturing': [124.3, 7.6],
    'Cagua': [122.1, 18.2],
    'Iraya': [122.0, 20.5],
    'Iriga': [123.4, 13.5],
    'Malinao': [123.6, 13.4],
    'Masaraga': [123.6, 13.3],
    'Matutum': [125.1, 6.4],
    'Parker': [124.9, 6.1],
    'Balut': [125.4, 5.4],
    'Kalatungan': [124.8, 7.9],
    'Leonard Kniaseff': [125.0, 7.4],
    'Musuan': [125.2, 7.9]
  }

  return volcanoCoords[volcanoName] || [121.0, 14.6] // Default to Manila area
}

/**
 * Get location for known Philippine volcanoes
 */
function getVolcanoLocation(volcanoName: string): string {
  const volcanoLocations: { [key: string]: string } = {
    'Mayon': 'Albay, Luzon',
    'Taal': 'Batangas, Luzon',
    'Pinatubo': 'Zambales, Luzon',
    'Kanlaon': 'Negros, Visayas',
    'Bulusan': 'Sorsogon, Luzon',
    'Hibok-Hibok': 'Camiguin, Mindanao',
    'Ragang': 'Lanao del Sur, Mindanao',
    'Smith': 'Cagayan, Luzon',
    'Makaturing': 'Lanao del Sur, Mindanao',
    'Cagua': 'Cagayan, Luzon',
    'Iraya': 'Batanes, Luzon',
    'Iriga': 'Camarines Sur, Luzon',
    'Malinao': 'Albay, Luzon',
    'Masaraga': 'Albay, Luzon',
    'Matutum': 'South Cotabato, Mindanao',
    'Parker': 'South Cotabato, Mindanao',
    'Balut': 'Davao del Sur, Mindanao',
    'Kalatungan': 'Bukidnon, Mindanao',
    'Leonard Kniaseff': 'Davao del Sur, Mindanao',
    'Musuan': 'Bukidnon, Mindanao'
  }

  return volcanoLocations[volcanoName] || 'Philippines'
}

/**
 * Get elevation for known Philippine volcanoes
 */
function getVolcanoElevation(volcanoName: string): number {
  const volcanoElevations: { [key: string]: number } = {
    'Mayon': 2463,
    'Taal': 311,
    'Pinatubo': 1486,
    'Kanlaon': 2465,
    'Bulusan': 1565,
    'Hibok-Hibok': 1332,
    'Ragang': 2815,
    'Smith': 688,
    'Makaturing': 1940,
    'Cagua': 1133,
    'Iraya': 1009,
    'Iriga': 1196,
    'Malinao': 1548,
    'Masaraga': 1328,
    'Matutum': 2286,
    'Parker': 1824,
    'Balut': 862,
    'Kalatungan': 2880,
    'Leonard Kniaseff': 200,
    'Musuan': 646
  }

  return volcanoElevations[volcanoName] || 1000
}

/**
 * Main function to scrape PHIVOLCS bulletins
 */
export async function scrapePhivolcsBulletins(): Promise<Volcano[]> {
  try {
    console.log('🌋 Starting PHIVOLCS volcano data scraping...')
    
    // Get list of bulletin URLs
    const bulletins = await getBulletinUrls()
    
    if (bulletins.length === 0) {
      console.log('📭 No bulletins found')
      return []
    }

    const volcanoes: Volcano[] = []
    const volcanoMap = new Map<string, Volcano>() // To avoid duplicates

    // Scrape each bulletin with rate limiting
    for (let i = 0; i < bulletins.length; i++) {
      const bulletin = bulletins[i]
      
      try {
        const volcanoData = await scrapeBulletinDetails(bulletin.url)
        
        if (volcanoData && volcanoData.name) {
          // Use the most recent bulletin for each volcano
          if (!volcanoMap.has(volcanoData.name) || 
              (volcanoData.bulletinDate && volcanoData.bulletinDate > (volcanoMap.get(volcanoData.name)?.bulletinDate || ''))) {
            volcanoMap.set(volcanoData.name, volcanoData as Volcano)
          }
        }
      } catch (error) {
        console.error(`❌ Error processing bulletin ${bulletin.url}:`, error)
        // Continue with other bulletins
      }

      // Rate limiting: wait 1-2 seconds between requests
      if (i < bulletins.length - 1) {
        await delay(1500 + Math.random() * 500) // 1.5-2 seconds
      }
    }

    // Convert map to array
    volcanoes.push(...volcanoMap.values())

    // Log language summary
    const englishCount = bulletins.filter(b => b.url.includes('lang=en')).length
    const tagalogCount = bulletins.length - englishCount
    console.log(`📊 Language Summary: ${englishCount} English, ${tagalogCount} Tagalog bulletins`)
    console.log(`✅ Successfully scraped ${volcanoes.length} volcanoes from PHIVOLCS`)
    return volcanoes

  } catch (error) {
    console.error('❌ Error scraping PHIVOLCS bulletins:', error)
    throw new Error(`Failed to scrape PHIVOLCS data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
