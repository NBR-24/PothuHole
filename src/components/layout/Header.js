/**
 * @file Header.js
 * @description This is the main navigation header for the application.
 * It is responsive: it shows full navigation links on desktop and a hamburger menu on mobile.
 */

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

// An array of navigation link objects to keep the code DRY (Don't Repeat Yourself).
const navItems = [
  { text: 'Report Pothole', to: '/report' },
  { text: 'Map View', to: '/map' },
  { text: 'List View', to: '/list' },
  { text: 'Leaderboard', to: '/leaderboard' },
];

const Header = () => {
  // --- Hooks and State ---
  const theme = useTheme();
  // This hook from Material-UI returns `true` if the screen width is below the 'md' breakpoint (900px).
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // State to manage the open/closed status of the mobile navigation drawer.
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * @description Toggles the mobile drawer's visibility.
   */
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // --- Sub-components ---

  /**
   * @description The content of the mobile navigation drawer.
   */
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Pothole Patrol
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            {/* Use NavLink to automatically apply an 'active' class for styling the current page's link. */}
            <ListItemButton component={NavLink} to={item.to}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <React.Fragment>
      <AppBar component="nav" position="fixed">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* App Logo and Title */}
            <LocalFireDepartmentIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component={NavLink}
              to="/"
              sx={{ flexGrow: 1, fontWeight: 700, color: 'inherit', textDecoration: 'none' }}
            >
              Pothole Danger Map
            </Typography>

            {/* Conditional Rendering: Show either full nav buttons or a hamburger menu. */}
            {isMobile ? (
              // --- Mobile View: Hamburger Menu ---
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              // --- Desktop View: Full Navigation Buttons ---
              <Box>
                {navItems.map((item) => (
                  <Button
                    key={item.text}
                    component={NavLink}
                    to={item.to}
                    sx={{
                      color: '#fff',
                      // Style for the active link
                      '&.active': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{ 
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </React.Fragment>
  );
};

export default Header;
