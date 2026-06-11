import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Favorite as FavoriteIcon } from '@mui/icons-material'

function DashboardPage() {
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [mockTrips] = useState([
    { id: 'TRP-0001', route: 'Dallas, TX → Chicago, IL', date: 'May 28, 2024', miles: 2034.1, days: 3, status: 'Completed' },
    { id: 'TRP-0002', route: 'Phoenix, AZ → Denver, CO', date: 'May 24, 2024', miles: 803.8, days: 2, status: 'Completed' },
    { id: 'TRP-0003', route: 'Miami, FL → Atlanta, GA', date: 'May 20, 2024', miles: 663.8, days: 2, status: 'Completed' },
  ])

  useEffect(() => {
    const tripData = sessionStorage.getItem('currentTrip')
    if (tripData) {
      setTrip(JSON.parse(tripData))
    }
  }, [])

  const recentTrips = trip 
    ? [
        {
          id: 'TRP-Current',
          route: `${trip.metadata.origin} → ${trip.metadata.destination}`,
          date: trip.metadata.date,
          miles: trip.trip_summary.total_miles,
          days: trip.trip_summary.total_days,
          status: 'Generated'
        },
        ...mockTrips
      ]
    : mockTrips

  const stats = trip ? {
    totalMiles: trip.trip_summary.total_miles,
    completedTrips: 1,
    averageMiles: trip.trip_summary.total_miles,
    drivingHours: trip.trip_summary.total_drive_hours
  } : {
    totalMiles: 3340.1,
    completedTrips: 6,
    averageMiles: 53.5,
    drivingHours: 11.0
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Dashboard</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {trip ? `Trip from ${trip.metadata.origin} to ${trip.metadata.destination}` : 'Welcome back, John Smith'}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Miles</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.totalMiles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Trips Generated</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.completedTrips}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Days</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{trip ? trip.trip_summary.total_days : '3'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Driving Hours</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.drivingHours}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {trip && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Current Trip</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Route:</strong> {trip.metadata.origin} → {trip.metadata.destination}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Distance:</strong> {trip.trip_summary.total_miles} miles
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {trip.trip_summary.total_days} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#f3e5f5' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 'bold', mb: 2 }}>Quick Links</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="contained" onClick={() => navigate('/route')}>View Route</Button>
                  <Button size="small" variant="contained" onClick={() => navigate('/timeline')}>Trip Timeline</Button>
                  <Button size="small" variant="contained" onClick={() => navigate('/logs')}>View Logs</Button>
                  <Button size="small" variant="contained" onClick={() => navigate('/pdf')}>Download PDF</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Trips</Typography>
            <Button variant="contained" onClick={() => navigate('/trip')}>+ Create New Trip</Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trip ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Miles</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTrips.map((tripRow) => (
                  <TableRow key={tripRow.id}>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>{tripRow.id}</TableCell>
                    <TableCell>{tripRow.route}</TableCell>
                    <TableCell>{tripRow.date}</TableCell>
                    <TableCell align="right">{tripRow.miles}</TableCell>
                    <TableCell>{tripRow.days}</TableCell>
                    <TableCell><Chip label={tripRow.status} color={tripRow.status === 'Generated' ? 'primary' : 'success'} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default DashboardPage;