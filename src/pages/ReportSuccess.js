/**
 * @file ReportSuccess.js
 * @description This page is displayed after a user successfully submits a pothole report.
 * It shows a confirmation message, details of the report, and provides options to share.
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Paper, Box, Button, Card, CardMedia, 
  CardContent, IconButton, Divider
} from '@mui/material';
import { Share, Home, Map as MapIcon, Twitter, Facebook, WhatsApp, Image } from '@mui/icons-material';
import ShareCard from '../components/ShareCard';
import { styled } from '@mui/material/styles';

// --- Styled Components for Visual Flair ---

const SuccessContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4),
  textAlign: 'center',
  maxWidth: 600,
  margin: '0 auto',
}));

// A visual meter to represent the reported danger level.
const DangerLevelMeter = styled(Box)(({ dangerLevel, theme }) => ({
  height: 20,
  borderRadius: 10,
  margin: '20px 0',
  background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.warning.main} 50%, ${theme.palette.error.main} 100%)`,
  position: 'relative',
  // The black line indicates the reported level.
  '&::after': {
    content: '""',
    position: 'absolute',
    left: `${(dangerLevel - 1) * 11}%`, // Position based on danger level (1-10).
    top: -10,
    width: 2,
    height: 40,
    backgroundColor: theme.palette.common.black,
  },
  // The number bubble above the indicator line.
  '&::before': {
    content: `"${dangerLevel}"`,
    position: 'absolute',
    left: `${(dangerLevel - 1) * 11}%`,
    top: -50,
    transform: 'translateX(-50%)',
    backgroundColor: theme.palette.background.paper,
    padding: '2px 8px',
    borderRadius: 10,
    border: `1px solid ${theme.palette.divider}`,
    fontWeight: 'bold',
  },
}));

// --- Content Data ---

// An array of funny, light-hearted captions to make the success page more engaging.




const ReportSuccess = () => {
  // --- State and Hooks ---
  const [isShareCardOpen, setShareCardOpen] = useState(false); // Manages the visibility of the ShareCard modal.
  const location = useLocation(); // Hook to access the state passed from the previous page (ReportPage).
  const navigate = useNavigate(); // Hook for programmatic navigation.

  // Destructure the report details from the location state, providing default values as a fallback.
  const { dangerLevel = 5, district = 'Unknown Location', imageUrl, createdAt, quote } = location.state || {};
  
  // Use the quote passed from the report page, or a default message if none is provided.
  const caption = quote || 'Thanks for your report!';
  
  /**
   * @description Handles the native share functionality using the Web Share API.
   */
  const handleShare = async () => {
    const shareData = {
      title: 'I just reported a dangerous pothole!',
      text: `I found a level ${dangerLevel} pothole in ${district}. ${caption} #PotholePatrol #RoadSafety`,
      url: window.location.href, // URL of the success page.
    };

    try {
      // Use the native Web Share API if available.
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support it (e.g., desktop).
        await navigator.clipboard.writeText(shareData.text);
        alert('Share text copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <SuccessContainer elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>🎉 Report Submitted! 🎉</Typography>
        <Typography variant="h6" color="text.secondary" paragraph>Thank you for helping make our roads safer!</Typography>
        
        {/* A card displaying the key details of the submitted report */}
        <Card sx={{ maxWidth: 400, margin: '20px auto' }}>
          {imageUrl && <CardMedia component="img" height="200" image={imageUrl} alt="Reported pothole" />}
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontStyle: 'italic' }}>"{caption}"</Typography>
            <Box sx={{ textAlign: 'left', my: 2 }}>
              <Typography variant="body1"><strong>Location:</strong> {district}</Typography>
              <Typography variant="body1"><strong>Danger Level:</strong> {dangerLevel}/10</Typography>
              <Box sx={{ mt: 2, mb: 1 }}>
                <DangerLevelMeter dangerLevel={dangerLevel} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">Safe</Typography>
                  <Typography variant="caption">Dangerous</Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">Share this report to help others stay safe!</Typography>
            
            {/* Social media and native share buttons */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <IconButton color="primary" onClick={handleShare} aria-label="Share"><Share /></IconButton>
              <IconButton color="primary" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I found a level ${dangerLevel} pothole in ${district}! ${caption} #PotholePatrol`)}`)} aria-label="Share on Twitter"><Twitter /></IconButton>
              <IconButton color="primary" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)} aria-label="Share on Facebook"><Facebook /></IconButton>
              <IconButton color="primary" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this pothole I found in ${district} (Danger: ${dangerLevel}/10): ${window.location.href}`)}`)} aria-label="Share on WhatsApp"><WhatsApp /></IconButton>
            </Box>
          </CardContent>
        </Card>
        
        {/* Main action buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Image />} onClick={() => setShareCardOpen(true)}>Generate Share Card</Button>
          <Button variant="outlined" startIcon={<Home />} onClick={() => navigate('/')}>Back to Home</Button>
          <Button variant="outlined" startIcon={<MapIcon />} onClick={() => navigate('/map')}>View on Map</Button>
        </Box>
      </SuccessContainer>

      {/* The ShareCard component is rendered in a modal when `isShareCardOpen` is true */}
      {isShareCardOpen && (
        <ShareCard 
          open={isShareCardOpen} 
          onClose={() => setShareCardOpen(false)} 
          report={{
            imageUrl,
            dangerLevel,
            district,
            // Ensure createdAt is a valid Date object for formatting.
            createdAt: createdAt?.seconds ? createdAt.seconds * 1000 : new Date(),
            caption,
          }}
        />
      )}

    </Container>
  );
};

export default ReportSuccess;
