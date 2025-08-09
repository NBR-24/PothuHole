/**
 * @file LeaderboardPage.js
 * @description This page fetches all pothole reports, processes the data to create a leaderboard of districts
 * with the most reports, and displays the results along with overall statistics.
 */

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, List, ListItem, ListItemText, CircularProgress, Card, 
  CardContent, Grid, useTheme, useMediaQuery, IconButton, Divider
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon, LocationOn as LocationIcon, Warning as WarningIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// --- Styled Components for a Custom, Polished UI ---

// A styled Paper component for main content blocks.
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8f0 100%)',
}));

// A styled Box component for the top 3 podium visualization.
const Podium = styled(Box)(({ theme, position }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  // Height varies based on rank (1st is tallest).
  height: position === 1 ? 200 : position === 2 ? 160 : 120,
  width: '100%',
  // Color also varies by rank (gold, silver, bronze).
  backgroundColor: 
    position === 1 ? theme.palette.warning.light : 
    position === 2 ? '#e0e0e0' : 
    theme.palette.secondary.light,
  borderRadius: '8px 8px 0 0',
  padding: theme.spacing(2),
  position: 'relative',
  boxShadow: theme.shadows[2],
  // Responsive height for smaller screens.
  [theme.breakpoints.down('sm')]: {
    height: position === 1 ? 160 : position === 2 ? 130 : 100,
    padding: theme.spacing(1),
  },
}));

// A styled badge to display the rank number in the list.
const RankBadge = styled(Box)(({ rank, theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: 
    rank === 1 ? theme.palette.warning.main : 
    rank === 2 ? '#bdbdbd' : 
    theme.palette.secondary.main,
  marginRight: theme.spacing(2),
  fontWeight: 'bold',
  boxShadow: theme.shadows[1],
}));

/**
 * @description A reusable component to display a single statistic in a card.
 * @param {string} title - The title of the statistic.
 * @param {string|number} value - The value of the statistic.
 * @param {React.ReactNode} icon - The icon to display.
 * @param {string} color - The color theme for the icon and background.
 */
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
    <CardContent sx={{ textAlign: 'center' }}>
      <Box sx={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: `${color}20`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        {React.cloneElement(icon, { sx: { fontSize: 30, color: color } })}
      </Box>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
    </CardContent>
  </Card>
);

const LeaderboardPage = () => {
  // --- State Management ---
  // `leaderboard`: An array to store the final, sorted list of districts with their stats.
  const [leaderboard, setLeaderboard] = useState([]);
  // `loading`: A boolean to indicate when data is being fetched and processed.
  const [loading, setLoading] = useState(true);
  // `error`: A string to hold any error messages.
  const [error, setError] = useState('');
  // `stats`: An object to store overall statistics calculated from all reports.
  const [stats, setStats] = useState({ totalReports: 0, totalDistricts: 0, avgDangerLevel: 0 });

  // --- Hooks ---
  const theme = useTheme();
  // `isMobile`: A boolean that is true for small screen sizes, used for responsive UI adjustments.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // `navigate`: A function from React Router for programmatic navigation.
  const navigate = useNavigate();

  // --- Data Fetching and Processing Effect ---
  // This effect runs once when the component mounts to fetch all report data and process it for the leaderboard.
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Fetch all documents from the 'reports' collection in Firestore.
        const reportsCollection = collection(db, 'reports');
        const querySnapshot = await getDocs(reportsCollection);
        const reports = querySnapshot.docs.map(doc => doc.data());

        // Exit early if there are no reports.
        if (reports.length === 0) {
          setLoading(false);
          return;
        }

        // --- Data Processing Logic ---
        // 1. Group reports by district and calculate stats for each.
        const districtStats = reports.reduce((acc, report) => {
          // Determine the district for the current report.
          const district = report.location.district || 'Unknown District';
          // Initialize the district's stats if not already present.
          if (!acc[district]) {
            acc[district] = { count: 0, totalDanger: 0 };
          }
          // Increment the report count and add to the total danger score for the district.
          acc[district].count += 1;
          acc[district].totalDanger += report.dangerLevel;
          return acc;
        }, {});

        // 2. Convert the grouped data object into a sorted array.
        const sortedLeaderboard = Object.keys(districtStats)
          .map(district => ({
            district,
            count: districtStats[district].count,
            avgDanger: districtStats[district].totalDanger / districtStats[district].count,
          }))
          // Sort primarily by report count (descending).
          // If counts are equal, sort by average danger level (descending) as a tie-breaker.
          .sort((a, b) => {
            if (b.count !== a.count) {
              return b.count - a.count;
            }
            return b.avgDanger - a.avgDanger;
          });

        // 3. Calculate overall statistics for the entire dataset.
        const totalReports = reports.length;
        const totalDangerSum = reports.reduce((sum, report) => sum + report.dangerLevel, 0);
        const avgDangerLevel = totalReports > 0 ? (totalDangerSum / totalReports).toFixed(1) : 0;

        // 4. Update the component's state with the processed data.
        setLeaderboard(sortedLeaderboard);
        setStats({ totalReports, totalDistricts: sortedLeaderboard.length, avgDangerLevel });
        setError('');

      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); // The empty dependency array `[]` ensures this effect runs only once on mount.

  /**
   * @description Returns a medal emoji for the top 3 ranks, otherwise returns the rank number.
   * @param {number} rank - The rank of the item.
   * @returns {string} - The emoji or rank string.
   */
  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇'; // Gold Medal
    if (rank === 2) return '🥈'; // Silver Medal
    if (rank === 3) return '🥉'; // Bronze Medal
    return `#${rank}`; // For ranks 4 and below
  };

  // --- Render Logic ---
  // The leaderboard data is split into two parts for rendering:
  // `topDistricts`: The top 3 for the visual podium display.
  const topDistricts = leaderboard.slice(0, 3);
  // `otherDistricts`: The rest of the districts for the standard list view.
  const otherDistricts = leaderboard.slice(3);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Pothole Leaderboard</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
      ) : (
        <>
          {/* Overall Statistics Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} sm={4}><StatCard title="Total Reports" value={stats.totalReports} icon={<WarningIcon />} color={theme.palette.error.main} /></Grid>
            <Grid xs={12} sm={4}><StatCard title="Districts with Reports" value={stats.totalDistricts} icon={<LocationIcon />} color={theme.palette.primary.main} /></Grid>
            <Grid xs={12} sm={4}><StatCard title="Avg. Danger Level" value={stats.avgDangerLevel} icon={<TrophyIcon />} color={theme.palette.warning.main} /></Grid>
          </Grid>

          {/* Podium for Top 3 Districts */}
          {topDistricts.length > 0 && (
            <StyledPaper sx={{ mb: 4 }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>Top Reporting Districts</Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: isMobile ? 1 : 2, mt: 4 }}>
                {/* Second Place */}
                {topDistricts.length >= 2 && (
                  <Podium position={2}>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>{topDistricts[1].district}</Typography>
                    <Typography variant="subtitle2" align="center">{topDistricts[1].count} {topDistricts[1].count === 1 ? 'report' : 'reports'}</Typography>
                    <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>{getMedalEmoji(2)}</Box>
                  </Podium>
                )}
                {/* First Place */}
                {topDistricts.length >= 1 && (
                  <Podium position={1}>
                    <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>{topDistricts[0].district}</Typography>
                    <Typography variant="subtitle1" align="center">{topDistricts[0].count} {topDistricts[0].count === 1 ? 'report' : 'reports'}</Typography>
                    <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2, fontSize: '1.5rem', fontWeight: 'bold' }}>{getMedalEmoji(1)}</Box>
                  </Podium>
                )}
                {/* Third Place */}
                {topDistricts.length >= 3 && (
                  <Podium position={3}>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>{topDistricts[2].district}</Typography>
                    <Typography variant="subtitle2" align="center">{topDistricts[2].count} {topDistricts[2].count === 1 ? 'report' : 'reports'}</Typography>
                    <Box sx={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2, fontSize: '1.2rem', fontWeight: 'bold' }}>{getMedalEmoji(3)}</Box>
                  </Podium>
                )}
              </Box>
            </StyledPaper>
          )}

          {/* Full Leaderboard List (Ranks 4+) */}
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>All Districts</Typography>
            {otherDistricts.length > 0 ? (
              <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                {otherDistricts.map((item, index) => (
                  <React.Fragment key={item.district}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <RankBadge rank={index + 4}>{index + 4}</RankBadge>
                      <ListItemText
                        primary={<Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>{item.district}</Typography>}
                        secondary={`Avg. Danger: ${item.avgDanger.toFixed(1)}`}
                      />
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.count} {item.count === 1 ? 'report' : 'reports'}</Typography>
                    </ListItem>
                    {index < otherDistricts.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TrophyIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">More districts will appear here as reports are submitted.</Typography>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default LeaderboardPage;
