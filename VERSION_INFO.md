# GeoSafe Map - Version Information

## Current Versions

This project is built with the **latest stable versions** of Next.js and React as of October 2024.

### Core Dependencies

| Package | Version | Notes |
|---------|---------|-------|
| **Next.js** | `15.0.3` | Latest stable with App Router |
| **React** | `19.0.0` | Latest stable release |
| **React DOM** | `19.0.0` | Matches React version |
| **TypeScript** | `5.6.3` | Latest stable |
| **Tailwind CSS** | `3.4.13` | Latest v3 release |
| **Mapbox GL JS** | `3.6.0` | Latest stable |
| **react-map-gl** | `7.1.7` | Compatible with Mapbox GL 3.x |

### Why Next.js 15 and React 19?

#### Next.js 15 Features
- ✅ **Improved Performance**: Faster builds and better runtime performance
- ✅ **Enhanced App Router**: Stable and production-ready
- ✅ **Better TypeScript Support**: Improved type inference
- ✅ **Turbopack**: Faster dev server (in stable)
- ✅ **Optimized Image Handling**: Better `remotePatterns` support

#### React 19 Features
- ✅ **React Compiler**: Automatic optimization (experimental)
- ✅ **Improved Hooks**: Better performance and DX
- ✅ **Server Components**: First-class support
- ✅ **Actions**: Simplified form handling
- ✅ **Better Error Handling**: Enhanced error boundaries

### Breaking Changes from Previous Versions

#### From Next.js 14 → 15
1. **Image Configuration**: Changed from `domains` to `remotePatterns`
   ```js
   // Old (Next.js 14)
   images: {
     domains: ['api.mapbox.com']
   }
   
   // New (Next.js 15)
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'api.mapbox.com' }
     ]
   }
   ```

2. **TypeScript Config**: Updated target to ES2022
   ```json
   {
     "compilerOptions": {
       "target": "ES2022"  // was ES2020
     }
   }
   ```

3. **ESLint**: Now supports ESLint 9
   ```json
   {
     "extends": ["next/core-web-vitals", "next/typescript"]
   }
   ```

#### From React 18 → 19
- **Types**: Updated to `@types/react@19.0.0`
- **Hooks**: Some minor performance improvements (no breaking changes for our use case)
- **Concurrent Features**: Better out-of-the-box support

### Compatibility Notes

#### Node.js Compatibility
- **Minimum**: Node.js 18.17.0
- **Recommended**: Node.js 20.x or 22.x
- **Latest LTS**: Node.js 22.x

#### Browser Support
Next.js 15 and React 19 support:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: iOS 14+
- Chrome Android: Last 2 versions

### Package Manager Versions

- **npm**: 9.x or 10.x recommended
- **yarn**: 1.22.x or 3.x+
- **pnpm**: 8.x or 9.x

### Development Experience Improvements

1. **Faster Hot Reload**: Next.js 15's Turbopack significantly speeds up dev server
2. **Better Type Safety**: TypeScript 5.6 provides improved inference
3. **Enhanced DX**: Better error messages and stack traces
4. **Optimized Builds**: Production builds are more efficient

### Migration from Older Versions

If you have an existing Next.js 14/React 18 project:

```bash
# Update package.json
npm install next@latest react@latest react-dom@latest

# Update TypeScript types
npm install -D @types/react@latest @types/react-dom@latest

# Update ESLint
npm install -D eslint@latest eslint-config-next@latest

# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

### Known Issues & Workarounds

#### Issue: ESLint 9 Migration
If you encounter ESLint configuration errors:
```bash
# Ensure you're using the latest ESLint config
npm install -D eslint-config-next@latest
```

#### Issue: Type Errors with Mapbox
If you see TypeScript errors with Mapbox types:
```bash
# Ensure you have the latest types
npm install -D @types/mapbox-gl@latest
```

### Future Updates

We'll continue updating to the latest stable versions:
- **Next.js 16**: Expected Q2 2025
- **React 20**: TBD (likely 2025)
- **TypeScript 6.0**: Expected 2025

### Version Update Schedule

This project follows these principles:
- ✅ Always use **latest stable** versions
- ✅ Update within **1 week** of major releases
- ✅ Test thoroughly before updating
- ✅ Document breaking changes
- ✅ Maintain backward compatibility where possible

### Checking for Updates

```bash
# Check outdated packages
npm outdated

# Update to latest
npm update

# Or use npm-check-updates
npx npm-check-updates -u
npm install
```

### Version Lock

All versions in `package.json` use caret (`^`) ranges:
- `^19.0.0` → Allows minor and patch updates (19.x.x)
- Ensures stability while getting bug fixes
- Can be locked with `package-lock.json`

### Production Deployment

When deploying to production:
1. ✅ Lock dependencies with `package-lock.json`
2. ✅ Use Node.js 20+ in production
3. ✅ Enable caching for faster builds
4. ✅ Monitor for dependency vulnerabilities
5. ✅ Test on supported browsers

### Support

For version-specific issues:
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

**Last Updated**: October 2024  
**Project Version**: 1.0.0 (MVP)  
**Stability**: Production-ready ✅

