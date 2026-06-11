import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

function LogsPage() {
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState(null)
  const [trip, setTrip] = useState(null)

  useEffect(() => {
    const tripData = sessionStorage.getItem('currentTrip')
    if (tripData) {
      const parsed = JSON.parse(tripData)
      setTrip(parsed)
      if (parsed.days && parsed.days.length > 0) {
        setSelectedDay(parsed.days[0].day)
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

  const { days } = trip
  const currentDay = days.find(d => d.day === selectedDay)

  const getStatusColor = (status) => {
    const colors = {
      'ON_DUTY': 'default',
      'DRIVING': 'primary',
      'OFF_DUTY': 'warning',
      'SLEEPER': 'error'
    }
    return colors[status] || 'default'
  }

  const timeToHMS = (hours) => {
    if (!hours && hours !== 0) return 'N/A'
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>FMCSA Daily Logs</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>Hours of Service daily log charts</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Select Day</Typography>
          <ToggleButtonGroup
            value={selectedDay}
            exclusive
            onChange={(e, newDay) => newDay && setSelectedDay(newDay)}
            size="small"
          >
            {days.map((day) => (
              <ToggleButton key={day.day} value={day.day}>
                Day {day.day}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {currentDay && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Miles Driven</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{currentDay.miles_driven}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Driving Hours</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{currentDay.driving_hours}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>On Duty Hours</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{currentDay.on_duty_hours}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Day {currentDay.day} - Duty Segments
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Start</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>End</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentDay.segments && currentDay.segments.map((seg, idx) => {
                      const duration = (seg.end_time || 0) - (seg.start_time || 0)
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Chip
                              label={seg.status?.replace('_', ' ') || 'N/A'}
                              color={getStatusColor(seg.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{timeToHMS(seg.start_time)}</TableCell>
                          <TableCell>{timeToHMS(seg.end_time)}</TableCell>
                          <TableCell>{duration > 0 ? timeToHMS(duration) : '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{seg.description}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>HOS Chart</Typography>
          {currentDay ? (
            <Box sx={{ px: 1 }}>
              <Box sx={{ position: 'relative', height: 140, background: '#fafafa', borderRadius: 1, border: '1px solid #eee', p: 2 }}>
                {/* hour grid */}
                <Box sx={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                  {[...Array(25)].map((_, h) => (
                    <Box
                      key={h}
                      sx={{
                        position: 'absolute',
                        left: `${(h / 24) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: h % 6 === 0 ? '#e0e0e0' : 'transparent'
                      }}
                    />
                  ))}
                </Box>

                {/* segment bars */}
                <Box sx={{ position: 'relative', height: 80, mt: 1 }}>
                  {currentDay.segments && currentDay.segments.map((seg, idx) => {
                    const start = Number(seg.start_time) || 0
                    const end = Number(seg.end_time) || start
                    const clampedStart = Math.max(0, Math.min(24, start))
                    const clampedEnd = Math.max(0, Math.min(24, end))
                    const left = (clampedStart / 24) * 100
                    const width = ((clampedEnd - clampedStart) / 24) * 100
                    const colors = {
                      'DRIVING': '#1976d2',
                      'OFF_DUTY': '#ff9800',
                      'ON_DUTY': '#9e9e9e',
                      'SLEEPER': '#8e24aa'
                    }
                    const color = colors[seg.status] || '#607d8b'
                    return (
                      <Box
                        key={idx}
                        title={`${seg.status?.replace('_',' ')} ${start}-${end}`}
                        sx={{
                          position: 'absolute',
                          left: `${left}%`,
                          top: 8 + (idx % 2) * 28,
                          height: 20,
                          width: `${Math.max(width, 0.5)}%`,
                          background: color,
                          borderRadius: 2,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          px: 0.5
                        }}
                      >
                        {seg.status?.replace('_', ' ')}
                      </Box>
                    )
                  })}
                </Box>

                {/* hour labels */}
                <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 6, display: 'flex', justifyContent: 'space-between', px: 2 }}>
                  {[0, 6, 12, 18, 24].map(h => (
                    <Typography key={h} variant="caption" sx={{ color: 'text.secondary' }}>{h}:00</Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bg: '#1976d2', borderRadius: 1 }} /> <Typography variant="caption">Driving</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bg: '#ff9800', borderRadius: 1 }} /> <Typography variant="caption">Off Duty</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bg: '#9e9e9e', borderRadius: 1 }} /> <Typography variant="caption">On Duty</Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ backgroundColor: '#f5f5f5', height: 300, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              <Typography>No day selected</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={() => navigate('/pdf')}>
          View PDF Preview →
        </Button>
      </Box>
    </Box>
  )
}

export default LogsPage;