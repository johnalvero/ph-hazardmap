# Installation Instructions

Quick installation guide for GeoSafe Map with Next.js 15 and React 19.

## Step 1: Install Dependencies

```bash
cd /Users/johnalvero/hazard
npm install
```

This will install:
- Next.js 15.0.3
- React 19.0.0
- All required dependencies

## Step 2: Set Up Mapbox Token

### Get a Free Mapbox Token

1. Visit [mapbox.com/signup](https://account.mapbox.com/auth/signup/)
2. Create a free account (no credit card required)
3. Go to your [Access Tokens](https://account.mapbox.com/access-tokens/) page
4. Copy your **Default public token** (starts with `pk.`)

### Create Environment File

Create `.env.local` in the project root:

```bash
echo "NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here" > .env.local
```

Or manually create the file:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ5b3VyLXRva2VuIn0.example
```

## Step 3: Run Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

## Step 4: Verify Installation

You should see:
- ✅ Interactive map with Mapbox tiles
- ✅ Earthquake and volcano markers
- ✅ Filter panel on the left
- ✅ No console errors

## Troubleshooting

### Issue: "Mapbox Token Required" Message

**Solution:**
1. Check that `.env.local` exists in the project root
2. Verify the token starts with `pk.`
3. Restart the dev server (Ctrl+C, then `npm run dev`)

### Issue: Dependency Installation Fails

**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Use a different port
npm run dev -- -p 3001
```

Then open http://localhost:3001

### Issue: Node Version Too Old

**Solution:**
```bash
# Check your Node version
node -v

# Should be 18.17+ (20+ recommended)
# Update Node.js if needed
```

### Issue: TypeScript Errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: ESLint Errors

**Solution:**
```bash
# Install latest ESLint config
npm install -D eslint@latest eslint-config-next@latest
```

## Next Steps

Once running:
1. ✅ Explore the interactive map
2. ✅ Click on earthquake/volcano markers
3. ✅ Try the filter panel
4. ✅ Test responsive design (resize browser)
5. ✅ Read the documentation files

## Build for Production

```bash
# Create optimized production build
npm run build

# Run production server
npm run start
```

## Development Commands

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check for code issues
```

## Environment Variables

### Required
```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

### Optional (for future use)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=
REDIS_URL=
```

## System Requirements

### Minimum
- Node.js 18.17.0+
- npm 9.0.0+
- 2GB RAM
- Modern browser (Chrome, Firefox, Safari, Edge)

### Recommended
- Node.js 20.x or 22.x LTS
- npm 10.x
- 4GB+ RAM
- SSD storage
- Fast internet connection

## Supported Platforms

- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, Debian, etc.)
- ✅ Windows 10/11
- ✅ Docker containers

## Supported Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Android (latest)

## File Size

After installation:
- `node_modules/`: ~400MB
- `.next/` (build): ~50MB
- Total: ~450MB

## Installation Time

- Fast internet: 2-3 minutes
- Average internet: 5-7 minutes
- Slow internet: 10-15 minutes

## Common Questions

**Q: Do I need a Mapbox paid account?**  
A: No! The free tier includes 50,000 map loads per month, which is plenty for development and small deployments.

**Q: Can I use Yarn or pnpm?**  
A: Yes! The project works with npm, Yarn, or pnpm.

```bash
# With Yarn
yarn install
yarn dev

# With pnpm
pnpm install
pnpm dev
```

**Q: Do I need Docker?**  
A: No, Docker is optional. The app runs fine with just Node.js.

**Q: What about the database?**  
A: The MVP uses mock data. Database setup is for Phase 2 (see NEXT_STEPS.md).

**Q: How do I deploy?**  
A: See deployment section in START_HERE.md. Vercel is the easiest option.

## Getting Help

- **Quick Start**: Read `QUICKSTART.md`
- **Full Setup**: Read `SETUP.md`
- **Project Details**: Read `PROJECT_SUMMARY.md`
- **Versions**: Read `VERSION_INFO.md`
- **Next Steps**: Read `NEXT_STEPS.md`

---

**Ready to code? Run `npm run dev` and visit http://localhost:3000** 🚀

