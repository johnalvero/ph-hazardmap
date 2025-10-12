# GeoSafe Map - Setup Guide

This guide will help you set up and run the GeoSafe Map application locally.

## Prerequisites

- Node.js 18.x or higher (Node.js 20+ recommended for Next.js 15)
- npm or yarn package manager
- A Mapbox account (free tier is sufficient)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

### 3. Get Your Mapbox Access Token

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account (if you don't have one)
3. Navigate to [Access Tokens](https://account.mapbox.com/access-tokens/)
4. Copy your default public token or create a new one
5. Paste it in your `.env.local` file:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Current MVP Features (Phase 1)

✅ **Real-time Hazard Visualization**
- Interactive map showing earthquakes and volcanoes
- Color-coded markers based on magnitude/status
- Hover tooltips for quick information

✅ **Filtering Capabilities**
- Toggle between earthquake and volcano layers
- Filter earthquakes by magnitude range
- Toggle population density and admin boundary overlays

✅ **Event Details Panel**
- Detailed information for selected events
- Earthquake: magnitude, depth, time, alert level, tsunami warnings
- Volcano: status, elevation, activity level, last update

✅ **Responsive Design**
- Mobile-friendly interface
- Collapsible filter panel for smaller screens
- Progressive Web App (PWA) ready

## Project Structure

```
hazard/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── earthquakes/     # Earthquake data endpoint
│   │   └── volcanoes/       # Volcano data endpoint
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── layout/             # Layout components
│   │   ├── header.tsx
│   │   ├── filter-panel.tsx
│   │   └── event-details-panel.tsx
│   └── map/                # Map components
│       └── map-container.tsx
├── lib/                    # Utility functions
│   ├── utils.ts            # Helper functions
│   └── mock-data.ts        # Mock hazard data
├── types/                  # TypeScript definitions
│   └── hazard.ts           # Hazard event types
└── public/                 # Static assets
    └── manifest.json       # PWA manifest
```

## Tech Stack

- **Framework:** Next.js 15 (App Router) - Latest stable version
- **UI Library:** React 19 - Latest stable version
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI)
- **Maps:** Mapbox GL JS with react-map-gl
- **Icons:** Lucide React

## Mock Data

The application currently uses mock data to demonstrate functionality. The data includes:

- 6 sample earthquakes around the Philippines with varying magnitudes
- 6 active Philippine volcanoes with different status levels

In production, this will be replaced with real-time data from:
- USGS Earthquake API
- PHIVOLCS Bulletins
- Smithsonian Global Volcanism Program

## API Routes

### GET /api/earthquakes
Returns mock earthquake data in the format:
```json
{
  "earthquakes": [...],
  "metadata": {
    "source": "Mock Data",
    "generated": "ISO timestamp",
    "count": 6
  }
}
```

### GET /api/volcanoes
Returns mock volcano data in a similar format.

## Next Steps for Production

1. **Data Integration**
   - Connect to USGS GeoJSON feed
   - Integrate PHIVOLCS API/scraper
   - Set up PostGIS database for caching

2. **Real-time Updates**
   - Implement WebSocket or Server-Sent Events
   - Add automatic data refresh
   - Set up Redis for caching

3. **Additional Features**
   - Push notifications for significant events
   - User location-based alerts
   - Historical data visualization
   - Export/share functionality

4. **Performance**
   - Implement marker clustering for dense areas
   - Add vector tiles for better performance
   - Optimize mobile data usage

5. **Deployment**
   - Deploy to Vercel/AWS/GCP
   - Set up monitoring and logging
   - Configure CDN for static assets
   - Set up automated data pipelines

## Troubleshooting

### Map not displaying
- Check that your Mapbox token is correctly set in `.env.local`
- Ensure the token starts with `pk.`
- Restart the development server after adding the token

### Dependencies issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Regenerate TypeScript cache
rm -rf .next
npm run dev
```

## Contributing

This is the MVP (Phase 1) of GeoSafe Map. Future phases will include:
- Phase 2: Flood, landslide, tsunami, typhoon layers
- Phase 3: Analytics & forecasting with AI/ML
- Phase 4: Regional expansion and API product

## License

MIT

## Support

For issues or questions, please refer to the PRD document in the `/PRD` folder.

