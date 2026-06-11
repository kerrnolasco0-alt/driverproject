import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Decode polyline geometry from OpenRouteService
function decodePolyline(encoded) {
  const inv = 1.0 / 1e5
  const decoded = []
  let previous = [0, 0]
  let i = 0

  while (i < encoded.length) {
    let ll = [0, 0]
    for (let j = 0; j < 2; j++) {
      let shift = 0
      let result = 0
      let byte = 0
      do {
        byte = encoded.charCodeAt(i++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      ll[j] = previous[j] + (result & 1 ? ~(result >> 1) : result >> 1)
      previous[j] = ll[j]
    }
    decoded.push([
      ll[1] * inv,
      ll[0] * inv
    ])
  }
  return decoded
}

// Calculate distance in miles between two lat/lng points (Haversine formula)
function getDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate cumulative distance along a polyline and find coordinate at a specific distance
function findCoordinateAtDistance(polylineCoords, targetMiles) {
  let cumulativeDistance = 0
  
  for (let i = 0; i < polylineCoords.length - 1; i++) {
    const [lat1, lng1] = polylineCoords[i]
    const [lat2, lng2] = polylineCoords[i + 1]
    const segmentDistance = getDistanceMiles(lat1, lng1, lat2, lng2)
    
    if (cumulativeDistance + segmentDistance >= targetMiles) {
      // interpolate within this segment
      const remaining = targetMiles - cumulativeDistance
      const ratio = segmentDistance > 0 ? remaining / segmentDistance : 0
      const lat = lat1 + (lat2 - lat1) * ratio
      const lng = lng1 + (lng2 - lng1) * ratio
      return [lat, lng]
    }
    
    cumulativeDistance += segmentDistance
  }
  
  // if target is beyond the route, return the last coordinate
  return polylineCoords[polylineCoords.length - 1]
}

function createWaypointIcon(type) {
  const iconUrls = {
    start: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    pickup: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    end: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  }

  return L.icon({
    iconUrl: iconUrls[type] || iconUrls.pickup,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

function addWaypointMarkers(map, waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) {
    console.warn('⚠ addWaypointMarkers: waypoints empty or not an array', waypoints)
    return
  }

  console.log(`➕ Adding ${waypoints.length} waypoint markers`)
  waypoints.forEach((wp, idx) => {
    const label = idx === 0 ? 'Start' : idx === waypoints.length - 1 ? 'End' : 'Pickup'
    const type = idx === 0 ? 'start' : idx === waypoints.length - 1 ? 'end' : 'pickup'
    const icon = createWaypointIcon(type)
    
    console.log(`  Waypoint ${idx}:`, wp)
    
    let coords = null
    if (Array.isArray(wp.coordinates)) {
      // ORS returns [lng, lat], swap to [lat, lng] for Leaflet
      coords = [wp.coordinates[1], wp.coordinates[0]]
      console.log(`    Raw coords: [${wp.coordinates[0]}, ${wp.coordinates[1]}] → Leaflet: [${coords[0]}, ${coords[1]}]`)
    }

    if (!coords || coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
      console.warn(`❌ Invalid coordinates for ${label}:`, wp.coordinates, '→', coords)
      return
    }

    console.log(`  ✓ ${label} marker at [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`)
    L.marker(coords, { icon })
      .addTo(map)
      .bindPopup(`<b>${label}</b><br/>${wp.name || ''}`)
  })
}

function addFuelStopMarkers(map, routeCoordinates, fuelStops) {
  if (!Array.isArray(fuelStops) || fuelStops.length === 0) {
    console.warn('⚠ addFuelStopMarkers: fuelStops empty or not an array', fuelStops)
    return
  }
  L.marker([33.7490, -84.3880])
 .addTo(map)
 .bindPopup('Atlanta');
  console.log(`➕ Adding ${fuelStops.length} fuel stop markers`)
  fuelStops.forEach((stop, idx) => {
    const [lat, lng] = findCoordinateAtDistance(routeCoordinates, stop.mile_marker || 0)
    
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`❌ Invalid coordinates for Fuel Stop ${idx + 1} at mile ${stop.mile_marker}:`, [lat, lng])
      return
    }

    console.log(`  ✓ Fuel Stop ${idx + 1} at mile ${stop.mile_marker} → [${lat.toFixed(4)}, ${lng.toFixed(4)}]`)

    L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#ff8c00',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95,
    })
      .addTo(map)
      .bindPopup(`<b>Fuel Stop ${idx + 1}</b><br/>Mile ${stop.mile_marker}`)
  })
}


function RoutePage() {
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [mapError, setMapError] = useState(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    const tripData = sessionStorage.getItem('currentTrip')
    console.log('RoutePage mounted, tripData from session:', tripData ? 'exists' : 'null')
    if (tripData) {
      try {
        const parsed = JSON.parse(tripData)
        console.log('Parsed trip data:', parsed)
        setTrip(parsed)
      } catch (e) {
        console.error('Error parsing trip data:', e)
        setMapError('Invalid trip data')
      }
    }
  }, [])

  // Initialize map when trip data is loaded
  useEffect(() => {
    console.log('Map useEffect: trip=', trip, 'mapRef.current=', mapRef.current, 'mapInstanceRef.current=', mapInstanceRef.current)
    if (trip && mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [trip])

  const initializeMap = () => {
    try {
      // Validate trip structure
      if (!trip.route || !trip.route.geometry) {
        throw new Error('Missing route.geometry in trip data')
      }

      console.log('🗺️ Initializing map...')
      console.log('  trip.route.geometry type:', typeof trip.route.geometry)
      console.log('  trip.route.geometry length:', trip.route.geometry?.length)
      // console.log('  trip.route.geometry sample:', trip.route.geometry?.substring(0, 100))
      console.log(
        'trip.route.geometry:',
        trip.route.geometry
      )

      console.log(
        'geometry type:',
        trip.route.geometry?.type
      )

      console.log(
        'geometry coordinate count:',
        trip.route.geometry?.coordinates?.length
      )

      console.log(
        'first geometry coordinate:',
        trip.route.geometry?.coordinates?.[0]
      )

      // Decode route geometry (from OpenRouteService)
      //const routeCoordinates = decodePolyline(trip.route.geometry)
      const routeCoordinates =
        trip.route.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      )
      console.log('✓ Route coordinates decoded:', routeCoordinates.length, 'points')
      console.log('  First coord:', routeCoordinates[0], '(format: [lat, lng])')
      console.log('  Last coord:', routeCoordinates[routeCoordinates.length - 1])

      if (!routeCoordinates || routeCoordinates.length === 0) {
        throw new Error('Failed to decode route geometry')
      }

      if (isNaN(routeCoordinates[0][0]) || isNaN(routeCoordinates[0][1])) {
        throw new Error(`Invalid first coordinate: [${routeCoordinates[0][0]}, ${routeCoordinates[0][1]}]`)
      }

      console.log('✓ trip.route.waypoints:', trip.route.waypoints)
      console.log('✓ trip.fuel_stops:', trip.fuel_stops)
      
      // Create Leaflet map centered on first coordinate
      const map = L.map(mapRef.current).setView(routeCoordinates[0], 6)
      console.log('✓ Leaflet map created')

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)
      console.log('✓ Tiles added')

      // Draw route polyline
      const polyline = L.polyline(routeCoordinates, {
        color: '#1976d2',
        weight: 3,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(map)
      console.log('✓ Route polyline added')

      // Add waypoint and fuel stop markers
      addWaypointMarkers(map, trip.route.waypoints)
      addFuelStopMarkers(map, routeCoordinates, trip.fuel_stops)

      // Fit map bounds
      const bounds = L.latLngBounds(routeCoordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
      console.log('✓ Map bounds fitted')

      mapInstanceRef.current = map
      console.log('✓ Map initialization complete')
    } catch (error) {
      console.error('❌ Error initializing map:', error)
      setMapError(error.message)
    }
  }

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  if (!trip) {
    return (
      <Box>
        <Alert severity="info">No trip data. Please create a trip first.</Alert>
        <Button onClick={() => navigate('/trip')} sx={{ mt: 2 }}>Create New Trip</Button>
      </Box>
    )
  }

  if (mapError) {
    return (
      <Box>
        <Alert severity="error">Map Error: {mapError}</Alert>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Check browser console (F12) for detailed logs
        </Alert>
        <Button onClick={() => navigate('/trip')} sx={{ mt: 2 }}>Create New Trip</Button>
      </Box>
    )
  }

  const { route, fuel_stops, metadata } = trip

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Route Map</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {metadata.origin} → {metadata.pickup} → {metadata.destination}
        </Typography>
      </Box>

      {/* Leaflet Map */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Trip Route</Typography>
          <Box
            ref={mapRef}
            sx={{
              height: 500,
              width: '100%',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            🟢 Start • 🔵 Pickup • 🔴 End • 🟠 Fuel Stop
          </Typography>
        </CardContent>
      </Card>

      {/* Route Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Distance</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {route.distance_miles} miles
              </Typography>
              <Chip label={`${Math.round(route.distance_miles / 60)} avg speed`} size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Duration</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {route.duration_hours} hours
              </Typography>
              <Chip label="Drive time" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Fuel Stops</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {fuel_stops.length} stops
              </Typography>
              <Chip label="Every 1000 miles" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fuel Stops */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Fuel Stops</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
            {fuel_stops.map((stop, idx) => (
              <Card key={idx} variant="outlined">
                <CardContent>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Stop {idx + 1}</Typography>
                  <Typography variant="h6">Mile {stop.mile_marker}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Duration: {stop.duration_minutes} min
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => navigate('/timeline')}>
          View Trip Timeline →
        </Button>
      </Box>
    </Box>
  )
}


export default RoutePage;