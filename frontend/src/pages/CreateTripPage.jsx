import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { generateTrip } from '../utils/api'

function CreateTripPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_used: 0,
    driver_name: 'John Smith',
    carrier_name: 'Assessment Carrier'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const result = await generateTrip(formData)
      setSuccess('Trip generated successfully!')
      // Store trip data in session storage
      sessionStorage.setItem('currentTrip', JSON.stringify(result))
      setTimeout(() => navigate('/route'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>Create New Trip</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>Enter trip details to generate your route and FMCSA logs</Typography>
      </Box>

      <Card sx={{ maxWidth: 700 }}>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Driver Name"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., John Smith"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Carrier Name"
                  name="carrier_name"
                  value={formData.carrier_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Assessment Carrier"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Location"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Houston, TX"
                  helperText="Where your truck is currently located"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pickup Location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Dallas, TX"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dropoff Location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., New York, NY"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cycle Hours Used"
                  name="cycle_used"
                  type="number"
                  value={formData.cycle_used}
                  onChange={handleChange}
                  inputProps={{ step: '0.1', min: '0', max: '70' }}
                  helperText="70-hour/8-day cycle hours already used (0-70)"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate Trip'}
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outlined">Cancel</Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CreateTripPage;