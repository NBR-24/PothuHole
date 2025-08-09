/**
 * @file App.js
 * @description This is the main entry point for the React application.
 * It sets up the overall structure, including theme, routing, and global providers.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Import all page and layout components.
// Pages are the main views for each URL route.
import Header from './components/layout/Header';
import Home from './pages/Home';
import ReportPage from './pages/ReportPage';
import ReportSuccess from './pages/ReportSuccess';
import MapPage from './pages/MapPage';
import ListPage from './pages/ListPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

/**
 * @description Creates a custom Material-UI theme instance.
 * This theme provides consistent styling (colors, typography, component styles) across the entire application.
 */
const theme = createTheme({
  // Define the color palette for the application.
  palette: {
    primary: {
      main: '#1976d2', // A standard blue color for primary actions
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff', // White text on primary color backgrounds
    },
    secondary: {
      main: '#9c27b0', // A purple color for secondary actions
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f', // Standard red for error messages and indicators
    },
    warning: {
      main: '#ed6c02', // Standard orange for warnings
    },
    success: {
      main: '#2e7d32', // Standard green for success messages
    },
    background: {
      default: '#f5f5f5', // A light grey background for the app body
      paper: '#ffffff',   // White background for components like Cards and Papers
    },
  },
  // Define the typography settings for headings, body text, etc.
  typography: {
    fontFamily: [
      '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
      '"Helvetica Neue"', 'Arial', 'sans-serif', '"Apple Color Emoji"',
      '"Segoe UI Emoji"', '"Segoe UI Symbol"',
    ].join(','),
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 600, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, 'fontSize': '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.1rem' },
    button: {
      textTransform: 'none', // Buttons will not have uppercase text by default
      fontWeight: 500,
    },
  },
  // Override default styles for specific Material-UI components.
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded corners for buttons
          padding: '8px 16px',
          boxShadow: 'none', // No default shadow
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Add a subtle shadow on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded corners for cards
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)', // A subtle default shadow
          transition: 'box-shadow 0.3s ease-in-out', // Smooth transition for hover effect
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)', // A more prominent shadow on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Consistent rounded corners for Paper components
        },
      },
    },
  },
});

/**
 * @description The root component of the application.
 * It wraps the entire app in providers for theming, routing, and notifications.
 */
function App() {

  // This effect runs once when the app starts.
  // It checks if a user is signed in. If not, it signs them in anonymously.
  // This is crucial for security rules that require an authenticated user.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((error) => {
          console.error('Anonymous sign-in failed:', error);
        });
      }
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  return (
    // 1. Theme Provider: This wrapper from Material-UI injects the custom theme (defined above)
    // into all components down the tree. This ensures a consistent look and feel.
    <ThemeProvider theme={theme}>
      {/* 2. CSS Baseline: This component normalizes CSS styles across different browsers,
      // preventing common inconsistencies. It's like a reset button for browser-specific styles. */}
      <CssBaseline />
      {/* 3. Snackbar Provider: This provider from 'notistack' allows any component in the app
      // to easily trigger notification messages (snackbars) without complex prop drilling. */}
      <SnackbarProvider 
        maxSnack={3} // Show a maximum of 3 snackbars at a time.
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Position them at the bottom-right.
        autoHideDuration={4000} // Automatically hide after 4 seconds.
      >
        {/* 4. Router: This is the core of the client-side navigation. It keeps the UI
        // in sync with the URL without causing a full page reload. */}
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* The Header is a persistent component displayed on every page. */}
            <Header />
            {/* The 'main' semantic HTML5 element for the primary content of the page. */}
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 8, md: 9 } }}>
              {/* 5. Routes: This component acts as a switchboard, rendering the correct page
              // component based on the current URL path. */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/report/success" element={<ReportSuccess />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/list" element={<ListPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                {/* A catch-all route redirects any unknown URL to the Home page. */}
                <Route path="*" element={<Home />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
