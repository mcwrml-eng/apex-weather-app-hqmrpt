
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';

interface WindyWindFlowProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  zoom?: number;
  width?: number;
  height?: number;
  compact?: boolean;
}

const WindyWindFlow: React.FC<WindyWindFlowProps> = ({
  latitude,
  longitude,
  circuitName,
  zoom = 8,
  width = 340,
  height = 400,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentLayer, setCurrentLayer] = useState<'wind' | 'gust' | 'temp'>('wind');

  // Generate Windy.com embed URL with wind overlay
  const windyUrl = useMemo(() => {
    const baseUrl = 'https://embed.windy.com/embed2.html';
    const params = new URLSearchParams({
      lat: latitude.toFixed(4),
      lon: longitude.toFixed(4),
      detailLat: latitude.toFixed(4),
      detailLon: longitude.toFixed(4),
      width: '650',
      height: '450',
      zoom: currentZoom.toString(),
      level: 'surface',
      overlay: currentLayer,
      product: 'ecmwf',
      menu: '',
      message: '',
      marker: 'true',
      calendar: 'now',
      pressure: '',
      type: 'map',
      location: 'coordinates',
      detail: '',
      metricWind: 'km/h',
      metricTemp: '°C',
      radarRange: '-1',
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log('WindyWindFlow: Generated URL:', url);
    return url;
  }, [latitude, longitude, currentZoom, currentLayer]);

  // Generate HTML content for better control
  const htmlContent = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'};
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              display: block;
            }
          </style>
        </head>
        <body>
          <iframe 
            src="${windyUrl}"
            frameborder="0"
            allowfullscreen
            allow="geolocation"
          ></iframe>
        </body>
      </html>
    `;
  }, [windyUrl, isDark]);

  const handleZoomIn = useCallback(() => {
    if (currentZoom < 12) {
      setCurrentZoom(prev => prev + 1);
      setLoading(true);
      setError(null);
    }
  }, [currentZoom]);

  const handleZoomOut = useCallback(() => {
    if (currentZoom > 4) {
      setCurrentZoom(prev => prev - 1);
      setLoading(true);
      setError(null);
    }
  }, [currentZoom]);

  const handleReset = useCallback(() => {
    setCurrentZoom(zoom);
    setCurrentLayer('wind');
    setLoading(true);
    setError(null);
  }, [zoom]);

  const handleLayerChange = useCallback((layer: 'wind' | 'gust' | 'temp') => {
    setCurrentLayer(layer);
    setLoading(true);
    setError(null);
  }, []);

  const handleLoadStart = useCallback(() => {
    console.log('WindyWindFlow: Load started');
    setLoading(true);
    setError(null);
  }, []);

  const handleLoadEnd = useCallback(() => {
    console.log('WindyWindFlow: Load ended');
    setLoading(false);
  }, []);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WindyWindFlow: WebView error:', nativeEvent);
    setLoading(false);
    setError('Failed to load wind flow map. Please check your internet connection.');
  }, []);

  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WindyWindFlow: HTTP error:', nativeEvent);
    setLoading(false);
    setError(`HTTP Error: ${nativeEvent.statusCode || 'Unknown'}`);
  }, []);

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
    webviewContainer: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
      position: 'relative',
    },
    webview: {
      backgroundColor: 'transparent',
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
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      zIndex: 10,
      padding: 20,
    },
    errorText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.error,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
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
    controlButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    controlButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    controlButtonTextActive: {
      color: '#fff',
    },
    zoomLevel: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    layerControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    layerButton: {
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    layerButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    layerButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    layerButtonTextActive: {
      color: '#fff',
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    badgeText: {
      fontSize: 10,
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
  }), [colors, shadows, compact]);

  const webviewContainerStyle = useMemo(() => ({
    ...styles.webviewContainer,
    width: compact ? 280 : width,
    height: compact ? 320 : height,
  }), [styles.webviewContainer, compact, width, height]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="flag" size={20} color={colors.wind} />
          <Text style={styles.title}>Live Wind Flow</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WINDY.COM</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        Real-time wind flow visualization from Windy.com for {circuitName}
      </Text>

      <View style={webviewContainerStyle}>
        {loading && !error && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading wind flow map...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleHttpError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['*']}
          mixedContentMode="always"
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          incognito={false}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          geolocationEnabled={true}
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
        />
      </View>

      {/* Layer Selection Controls */}
      <View style={styles.layerControls}>
        <TouchableOpacity
          style={[styles.layerButton, currentLayer === 'wind' && styles.layerButtonActive]}
          onPress={() => handleLayerChange('wind')}
          activeOpacity={0.7}
        >
          <Icon 
            name="flag" 
            size={14} 
            color={currentLayer === 'wind' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, currentLayer === 'wind' && styles.layerButtonTextActive]}>
            Wind
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.layerButton, currentLayer === 'gust' && styles.layerButtonActive]}
          onPress={() => handleLayerChange('gust')}
          activeOpacity={0.7}
        >
          <Icon 
            name="flash" 
            size={14} 
            color={currentLayer === 'gust' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, currentLayer === 'gust' && styles.layerButtonTextActive]}>
            Gusts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.layerButton, currentLayer === 'temp' && styles.layerButtonActive]}
          onPress={() => handleLayerChange('temp')}
          activeOpacity={0.7}
        >
          <Icon 
            name="thermometer" 
            size={14} 
            color={currentLayer === 'temp' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, currentLayer === 'temp' && styles.layerButtonTextActive]}>
            Temp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zoom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentZoom >= 12 && styles.controlButtonDisabled]}
          onPress={handleZoomIn}
          disabled={currentZoom >= 12}
          activeOpacity={0.7}
        >
          <Icon name="add" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom In</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomLevel}>Zoom: {currentZoom}</Text>
        
        <TouchableOpacity
          style={[styles.controlButton, currentZoom <= 4 && styles.controlButtonDisabled]}
          onPress={handleZoomOut}
          disabled={currentZoom <= 4}
          activeOpacity={0.7}
        >
          <Icon name="remove" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        Powered by Windy.com • Interactive wind flow with particle animation
      </Text>
    </View>
  );
};

export default WindyWindFlow;
