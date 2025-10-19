# GeoSafe Map

> All hazards. One map. Real-time awareness for safer communities.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

An interactive platform that visualizes volcanoes, earthquakes, and other natural hazards in real time, combining scientific data with contextual analytics for public awareness, planning, and disaster resilience.

**Built with the latest stable versions of Next.js 15 and React 19!**

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Security Notice

⚠️ **IMPORTANT**: This repository contains no hardcoded secrets or API keys. All sensitive information is managed through environment variables. See `env.example` for required configuration.

**Never commit `.env.local` or any files containing API keys to version control.**
- **Mapbox GL JS** - Interactive maps

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Mapbox access token.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features (MVP - Phase 1)

- 🌎 **Real-time earthquake data** from USGS (Live!)
- 🌋 Volcano activity map (mock data)
- ⚠️ **Philippine fault systems** overlay (NEW!)
- 📍 Interactive map with zoom and filter capabilities
- 🔄 Auto-refresh every 5 minutes
- 🧾 Detailed event information
- 🗺 Base layers: fault lines, population density, admin boundaries
- 📱 Mobile-friendly Progressive Web App (PWA)
- ⚡ Next.js 15 with server-side caching

## Project Structure

```
hazard/
├── app/                  # Next.js App Router
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── map/            # Map-related components
│   └── layout/         # Layout components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## License

MIT

