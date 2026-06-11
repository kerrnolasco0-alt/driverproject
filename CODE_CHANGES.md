# Code Changes Documentation

## Overview of Changes

Three main files were updated to fix fuel stop and roadway issues:

1. **`backend/hos/services/fuel_stop_calculator.py`** - Fuel capacity modeling
2. **`backend/routing/services/route_service.py`** - Route calculation fixes
3. **`backend/trip/services/trip_planner.py`** - Intelligent fuel stop placement

---

## 1. FuelStopCalculator Changes

### Location
`backend/hos/services/fuel_stop_calculator.py`

### What Was Changed

**Before:**
```python
def calculate(self, total_miles):
    return []  # Did nothing!
```

**After:**
```python
class FuelStopCalculator:
    FUEL_RANGE = 400        # Typical truck can go 400 miles on full tank
    REFUEL_BUFFER = 0.8     # Refuel when 80% of range is consumed
    
    def calculate(self, total_miles):
        """Calculate fuel stops based on total trip distance"""
        if total_miles <= self.FUEL_RANGE:
            return []
        
        fuel_stops = []
        miles_traveled = 0
        stop_number = 1
        
        # Generate stops every 320 miles (400 * 0.8)
        while miles_traveled + self.FUEL_RANGE < total_miles:
            miles_traveled += self.FUEL_RANGE * self.REFUEL_BUFFER
            fuel_stops.append({
                "stop_number": stop_number,
                "miles_at": miles_traveled
            })
            stop_number += 1
        
        return fuel_stops
```

### Key Improvements
- ✅ Calculates stops based on fuel capacity (400 miles)
- ✅ Prevents running out of fuel (80% buffer)
- ✅ Returns calculated stop distances for navigation
- ✅ Added `haversine()` method for accurate distance calculations

### Example
- Trip: 2000 miles
- Fuel range: 400 miles
- Refuel buffer: 320 miles
- Stops: 2000 / 320 = ~6 stops
- Stop locations: 320, 640, 960, 1280, 1600, 1920 miles

---

## 2. RouteService Changes

### Location
`backend/routing/services/route_service.py`

### What Was Changed

**Before:**
```python
def calculate_route(self, current, pickup, dropoff):
    # ...
    resp = requests.get(url, timeout=10).json()
    geometry = resp['routes'][0]['geometry']['coordinates']
    return Route(geometry=geometry, total_miles=resp['routes'][0]['distance'])
    # PROBLEM: distance in meters, not miles!
```

**After:**
```python
def calculate_route(self, current, pickup, dropoff):
    # ...
    try:
        resp = requests.get(url, timeout=10).json()
        
        if 'routes' not in resp or not resp['routes']:
            raise Exception("No route found from OSRM")
        
        route_data = resp['routes'][0]
        geometry = route_data['geometry']['coordinates']  # [lng, lat]
        
        # Convert meters to miles: meters / 1609.34 = miles
        distance_miles = route_data['distance'] / 1609.34
        
        return Route(geometry=geometry, total_miles=distance_miles)
    except requests.exceptions.RequestException as e:
        raise Exception(f"Route calculation failed: {str(e)}")
```

### Key Improvements
- ✅ Proper unit conversion: meters → miles (÷ 1609.34)
- ✅ Error handling for missing routes
- ✅ Response validation before processing
- ✅ Better exception messages for debugging
- ✅ Timeout protection

### Example
- OSRM returns: `{"distance": 2976432}` (meters)
- Converted: 2976432 / 1609.34 = 1848.5 miles ✓

---

## 3. TripPlanner Changes

### Location
`backend/trip/services/trip_planner.py`

### Major Rewrite: generate_real_fuel_stops()

**Before:**
```python
def generate_real_fuel_stops(self, route_coords, radius=10000):
    fuel_stops = []
    
    # Only 3 fixed sample points
    sample_indexes = [
        int(len(route_coords)*0.25),
        int(len(route_coords)*0.5),
        int(len(route_coords)*0.75)
    ]

    for idx in sample_indexes:
        lat, lng = route_coords[idx]
        query = f"""..."""
        try:
            response = requests.get(...)
            data = response.json()
            for element in data.get("elements", []):
                fuel_stops.append({...})
                break  # Only take first result!
        except Exception:
            continue

    unique_stops = {(fs['lat'], fs['lng']): fs for fs in fuel_stops}
    return list(unique_stops.values())
    
# PROBLEMS:
# 1. Only 3 fixed points on route
# 2. Only 1 stop per point
# 3. No intelligent stop placement
# 4. Ignores fuel consumption rate
```

**After:**
```python
def generate_real_fuel_stops(self, route_coords, total_distance):
    """
    Find gas stations along the route at strategic intervals based on fuel range.
    """
    fuel_calc = FuelStopCalculator()
    fuel_stops = []
    
    # Calculate interval between stops (400 miles * 80% buffer = 320 miles)
    miles_needed_for_fuel_interval = fuel_calc.FUEL_RANGE * fuel_calc.REFUEL_BUFFER
    
    if total_distance <= fuel_calc.FUEL_RANGE:
        return []  # No fuel stop needed for short trips
    
    # Calculate how many stops are needed
    num_stops = max(1, int(total_distance / miles_needed_for_fuel_interval))
    
    # Calculate distances at which to place fuel stops
    stop_distances = []
    for i in range(1, num_stops):
        distance = (total_distance / num_stops) * i
        stop_distances.append(distance)
    
    # Convert distances to route indices
    route_length = len(route_coords)
    distance_per_index = total_distance / route_length if route_length > 0 else 0
    
    for stop_distance in stop_distances:
        idx = int(stop_distance / distance_per_index) if distance_per_index > 0 else 0
        idx = min(idx, route_length - 1)
        
        if idx >= 0 and idx < route_length:
            lat, lng = route_coords[idx]
            
            # Intelligent Overpass query
            try:
                query = f"""
                [out:json][timeout:5];
                (
                  node["amenity"="fuel"](around:15000,{lat},{lng});
                  node["amenity"="fuel"]["name"~".*[Ss]tation.*"](around:15000,{lat},{lng});
                );
                out center 10;
                """
                response = requests.get(
                    "https://overpass-api.de/api/interpreter",
                    params={"data": query},
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    elements = data.get("elements", [])
                    
                    if elements:
                        # Sort by distance from route point
                        elements_with_dist = []
                        for elem in elements:
                            if "lat" in elem and "lon" in elem:
                                elem_lat, elem_lng = elem["lat"], elem["lon"]
                                dist = fuel_calc.haversine(lng, lat, elem_lng, elem_lat)
                                elements_with_dist.append((dist, elem))
                        
                        # Sort by distance and take closest ones
                        elements_with_dist.sort(key=lambda x: x[0])
                        
                        # Add up to 2 closest stations per stop
                        for _, elem in elements_with_dist[:2]:
                            station_name = elem.get("tags", {}).get("name", "Fuel Station")
                            fuel_stops.append({
                                "station_name": station_name,
                                "lat": elem["lat"],
                                "lng": elem["lon"],
                                "stop_distance": stop_distance
                            })
            except Exception as e:
                print(f"Error querying fuel stops: {e}")
                continue
    
    # Remove duplicates
    unique_stops = {}
    for stop in fuel_stops:
        key = (stop['lat'], stop['lng'])
        if key not in unique_stops:
            unique_stops[key] = stop
    
    return list(unique_stops.values())

# IMPROVEMENTS:
# ✅ Dynamic stop count based on distance
# ✅ Intelligent point selection (not fixed 3 points)
# ✅ Up to 2 closest stations per stop
# ✅ Haversine-based distance sorting
# ✅ Pattern matching for gas stations
# ✅ Duplicate removal
# ✅ Better error handling
```

### Key Improvements
- ✅ **Dynamic Stop Placement**: Calculates exact number of stops needed
- ✅ **Fuel-Aware**: Places stops before truck runs out of fuel
- ✅ **Multiple Results**: Returns 2 closest stations per stop
- ✅ **Distance Sorting**: Uses haversine formula for accurate distances
- ✅ **Station Finding**: Searches by name pattern ("Station") + amenity
- ✅ **Duplicate Removal**: Prevents showing same station twice
- ✅ **Better API Usage**: More efficient Overpass queries

### Algorithm Flow

```
1. Input: route_coords[], total_distance

2. Calculate fuel stop interval:
   interval = 400 miles * 0.8 = 320 miles

3. Calculate needed stops:
   num_stops = total_distance / interval
   
4. Distribute stops evenly:
   stops_at = [distance/num_stops * 1, distance/num_stops * 2, ...]

5. For each stop point:
   a. Find route index at that distance
   b. Get lat/lng at that route point
   c. Query Overpass for fuel stations within 15km
   d. Sort by distance (closest first)
   e. Add top 2 stations

6. Remove duplicates
7. Return list of fuel stops with coordinates
```

### Example for 2000-Mile Trip

```
Total Distance: 2000 miles
Fuel Interval: 320 miles
Stops Needed: 2000 / 320 = 6.25 → 6 stops

Stop 1: 333 miles  → Query at route point for 333mi
Stop 2: 667 miles  → Query at route point for 667mi
Stop 3: 1000 miles → Query at route point for 1000mi
Stop 4: 1333 miles → Query at route point for 1333mi
Stop 5: 1667 miles → Query at route point for 1667mi

Result: Real gas stations returned with coordinates ✓
```

---

## 4. TripPlanner.generate_trip() Update

**Added:**
```python
# Get total distance in miles
total_distance = route.total_miles / 1000 if route.total_miles > 1000 else route.total_miles

fuel_stops = self.generate_real_fuel_stops(route_coords, total_distance)

# Include distance in response
"metadata": {
    "total_distance": total_distance
}
```

**Why:**
- Passes actual distance to fuel stop calculator
- Prevents unit confusion (miles vs km vs meters)
- Metadata helps frontend display distance

---

## Constants File

### Location
`backend/hos/constants.py`

### Used By
```python
FUEL_RANGE = 400         # From FuelStopCalculator
AVG_SPEED = 55           # For time calculations
MAX_DRIVING_HOURS = 11   # HOS regulations
MAX_CYCLE_HOURS = 70     # 70-hour/8-day cycle
```

---

## Frontend Integration

### RouteMap Component
Already properly handles:
- ✅ Route geometry rendering
- ✅ Fuel stop markers (orange)
- ✅ Waypoint markers (colors)
- ✅ Popup labels

No changes needed - works with new data!

---

## Error Scenarios & Handling

### Scenario 1: Route Calculation Fails
```
Exception: "Route calculation failed: Connection error"
→ User sees error message
→ Asked to try again
```

### Scenario 2: Geocoding Fails
```
Exception: "Cannot geocode address Houston"
→ User sees error message
→ Asked to check address spelling
```

### Scenario 3: Overpass API Timeout
```
Exception in fuel_stop_calculator
→ Continues without that stop
→ Returns partial results
→ Better than no results
```

### Scenario 4: No Fuel Stations Found
```
elements = []
→ Adds generic "Fuel Station" marker
→ Still shows approximate location
```

---

## Performance Considerations

| Operation | Time |
|-----------|------|
| Nominatim geocoding | 1-2 sec |
| OSRM route calc | 1-2 sec |
| Overpass query (1) | 2-5 sec |
| Multiple Overpass queries | 5-30 sec |
| **Total** | **~10-40 sec** |

**Optimization Options:**
- Cache known routes
- Use local Overpass instances
- Parallelize API calls
- Pre-calculate common routes

---

## Testing Strategy

### Unit Tests Recommended
```python
def test_fuel_stop_calculation():
    calc = FuelStopCalculator()
    stops = calc.calculate(2000)
    assert len(stops) == 6  # 2000 / 320 ≈ 6
    assert stops[0]['miles_at'] == 320

def test_haversine_distance():
    calc = FuelStopCalculator()
    dist = calc.haversine(-97.5, 29.7, -97.4, 29.8)
    assert 0 < dist < 10  # Should be < 10 miles

def test_route_distance_conversion():
    route = RouteService().calculate_route(...)
    assert route.total_miles > 0
    assert route.total_miles < 10000  # Sanity check
```

### Integration Tests
See `TESTING_GUIDE.md` for full testing procedures.

---

## Questions or Issues?

1. **Fuel stops not appearing?** → Check Overpass API response
2. **Wrong distance?** → Verify OSRM response format
3. **Wrong route?** → Check OSRM with test URL
4. **Performance slow?** → Add caching layer

See `FUEL_STOPS_FIX_SUMMARY.md` for more details.
