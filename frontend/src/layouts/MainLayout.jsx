import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AddLocation as AddTripIcon,
  Map as MapIcon,
  Schedule as TimelineIcon,
  Description as LogsIcon,
  PictureAsPdf as PdfIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'

const DRAWER_WIDTH = 240

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2'
    },
    secondary: {
      main: '#0d47a1'
    }
  }
})

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Create Trip', icon: <AddTripIcon />, path: '/trip' },
  { label: 'Route Map', icon: <MapIcon />, path: '/route' },
  { label: 'Trip Timeline', icon: <TimelineIcon />, path: '/timeline' },
  { label: 'FMCSA Logs', icon: <LogsIcon />, path: '/logs' },
  { label: 'PDF Preview', icon: <PdfIcon />, path: '/pdf' }
]

export default function MainLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          T
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
            DRIVER TRIP
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            PLANNER
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path)
              setMobileOpen(false)
            }}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
              color: location.pathname === item.path ? 'primary.main' : 'inherit',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
          Logged in as:
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          John Smith
        </Typography>
      </Box>
    </Box>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Driver Trip Planner
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              mt: 8
            }
          }}
        >
          {drawer}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}