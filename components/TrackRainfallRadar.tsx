
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';

interface TrackRainfallRadarProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  country: string;
  category: 'f1' | 'motogp' | 'indycar';
  compact?: boolean;
  showControls?: boolean;
  autoStartAnimation?: boolean;
  radarOpacity?: number;
}

const TrackRainfallRadar: React.FC<TrackRainfallRadarProps> = ({
  latitude,
  longitude,
  circuitName,
  country,
  category,
  compact = false,
  showControls = true,
  autoStartAnimation = false,
  radarOpacity = 0.6,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(autoStartAnimation);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [retryKey, setRetryKey] = useState(0);
  const webViewRef = useRef<any>(null);
  const loadingTimeoutRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Generate the HTML content for the radar
  const radarHTML = useMemo(() => {
    const zoom = compact ? 7 : 8;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
                crossorigin="" />
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
              background: ${colors.background};
            }
            #map {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100%;
              height: 100%;
            }
            .legend {
              position: absolute;
              bottom: 10px;
              right: 10px;
              background: ${isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)'};
              padding: 8px 12px;
              border-radius: 8px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 11px;
              color: ${colors.text};
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              z-index: 1000;
            }
            .legend-title {
              font-weight: 600;
              margin-bottom: 6px;
              font-size: 12px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              margin: 3px 0;
            }
            .legend-color {
              width: 20px;
              height: 12px;
              margin-right: 6px;
              border-radius: 2px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <div class="legend">
            <div class="legend-title">Rainfall</div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(0, 255, 0, 0.3);"></div>
              <span>Light</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(255, 255, 0, 0.5);"></div>
              <span>Moderate</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(255, 165, 0, 0.6);"></div>
              <span>Heavy</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: rgba(255, 0, 0, 0.7);"></div>
              <span>Intense</span>
            </div>
          </div>
          
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
                  integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
                  crossorigin=""></script>
          
          <script>
            (function() {
              'use strict';
              
              console.log('=== Radar Script Starting (v2) ===');
              
              // Helper function to send messages to React Native
              function sendMessage(type, data) {
                try {
                  const message = JSON.stringify({ type: type, data: data });
                  console.log('[Message]', type, ':', data);
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(message);
                  }
                } catch (err) {
                  console.error('[Message Error]', err);
                }
              }

              // Global error handler
              window.onerror = function(msg, url, lineNo, columnNo, error) {
                console.error('[Global Error]', msg, 'at', url, lineNo + ':' + columnNo);
                sendMessage('error', 'JavaScript error: ' + msg);
                return false;
              };

              // Track state
              let map = null;
              let radarLayers = [];
              let animationPosition = 0;
              let animationTimer = null;
              let isInitialized = false;

              function initRadar() {
                if (isInitialized) {
                  console.log('[Init] Already initialized');
                  return;
                }
                isInitialized = true;
                
                console.log('[Init] Starting...');
                sendMessage('status', 'Checking libraries...');
                
                // Check if Leaflet is loaded
                if (typeof L === 'undefined') {
                  console.error('[Init] Leaflet not loaded!');
                  sendMessage('error', 'Map library failed to load. Please check your internet connection.');
                  return;
                }
                
                console.log('[Init] Leaflet version:', L.version);
                sendMessage('status', 'Creating map...');
                
                try {
                  // Initialize the map
                  map = L.map('map', {
                    center: [${latitude}, ${longitude}],
                    zoom: ${zoom},
                    zoomControl: ${showControls},
                    attributionControl: false,
                    preferCanvas: true,
                    fadeAnimation: false,
                    zoomAnimation: false
                  });

                  console.log('[Init] Map created');
                  sendMessage('status', 'Loading map tiles...');

                  // Add OpenStreetMap tile layer
                  const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    updateWhenIdle: false,
                    updateWhenZooming: false,
                    keepBuffer: 2
                  });
                  
                  let baseReady = false;
                  
                  baseLayer.on('load', function() {
                    if (!baseReady) {
                      baseReady = true;
                      console.log('[Base] Tiles loaded');
                      sendMessage('status', 'Map ready, fetching radar...');
                      loadRadarData();
                    }
                  });
                  
                  baseLayer.on('tileerror', function(error) {
                    console.warn('[Base] Tile error:', error.tile.src);
                  });
                  
                  baseLayer.addTo(map);

                  // Fallback: proceed after 3 seconds even if tiles don't fully load
                  setTimeout(function() {
                    if (!baseReady) {
                      console.log('[Base] Timeout - proceeding anyway');
                      baseReady = true;
                      sendMessage('status', 'Map initialized, fetching radar...');
                      loadRadarData();
                    }
                  }, 3000);

                  // Add circuit marker
                  const circuitMarker = L.circleMarker([${latitude}, ${longitude}], {
                    radius: 8,
                    fillColor: '${colors.primary}',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                  }).addTo(map);

                  circuitMarker.bindPopup('<b>${circuitName}</b><br>${country}');
                  console.log('[Init] Circuit marker added');

                } catch (err) {
                  console.error('[Init] Map error:', err);
                  sendMessage('error', 'Map initialization failed: ' + err.message);
                }
              }

              function loadRadarData() {
                console.log('[Radar] Fetching data from RainViewer API...');
                sendMessage('status', 'Connecting to radar service...');
                
                const apiUrl = 'https://api.rainviewer.com/public/weather-maps.json';
                const fetchTimeout = setTimeout(function() {
                  console.error('[Radar] API timeout');
                  sendMessage('error', 'Radar service timeout. Please try again.');
                }, 20000);

                fetch(apiUrl)
                  .then(function(response) {
                    clearTimeout(fetchTimeout);
                    console.log('[Radar] API response:', response.status);
                    
                    if (!response.ok) {
                      throw new Error('API returned status ' + response.status);
                    }
                    
                    return response.json();
                  })
                  .then(function(data) {
                    console.log('[Radar] Data received');
                    
                    if (!data || !data.radar || !data.radar.past) {
                      throw new Error('Invalid API response');
                    }
                    
                    const timestamps = data.radar.past.concat(data.radar.nowcast || []);
                    console.log('[Radar] Frames available:', timestamps.length);
                    
                    if (timestamps.length === 0) {
                      sendMessage('loaded', 'No radar data available');
                      return;
                    }
                    
                    sendMessage('status', 'Loading radar frames...');
                    
                    // Create radar layers
                    timestamps.forEach(function(ts) {
                      const layer = L.tileLayer(
                        'https://tilecache.rainviewer.com/v2/radar/' + ts.time + '/256/{z}/{x}/{y}/2/1_1.png',
                        {
                          tileSize: 256,
                          opacity: ${radarOpacity},
                          zIndex: 10,
                          updateWhenIdle: false,
                          updateWhenZooming: false
                        }
                      );
                      radarLayers.push(layer);
                    });

                    console.log('[Radar] Layers created:', radarLayers.length);

                    // Show the most recent frame
                    if (radarLayers.length > 0) {
                      const lastLayer = radarLayers[radarLayers.length - 1];
                      animationPosition = radarLayers.length - 1;
                      
                      let radarReady = false;
                      let tileCount = 0;
                      
                      lastLayer.on('tileload', function() {
                        tileCount++;
                        if (!radarReady && tileCount >= 1) {
                          radarReady = true;
                          console.log('[Radar] Tiles loaded');
                          sendMessage('loaded', 'Radar active with ' + timestamps.length + ' frames');
                        }
                      });
                      
                      lastLayer.on('load', function() {
                        if (!radarReady) {
                          radarReady = true;
                          console.log('[Radar] Load event');
                          sendMessage('loaded', 'Radar loaded');
                        }
                      });
                      
                      lastLayer.addTo(map);
                      
                      // Fallback: Mark as loaded after 4 seconds
                      // Empty tiles (no rain) don't fire load events
                      setTimeout(function() {
                        if (!radarReady) {
                          radarReady = true;
                          console.log('[Radar] Timeout - likely no precipitation');
                          sendMessage('loaded', 'Radar loaded - no active precipitation');
                        }
                      }, 4000);
                    }

                    // Start animation if enabled
                    ${isAnimating ? `
                    if (radarLayers.length > 1) {
                      animationTimer = setInterval(function() {
                        radarLayers[animationPosition].remove();
                        animationPosition = (animationPosition + 1) % radarLayers.length;
                        radarLayers[animationPosition].addTo(map);
                      }, 500);
                      console.log('[Animation] Started');
                    }
                    ` : ''}
                  })
                  .catch(function(err) {
                    clearTimeout(fetchTimeout);
                    console.error('[Radar] Error:', err);
                    sendMessage('error', 'Failed to load radar: ' + err.message);
                  });
              }

              // Initialize when DOM is ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                  console.log('[DOM] Ready');
                  setTimeout(initRadar, 200);
                });
              } else {
                console.log('[DOM] Already ready');
                setTimeout(initRadar, 200);
              }
              
              // Backup initialization
              setTimeout(function() {
                if (!isInitialized) {
                  console.log('[Init] Backup trigger');
                  initRadar();
                }
              }, 1500);
            })();
          </script>
        </body>
      </html>
    `;
  }, [latitude, longitude, circuitName, country, isDark, colors, compact, showControls, isAnimating, radarOpacity, retryKey]);

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
      marginBottom: 12,
    },
    controls: {
      flexDirection: 'row',
      gap: 8,
    },
    controlBtn: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: colors.backgroundAlt,
    },
    webviewContainer: {
      height: compact ? 200 : 300,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.backgroundAlt,
      position: 'relative',
    },
    webview: {
      flex: 1,
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
      backgroundColor: colors.backgroundAlt + 'EE',
      zIndex: 1000,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    statusText: {
      marginTop: 6,
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    errorContainer: {
      height: compact ? 200 : 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: 20,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      fontFamily: 'Roboto_500Medium',
      textAlign: 'center',
      marginTop: 12,
    },
    errorDetails: {
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 6,
      paddingHorizontal: 10,
    },
    retryButton: {
      marginTop: 16,
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
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
    },
  }), [colors, shadows, compact]);

  const handleMessage = (event: any) => {
    if (!mountedRef.current) return;
    
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 WebView message:', message.type, message.data);
      
      if (message.type === 'loaded') {
        console.log('✅ Radar loaded successfully');
        setLoading(false);
        setError(false);
        setStatusMessage('Radar loaded');
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      } else if (message.type === 'error') {
        console.error('❌ Radar error:', message.data);
        setLoading(false);
        setError(true);
        setErrorMessage(message.data);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      } else if (message.type === 'status') {
        console.log('📊 Status update:', message.data);
        setStatusMessage(message.data);
      }
    } catch (err) {
      console.error('Failed to parse WebView message:', err);
    }
  };

  const handleLoadStart = () => {
    if (!mountedRef.current) return;
    
    console.log('🔄 WebView load started');
    setLoading(true);
    setError(false);
    setStatusMessage('Loading WebView...');
    
    // Set a timeout to prevent infinite loading
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    loadingTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      console.log('⏱️ Loading timeout reached (30s)');
      setLoading(false);
      setError(true);
      setErrorMessage('Loading timeout - the radar service may be unavailable or your connection is slow.');
    }, 30000); // 30 second timeout
  };

  const handleLoadEnd = () => {
    console.log('🏁 WebView load ended');
    setStatusMessage('WebView loaded, initializing...');
  };

  const handleError = (syntheticEvent: any) => {
    if (!mountedRef.current) return;
    
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    setLoading(false);
    setError(true);
    setErrorMessage('WebView failed to load. Please check your internet connection.');
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying radar load...');
    setError(false);
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('Retrying...');
    setRetryKey(prev => prev + 1);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorText}>
            Unable to load rainfall radar
          </Text>
          {errorMessage ? (
            <Text style={styles.errorDetails}>{errorMessage}</Text>
          ) : null}
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="rainy" size={20} color={colors.precipitation} />
          <Text style={styles.title}>Rainfall Radar</Text>
        </View>
        {showControls && !loading && (
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlBtn}
              onPress={toggleAnimation}
              activeOpacity={0.7}
            >
              <Icon 
                name={isAnimating ? "pause" : "play"} 
                size={16} 
                color={colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlBtn}
              onPress={handleRetry}
              activeOpacity={0.7}
            >
              <Icon 
                name="refresh" 
                size={16} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={styles.subtitle}>
        Live precipitation data • Updated every 10 minutes
      </Text>

      <View style={styles.webviewContainer}>
        <WebView
          key={retryKey}
          ref={webViewRef}
          source={{ html: radarHTML }}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scrollEnabled={false}
          bounces={false}
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          cacheEnabled={false}
          incognito={true}
          thirdPartyCookiesEnabled={false}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading radar data...</Text>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}
      </View>

      <Text style={styles.infoText}>
        Radar data provided by RainViewer • Colors indicate rainfall intensity
      </Text>
    </View>
  );
};

export default TrackRainfallRadar;
