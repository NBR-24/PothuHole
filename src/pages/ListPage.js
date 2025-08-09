/**
 * @file ListPage.js
 * @description This page displays all reported potholes in a filterable and sortable list.
 * It includes features like search, sorting, filtering by danger level, and pagination.
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Card, CardContent, CardMedia, CardActionArea,
  CardActions, Button, Grid, TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, Chip, CircularProgress, Pagination, useMediaQuery, useTheme, IconButton, Tooltip
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterListIcon, Sort as SortIcon, Warning as WarningIcon,
  LocationOn as LocationIcon, Share as ShareIcon, NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { styled } from '@mui/material/styles';

// Constant for the number of items to display per page.
const ITEMS_PER_PAGE = 10;

// --- Styled Components for Custom UI Elements ---

// A styled Chip component that changes color based on the danger level.
const DangerChip = styled(Chip)(({ dangerlevel, theme }) => ({
  backgroundColor: dangerlevel <= 3 
    ? theme.palette.success.light 
    : dangerlevel <= 7 
      ? theme.palette.warning.light 
      : theme.palette.error.light,
  color: theme.palette.getContrastText(
    dangerlevel <= 3 ? theme.palette.success.light : dangerlevel <= 7 ? theme.palette.warning.light : theme.palette.error.light
  ),
  fontWeight: 'bold',
}));

// A styled Card with a subtle hover effect.
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ListPage = () => {
  // --- State Management ---
  // `reports`: Stores the original, unmodified list of all reports fetched from Firestore.
  const [reports, setReports] = useState([]);
  // `filteredReports`: A derived list that holds the reports after applying search and filter criteria.
  const [filteredReports, setFilteredReports] = useState([]);
  // `loading`: A boolean to track when data is being fetched from the server.
  const [loading, setLoading] = useState(true);
  // `error`: A string to store any error messages for display to the user.
  const [error, setError] = useState('');
  // `searchTerm`: The text entered by the user in the search input field.
  const [searchTerm, setSearchTerm] = useState('');
  // `sortBy`: The currently selected sorting option ('newest', 'oldest', 'mostDangerous').
  const [sortBy, setSortBy] = useState('newest');
  // `dangerFilter`: The currently selected danger level filter ('all', 'low', 'moderate', 'severe').
  const [dangerFilter, setDangerFilter] = useState('all');
  // `page`: The current page number for the pagination component.
  const [page, setPage] = useState(1);
  
  // --- Hooks ---
  const theme = useTheme();
  // `isMobile`: A boolean that is true if the screen width is 'sm' (small) or smaller.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // `navigate`: A function from React Router to programmatically navigate to other pages.
  const navigate = useNavigate();

  // --- Data Fetching Effect ---
  // This effect is responsible for fetching the report data from Firestore.
  // It runs whenever the `sortBy` criteria changes, allowing the server to handle the sorting.
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
                const reportsCollection = collection(db, 'reports');
        
        // The query to Firestore is built dynamically based on the selected sort option.
        // This is efficient because the sorting is done on the database server, not in the browser.
        let q;
        if (sortBy === 'newest') {
          q = query(reportsCollection, orderBy('createdAt', 'desc'));
        } else if (sortBy === 'oldest') {
          q = query(reportsCollection, orderBy('createdAt', 'asc'));
        } else if (sortBy === 'mostDangerous') {
          // Note: Firestore requires a composite index to be created in the Firebase console
          // for queries that order by multiple fields. For this to work, an index on
          // `dangerLevel` (desc) and `createdAt` (desc) is needed.
          q = query(reportsCollection, orderBy('dangerLevel', 'desc'), orderBy('createdAt', 'desc'));
        } else {
          q = query(reportsCollection, orderBy('createdAt', 'desc')); // Default case
        }
        
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setReports(reportsData); // Store the raw, sorted data.
        setError('');
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Check your internet connection or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [sortBy]); // The dependency array `[sortBy]` ensures this effect re-runs when the user changes the sort order.

  // --- Filtering and Searching Effect ---
  // This effect performs client-side filtering based on the search term and danger level.
  // It runs whenever the original `reports` data, `searchTerm`, or `dangerFilter` changes.
  useEffect(() => {
    let processedReports = [...reports]; // Start with the full, sorted list of reports.

    // 1. Apply the search term filter (case-insensitive).
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      processedReports = processedReports.filter(report => 
        // Check if the search term appears in the description, district, or full address.
        (report.description && report.description.toLowerCase().includes(lowercasedTerm)) ||
        (report.location.district && report.location.district.toLowerCase().includes(lowercasedTerm)) ||
        (report.location.formattedAddress && report.location.formattedAddress.toLowerCase().includes(lowercasedTerm))
      );
    }

    // 2. Apply the danger level filter.
    if (dangerFilter !== 'all') {
      // The filter value (e.g., '8-10') is split into a min and max range.
      const [min, max] = dangerFilter.split('-').map(Number);
      processedReports = processedReports.filter(report => report.dangerLevel >= min && report.dangerLevel <= max);
    }

    // 3. Update the state with the final filtered list.
    setFilteredReports(processedReports);
    // 4. Reset to the first page to avoid viewing a non-existent page after filtering.
    setPage(1);
  }, [reports, searchTerm, dangerFilter]); // Dependency array ensures this runs when its dependencies change.

  // --- Event Handlers ---

  /**
   * @description Updates the page state when the user clicks a new page number.
   * @param {object} event - The event source of the callback.
   * @param {number} value - The new page number.
   */
  const handlePageChange = (event, value) => {
    setPage(value); // Update the current page state.
    window.scrollTo(0, 0); // Scroll to the top of the page for a smooth user experience.
  };

  /**
   * @description Initiates the Web Share API to share a link to a specific report.
   * @param {object} report - The full report object to be shared.
   */
  const handleShare = async (report) => {
    // Construct the data to be shared, including a title, text, and a direct URL to the report on the map.
    const shareData = {
      title: 'Pothole Report',
      text: `Check out this pothole in ${report.location.district || 'this area'}! Danger level: ${report.dangerLevel}/10`,
      url: `${window.location.origin}/map?report=${report.id}`
    };
    try {
      // Use the native Web Share API if available.
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Provide a fallback for browsers (like desktop) that don't support the Web Share API.
        navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing report:', err);
      alert('Could not share this report.');
    }
  };

  // --- Pagination Logic ---
  // `paginatedReports`: This variable holds the subset of reports that should be visible on the current page.
  // The `slice` method extracts the correct portion from the `filteredReports` array.
  const paginatedReports = filteredReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  // `count`: This calculates the total number of pages needed to display all filtered reports.
  const count = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>All Reported Potholes</Typography>

      {/* Filter and Sort Controls */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={6}>
            <TextField fullWidth variant="outlined" placeholder="Search by location or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
            />
          </Grid>
          <Grid xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)} startAdornment={<InputAdornment position="start"><SortIcon /></InputAdornment>}>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="mostDangerous">Most Dangerous</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Danger Level</InputLabel>
              <Select value={dangerFilter} label="Danger Level" onChange={(e) => setDangerFilter(e.target.value)} startAdornment={<InputAdornment position="start"><FilterListIcon /></InputAdornment>}>
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="8-10">Severe (8-10)</MenuItem>
                <MenuItem value="4-7">Moderate (4-7)</MenuItem>
                <MenuItem value="1-3">Minor (1-3)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading, Error, and Empty State Handling */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
      ) : paginatedReports.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', p: 4 }}>
          No potholes found. Try adjusting your filters or be the first to report one!
        </Typography>
      ) : (
        <>
          {/* Reports Grid */}
          <Grid container spacing={isMobile ? 2 : 3}>
            {paginatedReports.map((report) => (
              <Grid key={report.id} xs={12} sm={6} md={4}>
                <StyledCard elevation={2}>
                  <CardActionArea onClick={() => navigate(`/map?report=${report.id}`)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {report.imageUrl && (
                      <CardMedia component="img" height="180" image={report.imageUrl} alt="Pothole" sx={{ width: '100%' }} />
                    )}
                    <CardContent sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <DangerChip label={`Level ${report.dangerLevel}`} dangerlevel={report.dangerLevel} size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(report.createdAt?.seconds ? report.createdAt.seconds * 1000 : new Date()).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                      <Typography variant="h6" component="div" gutterBottom noWrap>{report.location.district || 'Unknown Location'}</Typography>
                      {report.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1, minHeight: '4.5em' }}>
                          {report.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <LocationIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" noWrap>{report.location.formattedAddress || 'Location details not available'}</Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                    <Button size="small" color="primary" onClick={() => navigate(`/map?report=${report.id}`)} endIcon={<NavigateNextIcon />}>
                      View on Map
                    </Button>
                    <Tooltip title="Share">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleShare(report); }}>
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {count > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={count}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton showLastButton
                siblingCount={isMobile ? 0 : 1}
                boundaryCount={isMobile ? 1 : 2}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ListPage;
