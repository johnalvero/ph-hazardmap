import { NextResponse } from 'next/server'
import { mockVolcanoes } from '@/lib/mock-data'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  // In production, this would fetch from PHIVOLCS API and other sources
  
  return NextResponse.json({
    volcanoes: mockVolcanoes,
    metadata: {
      source: 'Mock Data (PHIVOLCS format)',
      generated: new Date().toISOString(),
      count: mockVolcanoes.length
    }
  })
}

