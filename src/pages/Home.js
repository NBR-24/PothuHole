/**
 * @file Home.js
 * @description The landing page of the application.
 * It provides a welcome message and navigation cards to the main features.
 */

import React from 'react';
import { Container, Typography, Button, Grid, Paper, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ReportIcon from '@mui/icons-material/Report';
import MapIcon from '@mui/icons-material/Map';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Home = () => {
  return (
    // The main container that centers the content and provides margins.
    <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 4 }}>
      {/* --- Hero Section --- */}
      {/* This section contains the main headline, sub-headline, and primary call-to-action button. */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" component="h1" fontWeight={700} gutterBottom>
          Pothole Danger Map
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Report, view, and share dangerous potholes to make roads safer for everyone.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link} // Use React Router's Link for client-side navigation.
          to="/report" // The destination path.
          startIcon={<ReportIcon />} // An icon to visually support the button's text.
          sx={{ mt: 2, mb: 4, py: 1.5, px: 4, borderRadius: '20px' }}
        >
          Report a Pothole
        </Button>
      </Box>

      {/* --- Features Grid --- */}
      {/* A responsive grid that displays the main features of the application in cards. */}
      <Grid container spacing={4} justifyContent="center">
        {/* Each Grid item is a column. The `xs`, `sm`, and `md` props define the column width
            at different screen sizes, making the layout responsive.
            - xs={12}: Full width on extra-small screens.
            - sm={6}: Half width on small screens.
            - md={3}: Quarter width on medium screens and up. */}
        <Grid xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <MapIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h6" gutterBottom>Map View</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              View all potholes on an interactive map with danger level indicators.
            </Typography>
            <Button component={Link} to="/map" variant="outlined">View Map</Button>
          </Paper>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <ListAltIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h6" gutterBottom>List View</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Browse all reports in a sortable and filterable list.
            </Typography>
            <Button component={Link} to="/list" variant="outlined">View List</Button>
          </Paper>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <EmojiEventsIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h6" gutterBottom>Leaderboard</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              See which districts are the most diligent at reporting potholes.
            </Typography>
            <Button component={Link} to="/leaderboard" variant="outlined">View Leaderboard</Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
