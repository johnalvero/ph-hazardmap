'use client'

import { Typhoon } from '@/types/hazard'
import { getTyphoonColor } from '@/lib/data/typhoons'

interface TyphoonMarkerProps {
  typhoon: Typhoon
  onClick: (e?: React.MouseEvent) => void
  isSelected?: boolean
}

export function TyphoonMarker({ typhoon, onClick, isSelected }: TyphoonMarkerProps) {
  const color = getTyphoonColor(typhoon.category)
  const rotation = typhoon.movementDirection
  
  return (
    <div
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={onClick}
      title={`${typhoon.name} (${typhoon.category})`}
    >
      <svg
        width={isSelected ? 48 : 36}
        height={isSelected ? 48 : 36}
        viewBox="0 0 100 100"
        style={{ transform: `rotate(${rotation}deg)` }}
        className="transition-all duration-200"
      >
        {/* Hurricane/Typhoon symbol */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={color}
          fillOpacity={isSelected ? 0.9 : 0.7}
          stroke="white"
          strokeWidth={isSelected ? 4 : 3}
        />
        
        {/* Spiral pattern */}
        <path
          d="M 50 20 Q 70 30, 75 50 Q 70 70, 50 75 Q 30 70, 25 50 Q 30 30, 50 20"
          fill="none"
          stroke="white"
          strokeWidth="3"
          opacity="0.8"
        />
        
        {/* Center eye */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="white"
          opacity="0.9"
        />
        
        {/* Movement arrow */}
        <path
          d="M 50 5 L 45 15 L 55 15 Z"
          fill="white"
          opacity="0.9"
        />
      </svg>
      
      {/* Category label */}
      <div
        className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded"
        style={{
          backgroundColor: color,
          color: 'white',
          fontSize: isSelected ? '11px' : '9px'
        }}
      >
        {typhoon.name}
      </div>
    </div>
  )
}

