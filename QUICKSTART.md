# Quick Start Guide

Get GeoSafe Map running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Mapbox Token (Free)

1. Visit [mapbox.com/signup](https://account.mapbox.com/auth/signup/)
2. Sign up for free (no credit card required)
3. Go to [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/)
4. Copy your **Default public token** (starts with `pk.`)

## Step 3: Create Environment File

Create a file named `.env.local` in the project root:

```bash
# On Mac/Linux:
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env.local

# On Windows (PowerShell):
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" | Out-File -FilePath .env.local
```

**Or manually create `.env.local` with:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

## Step 4: Run the App

```bash
npm run dev
```

## Step 5: Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

---

## What You'll See

### 🗺️ Interactive Map
- **Earthquakes**: Colored circles (green to red based on magnitude)
- **Volcanoes**: Triangle markers (gray to red based on status)

### 🎛️ Filter Panel (Left Side)
- Toggle earthquake/volcano layers
- Adjust magnitude range
- Enable population/boundary overlays

### 📊 Event Details (Right Side / Bottom on Mobile)
- Click any marker to see detailed information
- View magnitude, depth, time, alert levels
- External links to official sources

### 📱 Mobile Responsive
- Optimized for phones and tablets
- Bottom sheet for event details
- Collapsible filters

---

## Sample Features to Try

1. **Filter by Magnitude**
   - Slide the magnitude range to show only major earthquakes

2. **Toggle Layers**
   - Turn off earthquakes to see only volcanoes
   - Turn off volcanoes to see only earthquakes

3. **Explore Events**
   - Click on any marker to see detailed information
   - Click markers to compare different events

4. **Mobile Experience**
   - Resize your browser to mobile view
   - See the responsive bottom sheet in action

---

## Current Data

The app currently displays **mock data** for demonstration:
- 6 sample earthquakes around the Philippines
- 6 active Philippine volcanoes

**In production**, this will be replaced with real-time data from:
- USGS Earthquake Feed
- PHIVOLCS Volcano Bulletins
- Smithsonian Global Volcanism Program

---

## Troubleshooting

### Map shows "Mapbox Token Required"
- Make sure `.env.local` exists in the project root
- Check that the token starts with `pk.`
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Packages not installing
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed documentation
- Check [PRD/hazard.md](./PRD/hazard.md) for the full product roadmap
- Explore the code in `components/` and `app/`

---

## Project Structure

```
📁 app/              → Next.js pages and API routes
📁 components/       → React components (UI, layout, map)
📁 lib/              → Utilities and mock data
📁 types/            → TypeScript type definitions
📁 public/           → Static assets and PWA manifest
```

---

## Tech Stack

- ⚛️ **React 19** - UI library (latest!)
- ▲ **Next.js 15** - React framework (latest!)
- 🗺️ **Mapbox GL** - Interactive maps
- 🎨 **Tailwind CSS** - Styling
- 🧩 **shadcn/ui** - UI components
- 📘 **TypeScript** - Type safety

---

## Support

Having issues? Check:
1. [SETUP.md](./SETUP.md) - Detailed setup guide
2. [GitHub Issues](https://github.com) - Report bugs
3. Environment variables are correctly set

---

**Happy Mapping! 🗺️🌋🌍**

