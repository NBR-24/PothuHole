/**
 * @file ReportPage.js
 * @description This page contains the form for users to report a new pothole.
 * It includes fields for image upload, location, danger level, and a description.
 */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  TextField,
  Slider,
  Grid,
  Card,
  CardMedia,
  CardActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { PhotoCamera, MyLocation, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import imageCompression from 'browser-image-compression';

const ReportPage = () => {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [preview, setPreview] = useState('');
  const [dangerLevel, setDangerLevel] = useState(5);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null, district: '', formattedAddress: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationMethod, setLocationMethod] = useState('auto');
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      setImage(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Failed to process image. Please try another one.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({ ...prev, lat: latitude, lng: longitude }));
        await getDistrictName(latitude, longitude);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Unable to retrieve your location. Please enable location services or enter manually.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getDistrictName = async (lat, lng) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const district = data.address.suburb || data.address.city_district || data.address.county || data.address.city || 'Unknown Location';
        setLocation(prev => ({ 
          ...prev, 
          district,
          formattedAddress: data.display_name || ''
        }));
      } else {
        setLocation(prev => ({ ...prev, district: 'Unknown Location' }));
      }
    } catch (err) { 
      console.error('Error fetching district name:', err);
      setError('Could not fetch location details. Please check your connection.');
      setLocation(prev => ({ ...prev, district: 'Unknown Location' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: value ? parseFloat(value) : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image || !location.lat || !location.lng) {
      setError('Please provide an image and set a location.');
      return;
    }
    if (!imageBase64) {
      setError('Image is still processing. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'reports'), {
        imageBase64,
        dangerLevel,
        description,
        location: {
          lat: location.lat,
          lng: location.lng,
          district: location.district,
          formattedAddress: location.formattedAddress,
        },
        createdAt: serverTimestamp(),
      });

      navigate('/');

    } catch (err) {
      console.error('Error adding document: ', err);
      setError('Failed to save report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Report a Pothole
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              1. Take or Upload a Photo
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-button-file"
              type="file"
              onChange={handleImageChange}
              disabled={isLoading}
            />
            <label htmlFor="upload-button-file">
              <Button 
                variant="contained" 
                component="span" 
                startIcon={<PhotoCamera />} 
                disabled={isLoading}
              >
                {isLoading && !preview ? 'Processing Image...' : 'Choose Photo'}
              </Button>
            </label>
            {preview && (
              <Box sx={{ mt: 2 }}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={preview}
                    alt="Pothole preview"
                  />
                  <CardActions>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => {
                        setPreview('');
                        setImage(null);
                        setImageBase64('');
                      }}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            )}
          </Box>

          {/* Location */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              2. Set Location
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="location-method-label">Location Method</InputLabel>
              <Select
                labelId="location-method-label"
                value={locationMethod}
                label="Location Method"
                onChange={(e) => setLocationMethod(e.target.value)}
              >
                <MenuItem value="auto">Automatic</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>
            
            {locationMethod === 'auto' ? (
              <Button
                variant="contained"
                startIcon={<MyLocation />}
                onClick={getCurrentLocation}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isLoading && !location.lat ? 'Getting Location...' : 'Use My Current Location'}
              </Button>
            ) : (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="lat"
                    type="number"
                    value={location.lat || ''}
                    onChange={handleManualLocationChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="lng"
                    type="number"
                    value={location.lng || ''}
                    onChange={handleManualLocationChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<MyLocation />}
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                  >
                    Use My Current Location Instead
                  </Button>
                </Grid>
              </Grid>
            )}
            
            {location.district && (
              <Box mt={2}>
                <Typography variant="body1">
                  <strong>Location:</strong> {location.district}
                </Typography>
                {location.formattedAddress && (
                  <Typography variant="body2" color="text.secondary">
                    {location.formattedAddress}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Coordinates: {location.lat?.toFixed(6)}, {location.lng?.toFixed(6)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Danger Level */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              3. Rate the Danger Level
            </Typography>
            <Typography id="danger-level-slider" gutterBottom>
              How dangerous is this pothole?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>😊</Typography>
              <Slider
                value={dangerLevel}
                onChange={(e, newValue) => setDangerLevel(newValue)}
                aria-labelledby="danger-level-slider"
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{
                  color: (theme) => {
                    if (dangerLevel <= 3) return theme.palette.success.main;
                    if (dangerLevel <= 7) return theme.palette.warning.main;
                    return theme.palette.error.main;
                  },
                }}
              />
              <Typography>😱</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">Not dangerous</Typography>
              <Typography variant="caption">Very dangerous</Typography>
            </Box>
            <FormHelperText>
              {dangerLevel <= 3 && 'Minor - Small crack or shallow pothole'}
              {dangerLevel > 3 && dangerLevel <= 7 && 'Moderate - Noticeable pothole that could damage tires'}
              {dangerLevel > 7 && 'Severe - Large pothole that could cause accidents'}
            </FormHelperText>
          </Box>

          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              4. Add Details (Optional)
            </Typography>
            <TextField
              fullWidth
              label="Additional details about the pothole"
              multiline
              rows={4}
              placeholder="E.g., Near the bus stop, in the middle of the lane, has been here for weeks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
            />
          </Box>

          {/* Submit Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={isLoading ? <CircularProgress size={24} /> : <Save />}
              disabled={isLoading || !image || !location.lat || !location.lng}
            >
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ReportPage;
