/**
 * @file MapPage.js
 * @description This page displays an interactive map with markers for each reported pothole.
 * It fetches report data from Firestore and uses Leaflet.js for rendering the map.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Paper, Card, CardContent, CircularProgress } from '@mui/material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { styled } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/Warning';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Extend dayjs with the relativeTime plugin to show human-readable dates (e.g., "2 hours ago").
dayjs.extend(relativeTime);

// This is a common fix for a bug in Leaflet when used with bundlers like Webpack.
// It ensures that the default marker icon images are loaded correctly.
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * @description A helper function to map a danger level (1-10) to a specific color.
 * @param {number} level - The danger level.
 * @returns {string} A hex color code.
 */
const dangerLevelToColor = (level) => {
  if (level <= 3) return '#4caf50'; // Green for low danger
  if (level <= 7) return '#ff9800'; // Orange for moderate danger
  return '#f44336'; // Red for high danger
};

// --- Styled Components for Custom Popups and UI Elements ---

// A styled Box to customize the wrapper of the Leaflet popup.
const StyledPopup = styled(Box)(({ dangerLevel }) => ({
  '& .leaflet-popup-content-wrapper': {
    borderRadius: '8px',
    padding: '0',
    overflow: 'hidden',
  },
  '& .leaflet-popup-content': {
    margin: '0',
    width: '250px !important',
  },
  '& .leaflet-popup-tip': {
    backgroundColor: dangerLevelToColor(dangerLevel),
  },
}));

// A styled Card that serves as the main content area within the popup.
const PopupContent = styled(Card)(({ dangerLevel }) => ({
  borderLeft: `6px solid ${dangerLevelToColor(dangerLevel)}`, // Color accent based on danger
  '&:hover': {
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
}));

// A styled component to display the danger level in a visually appealing badge.
const DangerLevel = styled(Box)(({ dangerLevel }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '12px',
  backgroundColor: `${dangerLevelToColor(dangerLevel)}22`, // Semi-transparent background
  color: dangerLevelToColor(dangerLevel),
  fontWeight: 'bold',
  fontSize: '0.75rem',
  marginRight: '8px',
}));

/**
 * @description A dedicated map component that handles rendering the map and markers.
 * Separating this from the main page logic makes the code cleaner.
 * @param {{reports: Array, selectedReport: Object, onMarkerClick: Function}} props
 */
const MapComponent = ({ reports, selectedReport, onMarkerClick }) => {
  // State to hold the Leaflet map instance once it's created.
  const [map, setMap] = useState(null);
  const mapRef = useRef();

  // --- Map Effects ---

  // EFFECT 1: Auto-zoom the map to fit all markers when reports are loaded.
  useEffect(() => {
    // Ensure the map instance and reports are available.
    if (map && reports.length > 0) {
      // Create a bounding box that encompasses all report coordinates.
      const bounds = L.latLngBounds(
        reports.map(report => [report.location.lat, report.location.lng])
      );
      // Tell the map to fit its view to these bounds, with some padding.
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, reports]); // Reruns when the map is initialized or when reports data changes.

  // EFFECT 2: Fly to a marker when it is selected.
  useEffect(() => {
    if (map && selectedReport) {
      // Smoothly animate the map view to the selected report's coordinates.
      map.flyTo([selectedReport.location.lat, selectedReport.location.lng], 15, { // Zoom level 15
        animate: true,
        duration: 1, // Animation duration in seconds
      });
    }
  }, [map, selectedReport]); // Reruns when a new report is selected.

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Default center (India)
      zoom={5} // Default zoom
      style={{ height: '70vh', width: '100%', borderRadius: '8px' }}
      whenCreated={setMap} // Callback to get the map instance
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {reports.map((report) => {
        const isSelected = selectedReport && selectedReport.id === report.id;
        return (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            eventHandlers={{ click: () => onMarkerClick(report) }}
            // We use a custom HTML icon (L.divIcon) to show the danger level and apply scaling effects.
            icon={L.divIcon({
              className: 'custom-icon', // Custom class for potential CSS targeting
              html: `<div style="
                width: 24px; height: 24px;
                background: ${dangerLevelToColor(report.dangerLevel)};
                border: 2px solid white;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: bold;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transform: ${isSelected ? 'scale(1.5)' : 'scale(1)'}; /* Enlarge if selected */
                transition: transform 0.2s ease;
              ">${report.dangerLevel}</div>`,
            })}
          >
            <Popup>
              <StyledPopup dangerLevel={report.dangerLevel}>
                <PopupContent dangerLevel={report.dangerLevel}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <DangerLevel dangerLevel={report.dangerLevel}>
                        <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Danger: {report.dangerLevel}/10
                      </DangerLevel>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(report.createdAt.seconds * 1000).fromNow()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>{report.location.district}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.description || 'No description provided.'}
                    </Typography>
                  </CardContent>
                </PopupContent>
              </StyledPopup>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

/**
 * @description The main page component for the Map view.
 * It handles fetching data, managing state, and displaying the UI.
 */
const MapPage = () => {
  // --- State Management ---
  // `reports`: An array to store the pothole data fetched from Firestore.
  const [reports, setReports] = useState([]);
  // `loading`: A boolean to track whether the data is currently being fetched.
  const [loading, setLoading] = useState(true);
  // `error`: A string to hold any error messages that occur during fetching.
  const [error, setError] = useState('');
  // `selectedReport`: Stores the report object of the marker that the user has clicked on.
  const [selectedReport, setSelectedReport] = useState(null);

  // --- Data Fetching ---
  // This `useEffect` hook runs once when the component is first mounted to the screen.
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // 1. Get a reference to the 'reports' collection in Firestore.
        const reportsCollection = collection(db, 'reports');
        // 2. Create a query to get all documents, ordered by creation date (newest first).
        const q = query(reportsCollection, orderBy('createdAt', 'desc'));
        // 3. Execute the query.
        const querySnapshot = await getDocs(q);
        // 4. Map the query results to a more usable array of objects, including the document ID.
        const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // 5. Update the component's state with the fetched data.
        setReports(reportsData);
        setError(''); // Clear any previous errors.
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load pothole reports. Please check your connection.');
      } finally {
        setLoading(false); // Ensure loading is set to false in all cases.
      }
    };

    fetchReports();
  }, []); // The empty dependency array `[]` ensures this effect runs only once.

  /**
   * @description Handles clicking on a map marker.
   * @param {Object} report - The report object associated with the clicked marker.
   */
  const handleMarkerClick = (report) => {
    // Update the state to the newly selected report.
    // This will trigger the detail view to update and the map to fly to the marker.
    setSelectedReport(report);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>Pothole Map</Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        View reported potholes in your area
      </Typography>

      {/* Display error message if something went wrong */}
      {error && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Main content area for the map */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, position: 'relative', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          // Show a loading spinner while fetching data
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          // Show a message if no reports are available
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">No potholes reported yet. Be the first to report one!</Typography>
          </Box>
        ) : (
          // Render the map component with the fetched data
          <MapComponent reports={reports} selectedReport={selectedReport} onMarkerClick={handleMarkerClick} />
        )}
      </Paper>

      {/* Display details of the selected report below the map */}
      {selectedReport && (
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Pothole Details</Typography>
            <DangerLevel dangerLevel={selectedReport.dangerLevel}>
              <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
              Danger Level: {selectedReport.dangerLevel}/10
            </DangerLevel>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom><strong>Location:</strong> {selectedReport.location.district}</Typography>
          
          {selectedReport.location.formattedAddress && (
            <Typography variant="body2" color="text.secondary" gutterBottom>{selectedReport.location.formattedAddress}</Typography>
          )}
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Coordinates:</strong> {selectedReport.location.lat?.toFixed(6)}, {selectedReport.location.lng?.toFixed(6)}
          </Typography>
          
          {selectedReport.description && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Description:</Typography>
              <Typography variant="body1">{selectedReport.description}</Typography>
            </Box>
          )}
          
          <Typography variant="caption" color="text.secondary">
            Reported {dayjs(selectedReport.createdAt.seconds * 1000).fromNow()}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default MapPage;
