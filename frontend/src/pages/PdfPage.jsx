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
  const sanitizeFilename = (name) => {
    if (!name) return null
    // Normalize slashes and strip any path parts to get the filename only
    const replaced = name.replace(/\\/g, '/').replace(/\/+/, '/')
    const parts = replaced.split('/')
    return parts[parts.length - 1]
  }

  const handleDownload = async () => {
    if (!pdf_file) return
    const filename = sanitizeFilename(pdf_file)
    const url = `http://127.0.0.1:8000/api/download-pdf/${encodeURIComponent(filename)}/`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed', err)
      // Fallback: open the file URL in a new tab so the browser can attempt to load it
      window.open(url, '_blank')
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
                  {pdf_file ? (
                    (() => {
                      const filename = sanitizeFilename(pdf_file)
                      const src = `http://127.0.0.1:8000/api/download-pdf/${encodeURIComponent(filename)}/`
                      return (
                        <iframe
                          title="PDF Preview"
                          src={src}
                          style={{ width: '100%', height: 500, border: 'none' }}
                        />
                      )
                    })()
                  ) : (
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
                  )}
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