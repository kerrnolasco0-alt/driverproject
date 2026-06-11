import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert
} from '@mui/material'
import { FileDownload as DownloadIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

function PdfPage() {
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

  const { pdf_file, metadata, trip_summary } = trip

  const handleDownload = () => {
    if (pdf_file) {
      const link = document.createElement('a')
      link.href = `http://127.0.0.1:8000/static/pdfs/${pdf_file}`
      link.download = pdf_file
      link.click()
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>PDF Preview</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>FMCSA Driver Daily Logs in PDF format</Typography>
      </Box>

      {pdf_file && (
        <Card sx={{ mb: 3, backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'success.dark' }}>
              ✓ PDF generated successfully
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
              {pdf_file}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Document Preview</Typography>
              <Box
                sx={{
                  backgroundColor: '#f5f5f5',
                  height: 500,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  border: '2px solid #e0e0e0'
                }}
              >
                <Typography>PDF preview will display here (requires PDF viewer integration)</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Trip Details</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Origin</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{metadata.origin}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Pickup</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{metadata.pickup}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Destination</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{metadata.destination}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Driver</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{metadata.driver_name}</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Total Days</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{trip_summary.total_days}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Total Miles</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{trip_summary.total_miles}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Total Drive Hours</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{trip_summary.total_drive_hours}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">Generated</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{metadata.date}</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={!pdf_file}
                sx={{ mb: 1 }}
              >
                Download PDF
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PdfPage;
