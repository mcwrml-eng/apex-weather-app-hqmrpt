
import React, { useState, useMemo } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(autoStartAnimation);

  // Generate the HTML content for the radar
  const radarHTML = useMemo(() => {
    const zoom = compact ? 7 : 8;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              overflow: hidden;
              background: ${colors.background};
            }
            #map {
              position: absolute;
              top: 0;
              bottom: 0;
              width: 100%;
            }
            .legend {
              position: absolute;
              bottom: 10px;
              right: 10px;
              background: ${isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'};
              padding: 8px 12px;
              border-radius: 8px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 11px;
              color: ${colors.text};
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
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
            .circuit-marker {
              width: 12px;
              height: 12px;
              background: ${colors.primary};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .loading-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: ${colors.background};
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2000;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: ${colors.text};
            }
            .loading-overlay.hidden {
              display: none;
            }
          </style>
        </head>
        <body>
          <div id="loading" class="loading-overlay">
            <div>Loading radar data...</div>
          </div>
          <div id="map"></div>
          <div class="legend">
            <div class="legend-title">Rainfall Intensity</div>
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
          
          <!-- Load Leaflet BEFORE using it -->
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          
          <script>
            console.log('Initializing rainfall radar...');
            
            // Wait for Leaflet to be fully loaded
            if (typeof L === 'undefined') {
              console.error('Leaflet not loaded!');
              document.getElementById('loading').innerHTML = '<div>Error: Map library failed to load</div>';
            } else {
              console.log('Leaflet loaded successfully');
              
              try {
                // Initialize the map
                const map = L.map('map', {
                  center: [${latitude}, ${longitude}],
                  zoom: ${zoom},
                  zoomControl: ${showControls},
                  attributionControl: false
                });

                console.log('Map initialized');

                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 19,
                }).addTo(map);

                console.log('Base map layer added');

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

                // Add rainfall overlay from RainViewer API
                let radarLayers = [];
                let animationPosition = 0;
                let animationTimer = null;

                function addRadarLayer(timestamp) {
                  const layer = L.tileLayer(
                    'https://tilecache.rainviewer.com/v2/radar/' + timestamp + '/256/{z}/{x}/{y}/2/1_1.png',
                    {
                      tileSize: 256,
                      opacity: ${radarOpacity},
                      zIndex: 10
                    }
                  );
                  radarLayers.push(layer);
                  return layer;
                }

                // Fetch available radar timestamps
                console.log('Fetching radar data from RainViewer API...');
                fetch('https://api.rainviewer.com/public/weather-maps.json')
                  .then(response => {
                    console.log('API response received');
                    return response.json();
                  })
                  .then(data => {
                    console.log('Radar data parsed:', data);
                    
                    if (!data.radar || !data.radar.past) {
                      throw new Error('Invalid radar data structure');
                    }
                    
                    const timestamps = data.radar.past.concat(data.radar.nowcast || []);
                    console.log('Total radar frames:', timestamps.length);
                    
                    if (timestamps.length === 0) {
                      throw new Error('No radar data available');
                    }
                    
                    // Load radar layers
                    timestamps.forEach((ts, index) => {
                      addRadarLayer(ts.time);
                      console.log('Added radar layer', index + 1, 'of', timestamps.length);
                    });

                    // Show the most recent frame
                    if (radarLayers.length > 0) {
                      radarLayers[radarLayers.length - 1].addTo(map);
                      animationPosition = radarLayers.length - 1;
                      console.log('Displaying most recent radar frame');
                    }

                    // Hide loading overlay
                    document.getElementById('loading').classList.add('hidden');
                    console.log('Radar loaded successfully');

                    // Animation function
                    ${isAnimating ? `
                    function animate() {
                      radarLayers[animationPosition].remove();
                      animationPosition = (animationPosition + 1) % radarLayers.length;
                      radarLayers[animationPosition].addTo(map);
                    }
                    animationTimer = setInterval(animate, 500);
                    console.log('Animation started');
                    ` : 'console.log("Animation disabled");'}
                  })
                  .catch(err => {
                    console.error('Failed to load radar data:', err);
                    document.getElementById('loading').innerHTML = '<div>Error loading radar data<br><small>' + err.message + '</small></div>';
                  });
              } catch (err) {
                console.error('Map initialization error:', err);
                document.getElementById('loading').innerHTML = '<div>Error initializing map<br><small>' + err.message + '</small></div>';
              }
            }
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
      backgroundColor: colors.backgroundAlt,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 12,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
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
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 8,
      fontStyle: 'italic',
    },
  }), [colors, shadows, compact]);

  const handleLoadEnd = () => {
    console.log('WebView load ended');
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setLoading(false);
    setError(true);
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
            Unable to load rainfall radar data
          </Text>
          <Text style={styles.infoText}>
            Please check your internet connection
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
        {showControls && (
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
          source={{ html: radarHTML }}
          style={styles.webview}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scrollEnabled={false}
          bounces={false}
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading radar data...</Text>
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
