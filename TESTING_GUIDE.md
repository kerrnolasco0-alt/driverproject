# Testing Guide - Fuel Stops Fix

## How to Test the Fixes

### Setup
1. Ensure backend is running: `python manage.py runserver`
2. Ensure frontend is running: `npm run dev` (in frontend directory)
3. Navigate to: http://localhost:5173 (or your frontend port)

---

## Test Case 1: Long Route (Should Generate Fuel Stops)

**Input:**
- Current Location: Houston, Texas
- Pickup Location: Dallas, Texas  
- Dropoff Location: New York, New York

**Expected Results:**
- ✅ Route shows correct driving path from Houston → Dallas → New York
- ✅ Red line follows actual US highways (I-45 → I-30 → I-40, etc.)
- ✅ Multiple orange fuel stop markers appear along the route
- ✅ Fuel stops are placed at ~300-350 mile intervals
- ✅ Fuel stops have real gas station names (Shell, Pilot, Loves, etc.)
- ✅ Each fuel stop is clickable and shows station name

**How to Verify:**
1. Click on each orange fuel marker
2. Read the popup - should show actual gas station name
3. Check spacing - stops should be roughly equal distance apart
4. Verify stops are along the main highway, not random locations

---

## Test Case 2: Short Route (Should NOT Generate Fuel Stops)

**Input:**
- Current Location: Houston, Texas
- Pickup Location: College Station, Texas
- Dropoff Location: Austin, Texas

**Expected Results:**
- ✅ Route displays correctly (~200 miles total)
- ✅ No fuel stops appear (under 400 mile range)
- ✅ Only show Current, Pickup, Dropoff markers
- ✅ No orange markers on map

---

## Test Case 3: Medium Route (Should Generate 1-2 Stops)

**Input:**
- Current Location: Los Angeles, California
- Pickup Location: Phoenix, Arizona
- Dropoff Location: Albuquerque, New Mexico

**Expected Results:**
- ✅ Route shows ~600 miles
- ✅ 1-2 fuel stops appear
- ✅ First stop around 300 miles
- ✅ Second stop (if present) around 600 miles

---

## Debugging - If Tests Fail

### No Fuel Stops Appearing

1. **Check Backend Logs:**
   ```
   python manage.py runserver
   # Look for error messages
   ```

2. **Check API Response:**
   - Open Browser DevTools (F12)
   - Go to Network tab
   - Create trip and look for `/api/generate-trip/` request
   - Check Response - should have `fuel_stops` array

3. **Verify Overpass API:**
   ```python
   # Test in Python shell
   import requests
   lat, lng = 35.5, -97.5  # Oklahoma
   query = f"""
   [out:json][timeout:5];
   (
     node["amenity"="fuel"](around:15000,{lat},{lng});
     node["amenity"="fuel"]["name"~".*[Ss]tation.*"](around:15000,{lat},{lng});
   );
   out center 10;
   """
   r = requests.get("https://overpass-api.de/api/interpreter", 
                    params={"data": query}, timeout=5)
   print(r.json())
   ```

### Route Looking Wrong

1. **Check Distance:**
   - Open DevTools
   - In Response tab, check `metadata.total_distance`
   - Should be in miles, not thousands of meters

2. **Test OSRM Directly:**
   ```
   http://router.project-osrm.org/route/v1/driving/-73.9857,40.7484;-87.6298,41.8781;-112.0742,33.4484?overview=full&geometries=geojson
   ```
   (That's NYC → Chicago → Phoenix - should return valid route)

### Performance Issues

- Overpass API can be slow (5-30 seconds)
- Multiple queries can take time
- Consider adding loading indicator to frontend

---

## Verification Checklist

- [ ] Long route generates multiple fuel stops
- [ ] Fuel stops are real gas station names (not "Fuel Stop 1")
- [ ] Stops are evenly spaced along route
- [ ] Route follows actual highways (not direct diagonal line)
- [ ] Distance shown in miles (not thousands)
- [ ] Short routes don't generate unnecessary stops
- [ ] All markers appear on map
- [ ] Can click each marker for details
- [ ] No console errors in browser

---

## Performance Notes

- First request may be slow (API calls to Nominatim, OSRM, Overpass)
- Subsequent requests should be faster due to caching
- Fuel stop finding is the slowest part (multiple Overpass queries)
- Consider implementing caching in production

---

## Sample Request/Response

### Request
```json
{
  "current_location": "Houston, Texas",
  "pickup_location": "Dallas, Texas",
  "dropoff_location": "New York, New York",
  "cycle_used": 0,
  "driver_name": "John Smith",
  "carrier_name": "Assessment Carrier"
}
```

### Response (Partial)
```json
{
  "route": {
    "geometry": [
      [-97.5, 29.7],
      [-97.4, 29.75],
      ...
    ],
    "waypoints": [...]
  },
  "fuel_stops": [
    {
      "station_name": "Pilot Flying J",
      "lat": 34.2, 
      "lng": -98.5,
      "stop_distance": 320
    },
    {
      "station_name": "Love's Travel Stops",
      "lat": 35.1,
      "lng": -97.8,
      "stop_distance": 640
    }
  ],
  "metadata": {
    "total_distance": 1847.3
  }
}
```

---

## Questions?

If tests are failing:
1. Check backend console for Python errors
2. Check browser console (F12) for JS errors  
3. Verify API endpoints are running
4. Try with different city pairs
5. Check internet connection (APIs require internet)
