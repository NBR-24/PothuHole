/**
 * @file ShareCard.js
 * @description A versatile component that generates a visually appealing, shareable card from pothole report data.
 * It uses the `html-to-image` library to convert the component's DOM into a downloadable PNG image.
 * It also provides social media sharing functionality.
 */

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  styled, 
  Button, 
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Share as ShareIcon, 
  Twitter as TwitterIcon, 
  Facebook as FacebookIcon, 
  WhatsApp as WhatsAppIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toPng } from 'html-to-image';
import dayjs from 'dayjs';

// --- Styled Components ---

// The main container for the shareable card.
const ShareCardContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  margin: '0 auto',
  overflow: 'hidden', // Ensures the content respects the border radius.
  borderRadius: 12,
  boxShadow: theme.shadows[10],
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[16],
  },
}));

// The header section of the card. Its background color changes based on the danger level.
const CardHeader = styled(Box)(({ theme, dangerLevel }) => ({
  padding: theme.spacing(3, 3, 2, 3),
  // Dynamically set background color based on danger level for immediate visual feedback.
  backgroundColor: dangerLevel <= 3 ? theme.palette.success.main
    : dangerLevel <= 7 ? theme.palette.warning.main
    : theme.palette.error.main,
  // Ensure text color is readable against the dynamic background.
  color: theme.palette.getContrastText(
    dangerLevel <= 3 ? theme.palette.success.main
    : dangerLevel <= 7 ? theme.palette.warning.main
    : theme.palette.error.main
  ),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    background: 'linear-gradient(to bottom right, transparent 49%, #f5f5f5 50%)',
  },
}));

// The image of the pothole.
const CardImage = styled('img')({
  width: '100%',
  height: 250,
  objectFit: 'cover', // Ensures the image covers the area without distortion.
  display: 'block',
});

// The footer containing the app's branding.
const CardFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

// The danger meter component.
const DangerMeter = styled(Box)(({ dangerLevel, theme }) => ({
  width: '100%',
  height: 8,
  borderRadius: 4,
  margin: '16px 0',
  background: `linear-gradient(90deg, 
    ${theme.palette.success.main} 0%, 
    ${theme.palette.warning.main} 50%, 
    ${theme.palette.error.main} 100%)`,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: `${(dangerLevel - 1) * 10}%`,
    top: -6,
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: 'white',
    border: `3px solid ${
      dangerLevel <= 3 
        ? theme.palette.success.main 
        : dangerLevel <= 7 
          ? theme.palette.warning.main 
          : theme.palette.error.main
    }`,
    transform: 'translateX(-50%)',
  },
}));

/**
 * @description A component that renders a shareable card for a pothole report.
 * @param {object} props - The component props.
 * @param {object} props.report - The pothole report data.
 * @param {function} props.onClose - Function to call when the close button is clicked.
 * @param {boolean} props.showActions - Whether to show the share/download action buttons.
 * @param {boolean} props.showCloseButton - Whether to show the close button.
 */
const ShareCard = ({ 
  report, 
  onClose, 
  onShare, 
  isPreview = false,
  showActions = true,
  showCloseButton = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // A ref to the DOM element of the card, used by `html-to-image`.
  const cardRef = React.useRef();

  // Destructure report data with default values to prevent errors if data is missing.
  const {
    imageUrl,
    dangerLevel = 5,
    description = '',
    location = { district: 'Unknown Location' },
    createdAt = new Date(),
    caption = ''
  } = report;

  /**
   * @description Generates a PNG from the card's content and triggers a download.
   */
  const handleDownload = async () => {
    if (!cardRef.current) return; // Ensure the card element is available.

    try {
      // Convert the DOM node to a PNG data URL.
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: theme.palette.background.paper,
        quality: 1,
        pixelRatio: 2,
      });

      // Create a temporary link to trigger the browser's download functionality.
      const link = document.createElement('a');
      link.download = `pothole-report-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  /**
   * @description Handles sharing the report to various platforms.
   * @param {string} platform - The target platform ('twitter', 'facebook', 'whatsapp', 'copy').
   */
  const handleShareClick = (platform) => {
    const shareData = {
      title: 'Dangerous Pothole Report',
      text: `I found a level ${dangerLevel} pothole in ${location.district}. ${caption || ''}`,
      url: window.location.href,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(shareData.text);
      if (onShare) onShare('copy');
      return;
    }

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`);
      return;
    }

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
      return;
    }

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`);
      return;
    }

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else if (onShare) {
      onShare('web');
    }
  };

  // Generate a funny caption if none provided
  const getFunnyCaption = () => {
    if (caption) return caption;
    
    const captions = [
      "Another one bites the dust!",
      "Watch out! Pothole ahead!",
      "This pothole has seen things...",
      "Not all heroes wear capes. Some report potholes!",
      "Saving tires, one report at a time.",
      "This pothole is guilty of vehicular manslaughter (of my suspension).",
      "I found Waldo! Just kidding, it's just a pothole.",
      "This pothole is more popular than me on social media.",
      "I'd rate this pothole 5 stars on Yelp for being impressively deep.",
      "They say every pothole tells a story. This one says 'ouch!'",
      "Warning: May cause spontaneous wheel alignment appointments.",
      "This pothole is the real reason we can't have nice things.",
      "I didn't choose the pothole life, the pothole life chose me.",
      "This pothole is so big, it has its own weather system.",
      "I'm not saying this pothole is bad, but even GPS says 'recalculating...'"
    ];
    
    return captions[Math.floor(Math.random() * captions.length)];
  };

  // --- Render Method ---

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}>
      {showCloseButton && onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      
      <ShareCardContainer ref={cardRef} elevation={isPreview ? 0 : 4}>
        {/* Header with danger level */}
        <CardHeader dangerLevel={dangerLevel}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.9, display: 'block', lineHeight: 1 }}>
                Pothole Danger Report
              </Typography>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {location.district}
              </Typography>
            </Box>
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '50%', 
              width: 60, 
              height: 60, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              ml: 2,
            }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {dangerLevel}
              </Typography>
            </Box>
          </Box>
          
          <DangerMeter dangerLevel={dangerLevel} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Safe</Typography>
            <Typography variant="caption">Dangerous</Typography>
          </Box>
        </CardHeader>
        
        {/* Image */}
        {imageUrl && (
          <CardImage 
            src={imageUrl} 
            alt={`Pothole in ${location.district}`} 
            loading="lazy"
          />
        )}
        
        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ 
            fontStyle: 'italic', 
            mb: 2,
            color: theme.palette.text.secondary,
            fontSize: '1.1rem',
            lineHeight: 1.4,
          }}>
            "{getFunnyCaption()}"
          </Typography>
          
          {description && (
            <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              {description.length > 200 ? `${description.substring(0, 200)}...` : description}
            </Typography>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="caption" color="text.secondary">
              Reported on {dayjs(createdAt).format('MMM D, YYYY')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="img" 
                src="/logo192.png" 
                alt="Pothole Patrol" 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  mr: 1,
                  filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                PotholePatrol.app
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Footer with share actions */}
        {showActions && (
          <CardFooter>
            <Typography variant="caption" color="text.secondary">
              Share this report:
            </Typography>
            <Box>
              <Tooltip title="Copy link">
                <IconButton size="small" onClick={() => handleShareClick('copy')}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on Twitter">
                <IconButton size="small" onClick={() => handleShareClick('twitter')}>
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on Facebook">
                <IconButton size="small" onClick={() => handleShareClick('facebook')}>
                  <FacebookIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share on WhatsApp">
                <IconButton size="small" onClick={() => handleShareClick('whatsapp')}>
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download image">
                <IconButton size="small" onClick={handleDownload}>
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardFooter>
        )}
      </ShareCardContainer>
      
      {isPreview && showActions && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ShareIcon />}
            onClick={() => handleShareClick()}
            size={isMobile ? 'medium' : 'large'}
            sx={{ mr: 2 }}
          >
            Share This Report
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleDownload}
            size={isMobile ? 'medium' : 'large'}
          >
            Download Image
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ShareCard;
