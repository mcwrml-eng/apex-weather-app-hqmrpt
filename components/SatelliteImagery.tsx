
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';

interface SatelliteImageryProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  zoom?: number;
  width?: number;
  height?: number;
  compact?: boolean;
}

const SatelliteImagery: React.FC<SatelliteImageryProps> = ({
  latitude,
  longitude,
  circuitName,
  zoom = 15,
  width = 340,
  height = 340,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [retryCount, setRetryCount] = useState(0);
  const [useAlternative, setUseAlternative] = useState(false);

  // Calculate tile coordinates from lat/lon for tile-based services
  const getTileCoordinates = (lat: number, lon: number, zoom: number) => {
    const scale = 1 << zoom;
    const worldCoordX = ((lon + 180) / 360) * scale;
    const worldCoordY = ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2) * scale;
    
    return {
      x: Math.floor(worldCoordX),
      y: Math.floor(worldCoordY),
    };
  };

  // Primary: Esri World Imagery (free, no API key required, reliable)
  const primaryImageUrl = useMemo(() => {
    const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${currentZoom}/${y}/${x}`;
  }, [latitude, longitude, currentZoom]);

  // Alternative: USGS Imagery (another free option)
  const alternativeImageUrl = useMemo(() => {
    const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
    return `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${currentZoom}/${y}/${x}`;
  }, [latitude, longitude, currentZoom]);

  // Fallback: OpenStreetMap standard tiles (not satellite but always works)
  const fallbackImageUrl = useMemo(() => {
    const { x, y } = getTileCoordinates(latitude, longitude, currentZoom);
    return `https://tile.openstreetmap.org/${currentZoom}/${x}/${y}.png`;
  }, [latitude, longitude, currentZoom]);

  const currentImageUrl = useMemo(() => {
    if (useAlternative) {
      return alternativeImageUrl;
    }
    return primaryImageUrl;
  }, [useAlternative, primaryImageUrl, alternativeImageUrl]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    console.log(`Loading satellite imagery for ${circuitName} at ${latitude}, ${longitude}, zoom ${currentZoom}`);
    console.log(`Image URL: ${currentImageUrl}`);
  }, [latitude, longitude, currentZoom, circuitName, currentImageUrl]);

  const handleImageLoad = () => {
    console.log('Satellite imagery loaded successfully');
    setLoading(false);
    setError(false);
    setRetryCount(0);
  };

  const handleImageError = (error: any) => {
    console.error('Failed to load satellite imagery:', error);
    setLoading(false);
    
    // Try alternative source on first error
    if (!useAlternative && retryCount === 0) {
      console.log('Trying alternative imagery source...');
      setUseAlternative(true);
      setRetryCount(1);
      setLoading(true);
      return;
    }
    
    setError(true);
  };

  const handleZoomIn = () => {
    if (currentZoom < 18) {
      setCurrentZoom(prev => prev + 1);
      setError(false);
      setUseAlternative(false);
      setRetryCount(0);
    }
  };

  const handleZoomOut = () => {
    if (currentZoom > 10) {
      setCurrentZoom(prev => prev - 1);
      setError(false);
      setUseAlternative(false);
      setRetryCount(0);
    }
  };

  const handleReset = () => {
    setCurrentZoom(zoom);
    setError(false);
    setUseAlternative(false);
    setRetryCount(0);
    setLoading(true);
  };

  const handleRetry = () => {
    console.log('Retrying satellite imagery load...');
    setError(false);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    
    // Toggle between sources on retry
    setUseAlternative(prev => !prev);
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: compact ? 12 : 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    title: {
      fontSize: compact ? 16 : 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 16,
    },
    imageContainer: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
      position: 'relative',
    },
    satelliteImage: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      zIndex: 10,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    errorContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: 20,
      width: '100%',
      height: '100%',
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    errorSubtext: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    controlButton: {
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    controlButtonDisabled: {
      opacity: 0.4,
    },
    controlButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    zoomLevel: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    locationMarker: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -12,
      marginTop: -24,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.error,
      borderWidth: 3,
      borderColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
      zIndex: 5,
    },
    locationMarkerPulse: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -20,
      marginTop: -32,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.error,
      opacity: 0.3,
      zIndex: 4,
    },
    coordinatesInfo: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    coordinatesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    coordinatesLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
    },
    coordinatesValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Roboto_600SemiBold',
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    sourceIndicator: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 4,
      textAlign: 'center',
    },
  }), [colors, shadows, compact, isDark]);

  const imageContainerStyle = useMemo(() => ({
    ...styles.imageContainer,
    width: compact ? 280 : width,
    height: compact ? 280 : height,
  }), [styles.imageContainer, compact, width, height]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="globe" size={20} color={colors.primary} />
          <Text style={styles.title}>Satellite View</Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        Satellite imagery of {circuitName}
      </Text>

      <View style={imageContainerStyle}>
        {!error ? (
          <>
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.satelliteImage}
              contentFit="cover"
              transition={300}
              onLoad={handleImageLoad}
              onError={handleImageError}
              cachePolicy="memory-disk"
              priority="high"
            />
            
            {/* Location marker */}
            {!loading && (
              <>
                <View style={styles.locationMarkerPulse} />
                <View style={styles.locationMarker} />
              </>
            )}
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading satellite imagery...</Text>
                {retryCount > 0 && (
                  <Text style={styles.sourceIndicator}>
                    Trying alternative source...
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="image-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>Unable to load satellite imagery</Text>
            <Text style={styles.errorSubtext}>
              The imagery service may be temporarily unavailable.{'\n'}
              Try adjusting the zoom level or retry.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentZoom >= 18 && styles.controlButtonDisabled]}
          onPress={handleZoomIn}
          disabled={currentZoom >= 18}
          activeOpacity={0.7}
        >
          <Icon name="add" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom In</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomLevel}>Zoom: {currentZoom}</Text>
        
        <TouchableOpacity
          style={[styles.controlButton, currentZoom <= 10 && styles.controlButtonDisabled]}
          onPress={handleZoomOut}
          disabled={currentZoom <= 10}
          activeOpacity={0.7}
        >
          <Icon name="remove" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coordinatesInfo}>
        <View style={styles.coordinatesRow}>
          <Text style={styles.coordinatesLabel}>Latitude</Text>
          <Text style={styles.coordinatesValue}>{latitude.toFixed(6)}°</Text>
        </View>
        <View style={styles.coordinatesRow}>
          <Text style={styles.coordinatesLabel}>Longitude</Text>
          <Text style={styles.coordinatesValue}>{longitude.toFixed(6)}°</Text>
        </View>
      </View>

      <Text style={styles.infoText}>
        {useAlternative ? 'USGS Imagery' : 'Esri World Imagery'} • Zoom range: 10-18 • Circuit location marked with red pin
      </Text>
      {retryCount > 0 && (
        <Text style={styles.sourceIndicator}>
          Using alternative imagery source (attempt {retryCount})
        </Text>
      )}
    </View>
  );
};

export default SatelliteImagery;
