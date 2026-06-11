import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Alert
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

function TimelinePage() {
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)

  useEffect(() => {
    const tripData = sessionStorage.getItem('currentTrip')
    if (tripData) {
      setTrip(JSON.parse(tripData))
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

  const { days, trip_summary } = trip

  const getStatusColor = (status) => {
    const colors = {
      'ON_DUTY': 'default',
      'DRIVING': 'primary',
      'OFF_DUTY': 'warning',
      'SLEEPER': 'error'
    }
    return colors[status] || 'default'
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Trip Timeline</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>Day-by-day FMCSA Hours of Service schedule</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Days</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{trip_summary.total_days} days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Miles</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{trip_summary.total_miles} miles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Driving Hours</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{trip_summary.total_drive_hours} hours</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Day-by-Day Breakdown</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Miles</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Driving Hrs</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>On-Duty Hrs</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duty Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {days.map((day) => (
                  <TableRow key={day.day}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Day {day.day}</TableCell>
                    <TableCell>{day.miles_driven}</TableCell>
                    <TableCell>{day.driving_hours}</TableCell>
                    <TableCell>{day.on_duty_hours}</TableCell>
                    <TableCell>
                      <Chip
                        label="Active"
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Segments View */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Detailed Daily Segments</Typography>
          {days.map((day) => (
            <Box key={day.day} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Day {day.day} - {day.miles_driven} miles, {day.driving_hours} driving hrs
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {day.segments && day.segments.map((seg, idx) => (
                  <Card key={idx} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {seg.status.replace('_', ' ')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {seg.start_time?.toFixed(1) || 'N/A'} - {seg.end_time?.toFixed(1) || 'N/A'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {seg.description}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => navigate('/logs')}>
          View FMCSA Logs →
        </Button>
      </Box>
    </Box>
  )
}

export default TimelinePage;