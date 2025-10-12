# GeoSafe Map - Project Summary

## Overview

GeoSafe Map is a modern web application for real-time visualization of natural hazards, built with Next.js 15, React 19, TypeScript, Tailwind CSS, and shadcn/ui components.

**Tagline:** "All hazards. One map. Real-time awareness for safer communities."

## Current Status: MVP (Phase 1) ✅

Built with **Next.js 15** and **React 19** - using the latest stable versions!

### Implemented Features

#### 🗺️ Interactive Map
- **Technology**: Mapbox GL JS with react-map-gl
- **Markers**: 
  - Earthquakes: Color-coded circles (green → yellow → orange → red)
  - Volcanoes: Triangle markers with status-based colors
- **Controls**: Navigation, zoom, scale, fullscreen
- **Interactivity**: Click markers for details, hover for quick info

#### 🎛️ Filter Panel
- **Hazard Type Toggles**: Show/hide earthquakes and volcanoes
- **Magnitude Slider**: Filter earthquakes by magnitude range (0-10)
- **Base Layer Toggles**: Population density, admin boundaries (prepared for Phase 2)
- **Collapsible**: Minimizes to save screen space
- **Responsive**: Full-width on mobile, sidebar on desktop

#### 📊 Event Details
- **Desktop**: Right-side panel with full event information
- **Mobile**: Bottom sheet with swipe-up/down functionality
- **Information Displayed**:
  - Earthquakes: Magnitude, depth, time, coordinates, alert level, tsunami warnings
  - Volcanoes: Status, elevation, activity level, location, description
- **External Links**: Direct links to USGS and official sources

#### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Breakpoints**: 
  - Mobile: < 768px (stacked layout, bottom sheet)
  - Desktop: ≥ 768px (sidebar layout, side panels)
- **PWA Ready**: Manifest file for progressive web app installation

#### 🎨 UI Components (shadcn/ui)
- Button, Card, Badge, Separator
- Switch, Slider, Tabs, Tooltip, Label
- All components are accessible and themeable

#### 📈 Additional Features
- **Map Legend**: Visual guide for earthquake and volcano markers
- **Event Counter**: Live count of displayed events
- **Loading States**: Spinner and loading screen
- **Error Handling**: Graceful handling of missing Mapbox token

## Technology Stack

### Frontend Framework
- **Next.js 15.0.3**: React framework with App Router
- **React 19.0.0**: UI library with hooks
- **TypeScript 5.6.3**: Type-safe development

### Styling & UI
- **Tailwind CSS 3.4.8**: Utility-first CSS framework
- **shadcn/ui**: Radix UI-based component library
- **Lucide React**: Icon library
- **class-variance-authority**: Dynamic class management

### Mapping
- **Mapbox GL JS 3.6.0**: WebGL-powered map rendering
- **react-map-gl 7.1.7**: React wrapper for Mapbox

### Utilities
- **date-fns 3.6.0**: Date formatting
- **clsx & tailwind-merge**: Class name utilities

## Project Structure

```
hazard/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── earthquakes/          # Earthquake data endpoint
│   │   └── volcanoes/            # Volcano data endpoint
│   ├── favicon.ico               # App icon
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with metadata
│   ├── loading.tsx               # Loading state
│   └── page.tsx                  # Home page (main app)
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   ├── loading.tsx
│   │   ├── separator.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   └── tooltip.tsx
│   ├── layout/                   # Layout components
│   │   ├── event-details-panel.tsx
│   │   ├── filter-panel.tsx
│   │   ├── header.tsx
│   │   └── mobile-bottom-sheet.tsx
│   └── map/                      # Map components
│       ├── legend.tsx
│       └── map-container.tsx
│
├── lib/                          # Utilities and helpers
│   ├── constants.ts              # App-wide constants
│   ├── mock-data.ts              # Sample earthquake/volcano data
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript type definitions
│   └── hazard.ts                 # Earthquake, Volcano, Filter types
│
├── hooks/                        # Custom React hooks
│   └── use-mobile.tsx            # Mobile detection hook
│
├── public/                       # Static assets
│   └── manifest.json             # PWA manifest
│
├── PRD/                          # Product documentation
│   └── hazard.md                 # Full PRD
│
├── Configuration Files
│   ├── .eslintrc.json            # ESLint config
│   ├── .gitignore                # Git ignore rules
│   ├── .prettierrc               # Prettier config
│   ├── next.config.js            # Next.js config
│   ├── package.json              # Dependencies
│   ├── postcss.config.mjs        # PostCSS config
│   ├── tailwind.config.ts        # Tailwind config
│   └── tsconfig.json             # TypeScript config
│
└── Documentation
    ├── README.md                 # Project overview
    ├── SETUP.md                  # Detailed setup guide
    ├── QUICKSTART.md             # Quick start guide
    └── PROJECT_SUMMARY.md        # This file
```

## Data Models

### Earthquake Type
```typescript
interface Earthquake {
  id: string
  type: 'earthquake'
  magnitude: number
  depth: number
  location: string
  coordinates: [number, number]  // [lng, lat]
  timestamp: string
  place: string
  alert?: 'green' | 'yellow' | 'orange' | 'red'
  tsunami: boolean
  felt?: number
  url?: string
}
```

### Volcano Type
```typescript
interface Volcano {
  id: string
  type: 'volcano'
  name: string
  location: string
  coordinates: [number, number]  // [lng, lat]
  elevation: number
  status: 'normal' | 'advisory' | 'watch' | 'warning'
  activityLevel: number
  lastUpdate: string
  description?: string
  country: string
}
```

### Filter State
```typescript
interface FilterState {
  hazardTypes: ('earthquake' | 'volcano')[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  magnitudeRange: {
    min: number
    max: number
  }
  showPopulation: boolean
  showAdminBoundaries: boolean
}
```

## Mock Data

Currently includes:
- **6 Earthquakes**: Magnitudes 3.8 - 7.2, various Philippine locations
- **6 Volcanoes**: Mayon, Taal, Pinatubo, Kanlaon, Bulusan, Hibok-Hibok

## API Endpoints (Mock)

### GET /api/earthquakes
Returns earthquake data with metadata

### GET /api/volcanoes
Returns volcano data with metadata

## Key Features Implementation

### 1. Map Container (`components/map/map-container.tsx`)
- Renders Mapbox map with markers
- Handles marker clicks and hovers
- Manages popups and event selection
- Filters events based on user preferences
- Responsive to filter changes

### 2. Filter Panel (`components/layout/filter-panel.tsx`)
- Toggle hazard types
- Adjust magnitude range
- Toggle base layers
- Reset all filters
- Collapsible for mobile

### 3. Event Details Panel (`components/layout/event-details-panel.tsx`)
- Desktop: Fixed right sidebar
- Displays comprehensive event information
- Links to external sources
- Color-coded by severity

### 4. Mobile Bottom Sheet (`components/layout/mobile-bottom-sheet.tsx`)
- Mobile-optimized event details
- Swipeable expand/collapse
- Quick access to key information

### 5. Map Legend (`components/map/legend.tsx`)
- Visual guide for markers
- Earthquake magnitude scale
- Volcano status indicators

## Environment Variables

Required:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

Optional:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

## Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Map Optimization**: Marker clustering prepared for Phase 2
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component ready

## Accessibility

- **Keyboard Navigation**: All interactive elements accessible
- **ARIA Labels**: Proper labeling for screen readers
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible focus states

## Future Phases (from PRD)

### Phase 2 (6-12 months)
- Flood, landslide, tsunami, typhoon layers
- Real-time rainfall & typhoon overlays
- Flood hazard zones
- Saved views & user subscriptions

### Phase 3 (12-18 months)
- Risk analytics dashboard
- AI-based anomaly detection
- Evacuation route analysis
- Infrastructure exposure mapping

### Phase 4 (18+ months)
- Regional expansion (ASEAN + Pacific)
- Developer API/SDK
- Enterprise dashboard

## Production Readiness Checklist

- [x] TypeScript for type safety
- [x] Responsive design
- [x] Mobile-optimized UI
- [x] Error handling
- [x] Loading states
- [x] PWA manifest
- [ ] Real data integration
- [ ] Authentication (future)
- [ ] Database setup (future)
- [ ] API rate limiting (future)
- [ ] Analytics (future)
- [ ] Monitoring (future)

## Known Limitations (MVP)

1. **Mock Data**: Using sample data instead of real-time feeds
2. **No Authentication**: Public access only
3. **No Database**: Data not persisted
4. **Limited Hazards**: Only earthquakes and volcanoes
5. **No Notifications**: Push notifications not implemented
6. **No Historical Data**: Only current events shown

## Development Notes

- **Hot Reload**: Changes reflect immediately in dev mode
- **Type Checking**: Run `tsc --noEmit` to check types
- **Linting**: ESLint configured for Next.js best practices
- **Formatting**: Prettier configured for consistency

## Deployment Ready

The application is ready to deploy to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (containerization ready)

## License

MIT

---

**Built with ❤️ for safer communities**

