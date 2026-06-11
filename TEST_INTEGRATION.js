#!/usr/bin/env node
/**
 * Quick Integration Test Guide
 * Verify that the React frontend is properly integrated with Django backend
 */

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║           DRIVER TRIP PLANNER - INTEGRATION TEST GUIDE                ║
╚════════════════════════════════════════════════════════════════════════╝

This guide verifies that the React frontend is properly integrated with
the Django backend API.

PREREQUISITES:
✓ Backend running on http://127.0.0.1:8000
✓ Frontend running on http://localhost:3000
✓ Both services accessible from each other

STEP 1: Test Backend API
═══════════════════════════════════════════════════════════════════════════

Open a terminal and test the API directly:

  curl -X POST http://127.0.0.1:8000/api/generate-trip/ \\
    -H "Content-Type: application/json" \\
    -d '{
      "current_location": "Houston, TX",
      "pickup_location": "Dallas, TX", 
      "dropoff_location": "New York, NY",
      "cycle_used": 10,
      "driver_name": "John Smith",
      "carrier_name": "Test Carrier"
    }'

Expected Response:
- Status: 200 OK
- JSON with: metadata, route, fuel_stops, trip_summary, days, pdf_file
- No CORS errors

If you get CORS errors:
- Verify CORS_ALLOW_ALL_ORIGINS = True in backend/driverbackend/settings.py
- Restart backend server


STEP 2: Test Frontend Pages
═══════════════════════════════════════════════════════════════════════════

1. Dashboard (http://localhost:3000)
   - Should display mock data initially
   - Shows "Welcome back, John Smith" message
   - "Create New Trip" button navigates to /trip

2. Create Trip (http://localhost:3000/trip)
   - Form has 6 fields:
     * Driver Name
     * Carrier Name
     * Current Location
     * Pickup Location
     * Dropoff Location
     * Cycle Hours Used
   - Submit form with:
     - Current: Houston, TX
     - Pickup: Dallas, TX
     - Dropoff: New York, NY
     - Cycle Used: 10
   - Check browser console for API response
   - Should see success message and navigate to /route

3. Route Map (http://localhost:3000/route)
   - Should display actual trip data:
     * Total Distance (should be 1500+ miles)
     * Total Duration (should be 20+ hours)
     * Fuel Stops (should be 1-2 stops)
   - Fuel stops grid shows mile markers
   - "View Trip Timeline" button works

4. Trip Timeline (http://localhost:3000/timeline)
   - Shows total days, miles, hours
   - Day-by-day table with actual data
   - Detailed segments section with status, times, descriptions
   - Navigation to /logs works

5. FMCSA Logs (http://localhost:3000/logs)
   - Day selector shows all trip days
   - Daily stats update when selecting different days
   - Segments table shows actual HOS data with status chips
   - Time format shows H:MM

6. PDF Preview (http://localhost:3000/pdf)
   - Shows "PDF generated successfully" message
   - Displays trip metadata (origin, pickup, destination, driver)
   - Shows trip summary stats
   - Download button visible and enabled
   - Click download attempts to fetch from backend


DEBUGGING
═════════════════════════════════════════════════════════════════════════

Check Browser Console for Errors:
  Open DevTools (F12) → Console tab
  Look for API errors or component errors

Common Issues:

1. "Failed to fetch" or CORS errors
   → Backend not running or CORS not configured
   → Verify http://127.0.0.1:8000/api is accessible

2. "Cannot read property 'trip_summary' of null"
   → Trip data not stored in sessionStorage
   → Verify form submission succeeded
   → Check Network tab for API response

3. Pages show mock data instead of real data
   → sessionStorage.getItem('currentTrip') returned null
   → Verify trip generation was successful
   → Check API response in Network tab

4. "No trip data" message on all pages
   → sessionStorage not being set
   → Verify CreateTripPage API call succeeded
   → Check browser sessionStorage in DevTools

Check Network Traffic:
  1. Open DevTools → Network tab
  2. Create a trip via form
  3. Look for POST request to "generate-trip"
  4. Verify response status is 200
  5. Check response body for trip data

View Session Storage:
  1. Open DevTools → Application tab
  2. Look for "Session Storage" section
  3. Click on http://localhost:3000
  4. Find key "currentTrip"
  5. Verify JSON data is stored


EXPECTED DATA FLOW
═════════════════════════════════════════════════════════════════════════

1. User fills form on /trip
2. Form POST to http://127.0.0.1:8000/api/generate-trip/
3. Backend processes and returns trip data
4. Frontend stores response in sessionStorage['currentTrip']
5. Frontend navigates to /route
6. All subsequent pages read from sessionStorage
7. Data persists until page refresh or new trip created


VERIFYING EACH PAGE
═════════════════════════════════════════════════════════════════════════

Dashboard (/dashboard)
- [ ] Shows current trip info (if available)
- [ ] Quick links panel visible
- [ ] Recent trips table shows current trip at top
- [ ] Create New Trip button works

Create Trip (/trip)
- [ ] All 6 form fields present
- [ ] Form submission triggers API call
- [ ] Loading state shows during submission
- [ ] Success message appears on success
- [ ] Error message appears on failure
- [ ] Auto-navigate to /route on success

Route Map (/route)
- [ ] Displays real distance_miles from backend
- [ ] Displays real duration_hours from backend
- [ ] Fuel stops grid shows all stops
- [ ] Each fuel stop shows mile_marker and duration_minutes
- [ ] No trip data message if no trip loaded

Trip Timeline (/timeline)
- [ ] Shows actual total_days from trip data
- [ ] Day table shows all days with real data
- [ ] Segments section shows each day's segments
- [ ] Segments have status, times, duration, description

FMCSA Logs (/logs)
- [ ] Day toggle buttons generated for all days
- [ ] Daily stats update when day selected
- [ ] Segments table shows real data for selected day
- [ ] Status chips show correct colors
- [ ] Times formatted as H:MM

PDF Preview (/pdf)
- [ ] Displays generated pdf_file name
- [ ] Shows trip metadata fields
- [ ] Shows trip_summary stats
- [ ] Download button enabled with pdf_file
- [ ] Download creates HTTP request to backend


SUCCESS CRITERIA
═════════════════════════════════════════════════════════════════════════

All pages should display real backend data:
✓ Route statistics match backend response
✓ Days array properly displayed
✓ Segments show correct HOS status
✓ Fuel stops show mile markers
✓ PDF filename displayed
✓ All navigation between pages works
✓ No console errors
✓ No "No trip data" messages (after creating trip)


PERFORMANCE NOTES
═════════════════════════════════════════════════════════════════════════

First-time trip generation might take 5-10 seconds due to:
- Route calculation via OpenRouteService API
- HOS engine calculations
- PDF generation
- Overall trip processing

This is normal and expected.


CLEANUP
═════════════════════════════════════════════════════════════════════════

To clear session and start fresh:
1. Open DevTools → Application tab
2. Find Session Storage
3. Right-click "currentTrip" key
4. Delete item
5. Refresh page
6. Create new trip

Or: Open DevTools console and run:
  sessionStorage.removeItem('currentTrip')
  location.reload()


FILES TO REVIEW
═════════════════════════════════════════════════════════════════════════

Frontend Pages:
- src/pages/CreateTripPage.jsx - Form and API integration
- src/pages/DashboardPage.jsx - Home page with trip info
- src/pages/RoutePage.jsx - Route display
- src/pages/TimelinePage.jsx - Day-by-day breakdown
- src/pages/LogsPage.jsx - HOS logs viewer
- src/pages/PdfPage.jsx - PDF preview and download

API Client:
- src/utils/api.js - generateTrip() function

Backend Endpoint:
- backend/api/views.py - GenerateTripView POST handler
- backend/trip/services/trip_planner.py - Trip generation logic

═════════════════════════════════════════════════════════════════════════

For more details, see FRONTEND_INTEGRATION.md
`);
