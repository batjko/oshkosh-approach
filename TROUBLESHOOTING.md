# Troubleshooting Guide - Oshkosh Approach App

## Issue: react-leaflet SSR Error

### Problem
When running `npm run dev`, you may encounter this error:
```
ReferenceError: window is not defined
at /node_modules/leaflet/dist/leaflet-src.js:230:19
```

### Root Cause
This error occurs because Leaflet (the mapping library) tries to access browser-specific objects like `window` during server-side rendering (SSR). Since these objects don't exist on the server, it causes the application to crash.

### Solution Implemented

#### 1. Client-Side Only Map Loading
The `ApproachMap` component now uses dynamic imports to load react-leaflet components only on the client side:

```typescript
// Load react-leaflet components only on client side
useEffect(() => {
  let mounted = true
  
  const loadMapComponents = async () => {
    try {
      const [reactLeaflet, leaflet] = await Promise.all([
        import('react-leaflet'),
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ])
      
      // Set up components after successful import
      if (mounted) {
        setMapComponents({
          MapContainer: reactLeaflet.MapContainer,
          TileLayer: reactLeaflet.TileLayer,
          // ... other components
        })
        setIsClient(true)
      }
    } catch (error) {
      console.error('Failed to load map components:', error)
    }
  }
  
  loadMapComponents()
  
  return () => {
    mounted = false
  }
}, [])
```

#### 2. Fallback Component
A `MapFallback` component provides functionality when the map cannot load:
- Shows current stage information
- Displays GPS status
- Provides manual stage navigation
- Maintains app functionality without the interactive map

#### 3. Toggle Option
Users can toggle between the interactive map and fallback view using the `MapToggle` component in the header.

### Alternative Solutions

If you continue to experience issues, you can:

1. **Disable the map entirely**: Set `enableMap: false` in the store default state
2. **Use a different mapping library**: Replace react-leaflet with a SSR-friendly alternative
3. **Server-side rendering bypass**: Add the map route to SSR exclusions in Remix config

### Testing the Fix

1. Start the development server: `npm run dev`
2. The app should load without SSR errors
3. The map will show "Loading Map..." initially, then load the interactive map
4. If the map fails to load, it will show the fallback component
5. Use the map toggle button (🗺️) in the header to switch between map and fallback

### Performance Notes

- The dynamic import approach adds a small delay to map loading (~1-2 seconds)
- This is intentional to prevent SSR crashes
- The fallback provides full functionality while the map loads
- Map tiles are cached by the service worker for offline use

### Browser Compatibility

The dynamic import solution works in:
- ✅ Chrome 63+
- ✅ Firefox 67+  
- ✅ Safari 11.1+
- ✅ Edge 79+

For older browsers, the fallback component will be used automatically.