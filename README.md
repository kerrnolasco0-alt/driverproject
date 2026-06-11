# Driver Trip Planner - Complete Integration

A full-stack application for planning and tracking FMCSA-compliant driver trips with real-time route calculation, Hours of Service engine, and PDF log generation.

## 🎯 Features

- **Trip Planning**: Generate complete trip plans with locations and HOS compliance
- **Route Calculation**: Real-time distance/time calculation via OpenRouteService
- **HOS Engine**: FMCSA Hours of Service regulation compliance tracking
- **Fuel Stops**: Automatic fuel stop calculation every 1000 miles
- **Daily Logs**: Multi-page PDF generation with FMCSA-compliant layouts
- **Interactive Dashboard**: Real-time trip tracking and visualization
- **Material-UI**: Modern, responsive user interface

## 🏗️ Architecture

```
Project Structure:
├── backend/                 # Django REST API
│   ├── api/                # Main API endpoints
│   ├── routing/            # Route calculation service
│   ├── hos/                # Hours of Service engine
│   ├── trip/               # Trip planning orchestration
│   ├── logs/               # PDF generation and logging
│   ├── common/             # Shared utilities
│   └── manage.py
├── frontend/               # React SPA
│   ├── src/
│   │   ├── pages/          # 6 main pages
│   │   ├── layouts/        # MainLayout with sidebar
│   │   ├── utils/          # API client
│   │   └── App.jsx
│   └── package.json
└── pdfs/                   # Generated PDF storage (backend)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn
- OpenRouteService API key (configured in backend)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations (if needed)
python manage.py migrate

# Start development server
python manage.py runserver

# Server runs on: http://127.0.0.1:8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on: http://localhost:3000
```

## 📱 Pages

### 1. **Dashboard** (/)
Homepage with trip statistics and recent trips list
- Quick stats: Total miles, trips generated, days, hours
- Current trip info (if available)
- Quick navigation links to all pages
- Recent trips table

### 2. **Create Trip** (/trip)
Trip planning form with backend integration
- Form fields:
  - Driver Name
  - Carrier Name
  - Current Location
  - Pickup Location
  - Dropoff Location
  - Cycle Hours Used (0-70)
- Real-time validation
- Loading state during submission
- Error handling and alerts

### 3. **Route Map** (/route)
Route visualization and fuel stop planning
- Distance and duration display
- Fuel stops with mile markers
- Interactive grid layout
- Leaflet map placeholder for future integration

### 4. **Trip Timeline** (/timeline)
Day-by-day trip schedule
- Total trip summary
- Daily breakdown table
- Detailed segments for each day
- Duty status visualization

### 5. **FMCSA Logs** (/logs)
Hours of Service compliance logs
- Day selector
- Daily statistics
- Segments table with status chips
- Time formatting
- HOS chart placeholder

### 6. **PDF Preview** (/pdf)
PDF log viewing and download
- Trip metadata display
- PDF filename and info
- Download functionality
- PDF viewer placeholder

## 🔌 API Integration

### Endpoint
```
POST /api/generate-trip/
```

### Request Body
```json
{
  "current_location": "Houston, TX",
  "pickup_location": "Dallas, TX",
  "dropoff_location": "New York, NY",
  "cycle_used": 10,
  "driver_name": "John Smith",
  "carrier_name": "Test Carrier"
}
```

### Response
```json
{
  "metadata": {
    "date": "2024-01-15",
    "driver_name": "John Smith",
    "carrier_name": "Test Carrier",
    "origin": "Houston, TX",
    "pickup": "Dallas, TX",
    "destination": "New York, NY",
    "cycle_used": 10
  },
  "route": {
    "distance_miles": 1500.5,
    "duration_hours": 24.3,
    "geometry": "...",
    "waypoints": [...]
  },
  "fuel_stops": [
    {
      "mile_marker": 1000,
      "duration_minutes": 30
    }
  ],
  "cycle_status": {
    "used": 10,
    "remaining": 60,
    "restart_required": false
  },
  "trip_summary": {
    "total_days": 2,
    "total_miles": 1500.5,
    "total_drive_hours": 24.3
  },
  "days": [
    {
      "day": 1,
      "miles_driven": 750,
      "driving_hours": 12,
      "on_duty_hours": 14,
      "segments": [
        {
          "status": "DRIVING",
          "description": "Main route",
          "location": "Houston, TX",
          "start_time": 0,
          "end_time": 12
        }
      ]
    }
  ],
  "logs": [...],
  "pdf_file": "trip_Houston_to_New_York.pdf"
}
```

## 🗂️ State Management

The frontend uses **React sessionStorage** for trip data persistence:

```javascript
// Store trip data after API response
sessionStorage.setItem('currentTrip', JSON.stringify(response))

// Retrieve trip data in any page
const tripData = JSON.parse(sessionStorage.getItem('currentTrip'))

// Clear trip data
sessionStorage.removeItem('currentTrip')
```

**Benefits:**
- Simple implementation without Redux/Context API
- Persists during session
- Automatically cleared on browser close
- Easy debugging via DevTools

**Limitations:**
- Lost on page refresh
- Limited to single trip at a time
- No multi-tab sync

## 🛠️ Technology Stack

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - REST API
- **django-cors-headers** - CORS support
- **OpenRouteService** - Route calculation
- **ReportLab** - PDF generation
- **Geopy** - Geocoding
- **NumPy** - Calculations
- **SQLite** - Database

### Frontend
- **React 18.2** - UI framework
- **React Router 7.16** - Client routing
- **Material-UI 9.0** - Component library
- **Axios 1.16** - HTTP client
- **Vite 5.0** - Build tool
- **Emotion** - CSS-in-JS styling

## 🔄 Data Flow

```
User Input (Create Trip Form)
    ↓
POST /api/generate-trip/ (Backend)
    ↓
Backend Processing:
  - Route Calculation (OpenRouteService)
  - HOS Engine (FMCSA compliance)
  - Fuel Stop Calculator
  - PDF Generation
    ↓
JSON Response + PDF File
    ↓
Store in sessionStorage (Frontend)
    ↓
Render in Pages (React Components)
    ↓
User Views Route, Timeline, Logs, PDF
    ↓
Download PDF from backend/pdfs/
```

## 📊 Pages Integration

Each page reads from `sessionStorage.getItem('currentTrip')`:

| Page | Uses | Displays |
|------|------|----------|
| Dashboard | metadata, trip_summary, days | Current trip, quick stats |
| Route | route, fuel_stops | Distance, stops, map placeholder |
| Timeline | days, trip_summary | Daily breakdown, segments |
| Logs | days | Duty status, segments, times |
| PDF | metadata, trip_summary, pdf_file | Trip info, download button |

## 🚦 Error Handling

### API Errors
- Caught in CreateTripPage via try-catch
- Displayed as alert to user
- Error details logged to console
- Error.response.data.detail used for message

### Network Errors
- CORS errors logged to console
- Network errors caught in API client
- User sees generic error message
- Retry functionality available

### Validation
- Frontend form validation before submit
- Backend validation in GenerateTripView
- Empty location checks
- Cycle hours range validation (0-70)

## 📝 Configuration

### Backend Settings
File: `backend/driverbackend/settings.py`

```python
# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins (dev only)

# Static Files
STATIC_URL = 'static/'

# OpenRouteService API Key
ORS_API_KEY = "your_api_key_here"
```

### Frontend Configuration
File: `frontend/src/utils/api.js`

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api'

// To make configurable, use environment variables:
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
```

## 🧪 Testing

### Manual Testing
1. Start both backend and frontend
2. Navigate to http://localhost:3000
3. Fill form on /trip page
4. Submit and verify data appears on all pages
5. Check browser console for errors
6. Verify PDF download works

### API Testing
```bash
curl -X POST http://127.0.0.1:8000/api/generate-trip/ \
  -H "Content-Type: application/json" \
  -d '{
    "current_location": "Houston, TX",
    "pickup_location": "Dallas, TX",
    "dropoff_location": "New York, NY",
    "cycle_used": 10,
    "driver_name": "Test Driver",
    "carrier_name": "Test Carrier"
  }'
```

### Debugging in Browser
1. Open DevTools (F12)
2. Console tab - Check for errors
3. Network tab - Inspect API calls
4. Application tab - View sessionStorage
5. Components tab - Inspect React state

## 🔐 Security Notes

### Development Only
- `DEBUG = True` in settings.py
- `CORS_ALLOW_ALL_ORIGINS = True`
- Database is SQLite (no production use)
- No authentication/authorization

### Production Recommendations
1. Set `DEBUG = False`
2. Configure specific `ALLOWED_HOSTS`
3. Restrict `CORS_ALLOWED_ORIGINS`
4. Use production database (PostgreSQL)
5. Add authentication/authorization
6. Use HTTPS
7. Secure API key storage
8. Add rate limiting

## 📦 File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── CreateTripPage.jsx      # Trip form + API integration
│   │   ├── DashboardPage.jsx       # Home with trip info
│   │   ├── RoutePage.jsx           # Route visualization
│   │   ├── TimelinePage.jsx        # Day-by-day breakdown
│   │   ├── LogsPage.jsx            # HOS logs
│   │   └── PdfPage.jsx             # PDF preview + download
│   ├── layouts/
│   │   └── MainLayout.jsx          # Sidebar + AppBar + Routes
│   ├── utils/
│   │   └── api.js                  # API client (axios)
│   ├── App.jsx                     # Main component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json
├── vite.config.js
└── index.html

backend/
├── api/
│   ├── views.py                    # API endpoints
│   ├── urls.py                     # API routing
│   └── ...
├── trip/
│   └── services/
│       └── trip_planner.py         # Trip orchestration
├── hos/
│   └── services/
│       ├── hos_engine.py           # HOS calculations
│       └── fuel_stop_calculator.py # Fuel stops
├── routing/
│   └── services/
│       └── route_service.py        # Route calculation
├── logs/
│   └── services/
│       ├── pdf_generator.py        # PDF creation
│       └── log_generator.py        # Log generation
├── manage.py
├── requirements.txt
└── driverbackend/
    ├── settings.py                 # Django settings
    ├── urls.py                     # Root URL config
    └── ...
```

## 🐛 Known Issues

1. **Map not displayed** - Leaflet placeholder exists, needs implementation
2. **PDF preview not working** - Placeholder exists, needs PDF viewer library
3. **No trip history** - Only current trip in session storage
4. **No offline support** - Requires backend connectivity
5. **No input validation** - Backend validation only, consider frontend validation

## 🚀 Future Enhancements

1. **Leaflet Integration**
   - Display actual route on map
   - Show fuel stops as markers
   - Interactive route editing

2. **State Management**
   - Redux or Zustand for complex state
   - Trip history management
   - Multiple trips support
   - User preferences storage

3. **PDF Viewer**
   - Inline PDF preview
   - Multi-page navigation
   - Print functionality

4. **Authentication**
   - User login/registration
   - JWT tokens
   - Role-based access control

5. **Database Features**
   - Save trip history
   - Driver profiles
   - Trip sharing
   - Export to formats

6. **Advanced Features**
   - Real-time traffic updates
   - Weather integration
   - Route optimization
   - Compliance reporting

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Review FRONTEND_INTEGRATION.md for API details
3. Check TEST_INTEGRATION.js for debugging guide
4. Verify backend is running: `python manage.py runserver`
5. Verify frontend can connect: Check Network tab in DevTools

## 📄 License

[Add your license here]

## 👤 Author

[Add author information here]

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Development
