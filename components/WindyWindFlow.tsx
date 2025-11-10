
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  // Generate complete HTML with Windy API integration
  const htmlContent = useMemo(() => {
    const overlayMap: { [key: string]: string } = {
      wind: 'wind',
      gust: 'gust',
      temp: 'temp',
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Windy Wind Flow</title>
  
  <!-- Load Leaflet CSS first -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css" />
  
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #windy {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'};
      z-index: 1000;
      transition: opacity 0.3s ease;
    }
    
    .loading-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid ${colors.divider};
      border-top-color: ${colors.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .loading-text {
      margin-top: 16px;
      color: ${colors.text};
      font-size: 14px;
      font-weight: 500;
    }
    
    .debug-info {
      margin-top: 8px;
      color: ${colors.textMuted};
      font-size: 11px;
      text-align: center;
      max-width: 80%;
    }
    
    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'};
      z-index: 1001;
      padding: 20px;
      text-align: center;
    }
    
    .error-overlay.visible {
      display: flex;
    }
    
    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .error-text {
      color: ${colors.error};
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .retry-button {
      background-color: ${colors.primary};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="windy"></div>
  
  <div id="loading" class="loading-overlay">
    <div class="spinner"></div>
    <div class="loading-text">Loading wind flow map...</div>
    <div id="debug" class="debug-info"></div>
  </div>
  
  <div id="error" class="error-overlay">
    <div class="error-icon">⚠️</div>
    <div class="error-text" id="error-message">Failed to load wind flow map</div>
    <button class="retry-button" onclick="retryLoad()">Retry</button>
  </div>

  <!-- Load Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"></script>
  
  <!-- Load Windy API -->
  <script src="https://api.windy.com/assets/map-forecast/libBoot.js"></script>

  <script>
    let windyAPI = null;
    let loadAttempts = 0;
    const maxAttempts = 3;
    let loadTimeout = null;
    let scriptsLoaded = false;
    
    // Debug logging
    function log(message) {
      console.log('[WindyWindFlow]', message);
      const debugEl = document.getElementById('debug');
      if (debugEl) {
        debugEl.textContent = message;
      }
      
      // Send to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug',
          message: message
        }));
      }
    }
    
    function hideLoading() {
      const loading = document.getElementById('loading');
      if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => {
          loading.style.display = 'none';
        }, 300);
      }
    }
    
    function showError(message) {
      log('Error: ' + message);
      hideLoading();
      
      const error = document.getElementById('error');
      const errorMessage = document.getElementById('error-message');
      
      if (error) {
        error.classList.add('visible');
      }
      
      if (errorMessage && message) {
        errorMessage.textContent = message;
      }
      
      // Send error message to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: message || 'Failed to load wind flow map'
        }));
      }
    }
    
    function retryLoad() {
      log('Retrying...');
      const error = document.getElementById('error');
      if (error) {
        error.classList.remove('visible');
      }
      
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.display = 'flex';
        loading.classList.remove('hidden');
      }
      
      loadAttempts = 0;
      scriptsLoaded = false;
      
      // Clear any existing timeout
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      
      // Reload the page
      window.location.reload();
    }
    
    // Check if required libraries are loaded
    function checkLibraries() {
      log('Checking libraries...');
      
      if (typeof L === 'undefined') {
        log('Leaflet not loaded');
        return false;
      }
      
      if (typeof windyInit === 'undefined') {
        log('Windy API not loaded');
        return false;
      }
      
      log('All libraries loaded');
      scriptsLoaded = true;
      return true;
    }
    
    function initWindy() {
      loadAttempts++;
      log('Initializing Windy API (attempt ' + loadAttempts + '/' + maxAttempts + ')');
      
      if (loadAttempts > maxAttempts) {
        showError('Failed to load after ' + maxAttempts + ' attempts. Please check your internet connection and try again.');
        return;
      }
      
      // Check if libraries are loaded
      if (!checkLibraries()) {
        log('Libraries not ready, waiting...');
        setTimeout(() => {
          initWindy();
        }, 1000);
        return;
      }
      
      // Set a timeout for the entire initialization process
      loadTimeout = setTimeout(() => {
        log('Initialization timeout');
        showError('Map loading timed out. Please try again.');
      }, 15000); // 15 second timeout
      
      const options = {
        key: 'PsLAtXpj93NkYXlM7dMQjYcIliTVAE7k',
        lat: ${latitude.toFixed(4)},
        lon: ${longitude.toFixed(4)},
        zoom: ${currentZoom},
      };
      
      log('Calling windyInit with options: ' + JSON.stringify(options));
      
      try {
        windyInit(options, windyAPIReady);
      } catch (err) {
        log('Error calling windyInit: ' + err.message);
        clearTimeout(loadTimeout);
        
        if (loadAttempts < maxAttempts) {
          setTimeout(() => {
            initWindy();
          }, 2000);
        } else {
          showError('Failed to initialize Windy API: ' + err.message);
        }
      }
    }
    
    function windyAPIReady(windyAPIInstance) {
      log('Windy API ready callback triggered');
      
      // Clear the timeout
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      
      windyAPI = windyAPIInstance;
      
      try {
        const { map, overlays, store } = windyAPI;
        
        if (!map) {
          throw new Error('Map object not available');
        }
        
        log('Map object available, setting up...');
        
        // Set the overlay based on current layer
        const overlayName = '${overlayMap[currentLayer]}';
        log('Setting overlay to: ' + overlayName);
        
        // Set up map event handlers
        let mapLoaded = false;
        
        // Set a timeout for map load
        const mapLoadTimeout = setTimeout(() => {
          if (!mapLoaded) {
            log('Map load event timeout, assuming loaded');
            finishSetup();
          }
        }, 10000); // 10 second timeout for map load
        
        function finishSetup() {
          if (mapLoaded) return;
          mapLoaded = true;
          
          clearTimeout(mapLoadTimeout);
          log('Finishing map setup');
          
          try {
            // Set overlay
            store.set('overlay', overlayName);
            
            // Add marker at circuit location
            const markerIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: ${colors.primary}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            });
            
            const marker = L.marker([${latitude}, ${longitude}], {
              icon: markerIcon
            }).addTo(map);
            
            log('Marker added');
            
            // Center map on location
            map.setView([${latitude}, ${longitude}], ${currentZoom});
            
            log('Map centered');
            
            // Force map to render
            setTimeout(() => {
              map.invalidateSize();
              log('Map size invalidated');
            }, 100);
            
            // Hide loading overlay
            hideLoading();
            
            log('Map loaded successfully');
            
            // Send success message to React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'loaded',
                message: 'Wind flow map loaded successfully'
              }));
            }
          } catch (err) {
            log('Error in finishSetup: ' + err.message);
            showError('Failed to complete map setup: ' + err.message);
          }
        }
        
        // Try multiple events to detect when map is ready
        map.on('load', () => {
          log('Map load event fired');
          finishSetup();
        });
        
        map.on('zoomend', () => {
          if (!mapLoaded) {
            log('Map zoomend event fired (assuming loaded)');
            finishSetup();
          }
        });
        
        map.on('moveend', () => {
          if (!mapLoaded) {
            log('Map moveend event fired (assuming loaded)');
            finishSetup();
          }
        });
        
        // Also try to finish setup after a short delay
        setTimeout(() => {
          if (!mapLoaded) {
            log('Timeout fallback, finishing setup');
            finishSetup();
          }
        }, 3000);
        
        map.on('error', (err) => {
          log('Map error event: ' + (err.message || 'Unknown error'));
          clearTimeout(mapLoadTimeout);
          showError('Map error: ' + (err.message || 'Unknown error'));
        });
        
      } catch (err) {
        log('Error in windyAPIReady: ' + err.message);
        showError('Failed to initialize wind flow visualization: ' + err.message);
      }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      log('Waiting for DOM...');
      document.addEventListener('DOMContentLoaded', () => {
        log('DOM ready');
        setTimeout(initWindy, 500);
      });
    } else {
      log('DOM already ready');
      setTimeout(initWindy, 500);
    }
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && windyAPI) {
        log('Page visible again, refreshing map');
        const { map } = windyAPI;
        if (map) {
          map.invalidateSize();
        }
      }
    });
    
    // Global error handler
    window.addEventListener('error', (event) => {
      log('Global error: ' + event.message);
      if (event.message.includes('windyInit') || event.message.includes('Leaflet')) {
        showError('Failed to load required libraries. Please check your internet connection.');
      }
    });
  </script>
</body>
</html>
    `.trim();
  }, [latitude, longitude, currentZoom, currentLayer, isDark, colors]);

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
    setRetryCount(0);
    setDebugInfo('');
  }, [zoom]);

  const handleLayerChange = useCallback((layer: 'wind' | 'gust' | 'temp') => {
    setCurrentLayer(layer);
    setLoading(true);
    setError(null);
  }, []);

  const handleLoadStart = useCallback(() => {
    console.log('WindyWindFlow: WebView load started');
    setLoading(true);
    setError(null);
    setDebugInfo('Loading WebView...');
  }, []);

  const handleLoadEnd = useCallback(() => {
    console.log('WindyWindFlow: WebView load ended');
    setDebugInfo('WebView loaded, initializing map...');
    // Don't set loading to false here - wait for message from WebView
  }, []);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WindyWindFlow: WebView error:', nativeEvent);
    setLoading(false);
    setError('Failed to load wind flow map. Please check your internet connection.');
    setDebugInfo('WebView error: ' + JSON.stringify(nativeEvent));
  }, []);

  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WindyWindFlow: HTTP error:', nativeEvent);
    setLoading(false);
    setError(`HTTP Error: ${nativeEvent.statusCode || 'Unknown'}`);
    setDebugInfo('HTTP error: ' + nativeEvent.statusCode);
  }, []);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WindyWindFlow: Received message from WebView:', data);
      
      if (data.type === 'loaded') {
        setLoading(false);
        setError(null);
        setRetryCount(0);
        setDebugInfo('Map loaded successfully');
      } else if (data.type === 'error') {
        setLoading(false);
        setError(data.message || 'Failed to load wind flow map');
        setDebugInfo('Error: ' + data.message);
      } else if (data.type === 'debug') {
        setDebugInfo(data.message);
        console.log('WindyWindFlow debug:', data.message);
      }
    } catch (err) {
      console.error('WindyWindFlow: Error parsing message:', err);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
    setDebugInfo('Retrying...');
    
    // Force reload WebView
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  // Auto-retry on error (max 2 times)
  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        console.log('WindyWindFlow: Auto-retrying...', retryCount + 1);
        handleRetry();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, handleRetry]);

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
    debugText: {
      marginTop: 8,
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      paddingHorizontal: 20,
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
    retryInfo: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
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
            {retryCount > 0 && (
              <Text style={styles.retryInfo}>Retry attempt {retryCount}/2</Text>
            )}
            {debugInfo && (
              <Text style={styles.debugText}>{debugInfo}</Text>
            )}
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            {debugInfo && (
              <Text style={styles.debugText}>{debugInfo}</Text>
            )}
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            {retryCount >= 2 && (
              <Text style={styles.retryInfo}>
                If the issue persists, please check your internet connection
              </Text>
            )}
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleHttpError}
          onMessage={handleMessage}
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
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          incognito={false}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          geolocationEnabled={true}
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
          androidHardwareAccelerationDisabled={false}
          javaScriptCanOpenWindowsAutomatically={false}
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
