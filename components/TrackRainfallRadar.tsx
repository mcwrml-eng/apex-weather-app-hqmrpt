
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
                  crossorigin=""></script>
          
          <script>
            console.log('=== Radar Script Starting ===');
            
            // Helper function to send messages to React Native
            function sendMessage(type, data) {
              try {
                const message = JSON.stringify({ type, data });
                console.log('Sending message:', type, data);
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(message);
                } else {
                  console.warn('ReactNativeWebView not available');
                }
              } catch (err) {
                console.error('Failed to send message:', err);
              }
            }

            // Track initialization state
            let initStarted = false;
            let mapReady = false;
            let radarReady = false;

            function initRadar() {
              if (initStarted) {
                console.log('Init already started, skipping');
                return;
              }
              initStarted = true;
              
              console.log('Starting radar initialization...');
              sendMessage('status', 'Checking libraries...');
              
              // Check if Leaflet is loaded
              if (typeof L === 'undefined') {
                console.error('Leaflet not loaded!');
                sendMessage('error', 'Map library (Leaflet) failed to load. Check internet connection.');
                return;
              }
              
              console.log('Leaflet version:', L.version);
              sendMessage('status', 'Initializing map...');
              
              try {
                // Initialize the map
                const map = L.map('map', {
                  center: [${latitude}, ${longitude}],
                  zoom: ${zoom},
                  zoomControl: ${showControls},
                  attributionControl: false,
                  preferCanvas: true
                });

                console.log('Map object created');
                sendMessage('status', 'Loading base tiles...');

                // Add OpenStreetMap tile layer
                const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                  errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                });
                
                let baseTilesLoaded = false;
                let baseTileCount = 0;
                
                baseLayer.on('tileload', function() {
                  baseTileCount++;
                  if (!baseTilesLoaded && baseTileCount >= 3) {
                    baseTilesLoaded = true;
                    mapReady = true;
                    console.log('Base tiles loaded, map ready');
                    sendMessage('status', 'Map ready, loading radar...');
                  }
                });
                
                baseLayer.on('load', function() {
                  if (!baseTilesLoaded) {
                    baseTilesLoaded = true;
                    mapReady = true;
                    console.log('Base layer load event fired');
                    sendMessage('status', 'Map ready, loading radar...');
                  }
                });
                
                baseLayer.addTo(map);

                // Fallback: mark map as ready after 2 seconds even if tiles don't load
                setTimeout(function() {
                  if (!mapReady) {
                    console.log('Map ready timeout - proceeding anyway');
                    mapReady = true;
                    sendMessage('status', 'Map initialized, loading radar...');
                  }
                }, 2000);

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
                console.log('Circuit marker added');

                // Rainfall radar variables
                let radarLayers = [];
                let animationPosition = 0;
                let animationTimer = null;

                function addRadarLayer(timestamp) {
                  const layer = L.tileLayer(
                    'https://tilecache.rainviewer.com/v2/radar/' + timestamp + '/256/{z}/{x}/{y}/2/1_1.png',
                    {
                      tileSize: 256,
                      opacity: ${radarOpacity},
                      zIndex: 10,
                      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
                    }
                  );
                  radarLayers.push(layer);
                  return layer;
                }

                // Fetch available radar timestamps
                console.log('Fetching radar data from RainViewer API...');
                sendMessage('status', 'Fetching radar timestamps...');
                
                const apiTimeout = setTimeout(function() {
                  if (!radarReady) {
                    console.error('API fetch timeout');
                    sendMessage('error', 'Radar API timeout. The service may be slow or unavailable.');
                  }
                }, 15000);

                fetch('https://api.rainviewer.com/public/weather-maps.json', {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json'
                  }
                })
                  .then(function(response) {
                    clearTimeout(apiTimeout);
                    console.log('API response status:', response.status);
                    
                    if (!response.ok) {
                      throw new Error('API returned status ' + response.status);
                    }
                    
                    return response.json();
                  })
                  .then(function(data) {
                    console.log('API data received:', data);
                    sendMessage('status', 'Processing radar data...');
                    
                    if (!data || !data.radar || !data.radar.past) {
                      throw new Error('Invalid API response structure');
                    }
                    
                    const timestamps = data.radar.past.concat(data.radar.nowcast || []);
                    console.log('Total radar frames:', timestamps.length);
                    
                    if (timestamps.length === 0) {
                      throw new Error('No radar data available');
                    }
                    
                    sendMessage('status', 'Loading ' + timestamps.length + ' radar frames...');
                    
                    // Create radar layers
                    timestamps.forEach(function(ts) {
                      addRadarLayer(ts.time);
                    });

                    console.log('Radar layers created:', radarLayers.length);

                    // Show the most recent frame
                    if (radarLayers.length > 0) {
                      const lastLayer = radarLayers[radarLayers.length - 1];
                      
                      let radarTileCount = 0;
                      let radarLoadFired = false;
                      
                      lastLayer.on('tileload', function() {
                        radarTileCount++;
                        console.log('Radar tile loaded:', radarTileCount);
                        
                        if (!radarLoadFired && radarTileCount >= 2) {
                          radarLoadFired = true;
                          radarReady = true;
                          console.log('Radar tiles loaded successfully');
                          sendMessage('loaded', 'Radar loaded with ' + timestamps.length + ' frames');
                        }
                      });
                      
                      lastLayer.on('load', function() {
                        if (!radarLoadFired) {
                          radarLoadFired = true;
                          radarReady = true;
                          console.log('Radar layer load event');
                          sendMessage('loaded', 'Radar loaded');
                        }
                      });
                      
                      lastLayer.on('tileerror', function(error) {
                        console.warn('Radar tile error (may be normal):', error);
                      });
                      
                      lastLayer.addTo(map);
                      animationPosition = radarLayers.length - 1;
                      
                      // Fallback: Mark as loaded after 5 seconds
                      // This handles cases where there's no rain (empty tiles don't fire load events)
                      setTimeout(function() {
                        if (!radarReady) {
                          radarReady = true;
                          console.log('Radar ready via timeout (likely no precipitation in area)');
                          sendMessage('loaded', 'Radar loaded - no active precipitation detected');
                        }
                      }, 5000);
                    }

                    // Animation function
                    ${isAnimating ? `
                    function animate() {
                      if (radarLayers.length > 0) {
                        radarLayers[animationPosition].remove();
                        animationPosition = (animationPosition + 1) % radarLayers.length;
                        radarLayers[animationPosition].addTo(map);
                      }
                    }
                    animationTimer = setInterval(animate, 500);
                    console.log('Animation started');
                    ` : 'console.log("Animation disabled");'}
                  })
                  .catch(function(err) {
                    clearTimeout(apiTimeout);
                    console.error('Radar loading error:', err);
                    const errorMsg = err.message || 'Unknown error';
                    sendMessage('error', 'Failed to load radar: ' + errorMsg);
                  });
              } catch (err) {
                console.error('Map initialization error:', err);
                sendMessage('error', 'Map initialization failed: ' + (err.message || 'Unknown error'));
              }
            }

            // Initialize when ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM ready');
                setTimeout(initRadar, 100);
              });
            } else {
              console.log('DOM already ready');
              setTimeout(initRadar, 100);
            }
            
            // Backup initialization after 1 second
            setTimeout(function() {
              if (!initStarted) {
                console.log('Backup initialization triggered');
                initRadar();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `;
  }, [latitude, longitude, circuitName, country, isDark, colors, compact, showControls, isAnimating, radarOpacity]);

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
      backgroundColor: colors.backgroundAlt + 'DD',
      zIndex: 1000,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    statusText: {
      marginTop: 4,
      fontSize: 11,
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
      marginTop: 8,
    },
    errorDetails: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      marginTop: 4,
      paddingHorizontal: 10,
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
      console.log('⏱️ Loading timeout reached (25s)');
      setLoading(false);
      setError(true);
      setErrorMessage('Loading timeout - the radar service may be unavailable or your connection is slow. Please try again later.');
    }, 25000); // 25 second timeout
  };

  const handleLoadEnd = () => {
    console.log('🏁 WebView load ended');
    setStatusMessage('WebView loaded, initializing radar...');
    // Don't set loading to false here - wait for the 'loaded' message from the HTML
  };

  const handleError = (syntheticEvent: any) => {
    if (!mountedRef.current) return;
    
    const { nativeEvent } = syntheticEvent;
    console.error('❌ WebView error:', nativeEvent);
    setLoading(false);
    setError(true);
    setErrorMessage('WebView failed to load. Please check your internet connection and try again.');
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
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
          <Icon name="cloud-offline" size={40} color={colors.error} />
          <Text style={styles.errorText}>
            Unable to load rainfall radar
          </Text>
          {errorMessage ? (
            <Text style={styles.errorDetails}>{errorMessage}</Text>
          ) : null}
          <Text style={styles.infoText}>
            The radar service may be temporarily unavailable or experiencing high traffic.
          </Text>
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
          </View>
        )}
      </View>
      
      <Text style={styles.subtitle}>
        Live precipitation data • Updated every 10 minutes
      </Text>

      <View style={styles.webviewContainer}>
        <WebView
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
          incognito={false}
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
