
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './Icon';
import { colors } from '../styles/commonStyles';

interface Props {
  latitude: number;
  longitude: number;
  circuitName: string;
}

const { width: screenWidth } = Dimensions.get('window');

const RainfallRadar: React.FC<Props> = ({ latitude, longitude, circuitName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Generate HTML content for the radar map
  const generateRadarHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rainfall Radar - ${circuitName}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background};
            color: ${colors.text};
        }
        #map {
            height: 100vh;
            width: 100%;
        }
        .radar-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 8px;
        }
        .radar-toggle {
            background: ${colors.primary};
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            margin-bottom: 4px;
            width: 100%;
        }
        .radar-toggle:hover {
            opacity: 0.8;
        }
        .radar-toggle.active {
            background: ${colors.accent};
        }
        .time-slider {
            width: 100%;
            margin-top: 8px;
        }
        .legend {
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 8px;
            font-size: 11px;
            color: white;
        }
        .legend-title {
            font-weight: bold;
            margin-bottom: 4px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 2px;
        }
        .legend-color {
            width: 12px;
            height: 12px;
            margin-right: 6px;
            border-radius: 2px;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div>Loading rainfall radar...</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">Powered by RainViewer</div>
    </div>
    
    <div id="map"></div>
    
    <div class="radar-controls">
        <button id="radarToggle" class="radar-toggle">Show Radar</button>
        <button id="satelliteToggle" class="radar-toggle">Satellite</button>
        <input type="range" id="timeSlider" class="time-slider" min="0" max="11" value="11" style="display: none;">
    </div>
    
    <div class="legend" id="legend" style="display: none;">
        <div class="legend-title">Rainfall Intensity</div>
        <div class="legend-item">
            <div class="legend-color" style="background: #00ff00;"></div>
            <span>Light</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ffff00;"></div>
            <span>Moderate</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ff8000;"></div>
            <span>Heavy</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ff0000;"></div>
            <span>Very Heavy</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #8000ff;"></div>
            <span>Extreme</span>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let isRadarVisible = false;
        let isSatelliteView = false;
        
        // Initialize map
        function initMap() {
            map = L.map('map').setView([${latitude}, ${longitude}], 8);
            
            // Default tile layer (OpenStreetMap)
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            });
            
            // Satellite tile layer
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
            });
            
            osmLayer.addTo(map);
            
            // Add circuit marker
            const circuitIcon = L.divIcon({
                html: '<div style="background: ${colors.primary}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11],
                className: 'circuit-marker'
            });
            
            L.marker([${latitude}, ${longitude}], { icon: circuitIcon })
                .addTo(map)
                .bindPopup('<b>${circuitName}</b><br>Racing Circuit')
                .openPopup();
            
            // Control buttons
            document.getElementById('radarToggle').addEventListener('click', toggleRadar);
            document.getElementById('satelliteToggle').addEventListener('click', toggleSatellite);
            document.getElementById('timeSlider').addEventListener('input', updateRadarFrame);
            
            // Load radar data
            loadRadarData();
            
            // Hide loading
            document.getElementById('loading').style.display = 'none';
            
            // Switch layers function
            window.switchToSatellite = function() {
                map.removeLayer(osmLayer);
                satelliteLayer.addTo(map);
                isSatelliteView = true;
                document.getElementById('satelliteToggle').textContent = 'Street Map';
                document.getElementById('satelliteToggle').classList.add('active');
            };
            
            window.switchToStreet = function() {
                map.removeLayer(satelliteLayer);
                osmLayer.addTo(map);
                isSatelliteView = false;
                document.getElementById('satelliteToggle').textContent = 'Satellite';
                document.getElementById('satelliteToggle').classList.remove('active');
            };
        }
        
        function toggleSatellite() {
            if (isSatelliteView) {
                window.switchToStreet();
            } else {
                window.switchToSatellite();
            }
        }
        
        async function loadRadarData() {
            try {
                // Use RainViewer API for radar data
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                const data = await response.json();
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past.concat(data.radar.nowcast || []);
                    console.log('Loaded radar frames:', radarData.length);
                    
                    if (radarData.length > 0) {
                        currentFrame = radarData.length - 1; // Start with latest frame
                        document.getElementById('timeSlider').max = radarData.length - 1;
                        document.getElementById('timeSlider').value = currentFrame;
                    }
                }
            } catch (error) {
                console.error('Failed to load radar data:', error);
            }
        }
        
        function toggleRadar() {
            const button = document.getElementById('radarToggle');
            const legend = document.getElementById('legend');
            const slider = document.getElementById('timeSlider');
            
            if (isRadarVisible) {
                // Hide radar
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                    radarLayer = null;
                }
                button.textContent = 'Show Radar';
                button.classList.remove('active');
                legend.style.display = 'none';
                slider.style.display = 'none';
                isRadarVisible = false;
            } else {
                // Show radar
                if (radarData.length > 0) {
                    showRadarFrame(currentFrame);
                    button.textContent = 'Hide Radar';
                    button.classList.add('active');
                    legend.style.display = 'block';
                    slider.style.display = 'block';
                    isRadarVisible = true;
                }
            }
        }
        
        function showRadarFrame(frameIndex) {
            if (frameIndex < 0 || frameIndex >= radarData.length) return;
            
            // Remove existing radar layer
            if (radarLayer) {
                map.removeLayer(radarLayer);
            }
            
            const frame = radarData[frameIndex];
            const radarUrl = \`https://tilecache.rainviewer.com/v2/radar/\${frame.path}/256/{z}/{x}/{y}/2/1_1.png\`;
            
            radarLayer = L.tileLayer(radarUrl, {
                opacity: 0.6,
                attribution: 'Radar data © RainViewer'
            });
            
            radarLayer.addTo(map);
            currentFrame = frameIndex;
            
            // Update time display
            const frameTime = new Date(frame.time * 1000);
            console.log('Showing radar frame for:', frameTime.toLocaleString());
        }
        
        function updateRadarFrame(event) {
            const frameIndex = parseInt(event.target.value);
            if (isRadarVisible) {
                showRadarFrame(frameIndex);
            }
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initMap);
        
        // Auto-refresh radar data every 10 minutes
        setInterval(loadRadarData, 10 * 60 * 1000);
    </script>
</body>
</html>`;
  };

  const handleWebViewLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleWebViewError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const toggleRadarView = () => {
    setShowRadar(!showRadar);
    if (!showRadar) {
      setIsLoading(true);
      setHasError(false);
    }
  };

  const refreshRadar = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setIsLoading(true);
      setHasError(false);
    }
  };

  if (!showRadar) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
          <TouchableOpacity onPress={toggleRadarView} style={styles.toggleButton}>
            <Icon name="map" size={16} color="#fff" />
            <Text style={styles.toggleText}>Show Radar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.previewContainer}>
          <Icon name="cloud-outline" size={48} color={colors.textMuted} />
          <Text style={styles.previewTitle}>Live Rainfall Radar</Text>
          <Text style={styles.previewDescription}>
            View real-time precipitation data and forecasts for {circuitName}
          </Text>
          <Text style={styles.previewFeatures}>
            • Live radar imagery{'\n'}
            • 12-hour historical data{'\n'}
            • Precipitation intensity levels{'\n'}
            • Satellite view option
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
          <Text style={styles.subtitle}>{circuitName}</Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={refreshRadar} style={styles.controlButton}>
            <Icon name="refresh" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleRadarView} style={styles.controlButton}>
            <Icon name="close" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Icon name="cloud-download" size={32} color={colors.textMuted} />
          <Text style={styles.loadingText}>Loading radar data...</Text>
          <Text style={styles.loadingSubtext}>Powered by RainViewer</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={32} color={colors.error} />
          <Text style={styles.errorText}>Failed to load radar</Text>
          <Text style={styles.errorSubtext}>Check your internet connection</Text>
          <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.webViewContainer, { opacity: isLoading || hasError ? 0 : 1 }]}>
        <WebView
          ref={webViewRef}
          source={{ html: generateRadarHTML() }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          scrollEnabled={true}
          bounces={false}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Real-time radar data • Updates every 10 minutes
        </Text>
        <Text style={styles.attribution}>
          Powered by RainViewer & OpenStreetMap
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    boxShadow: '0 6px 24px rgba(16,24,40,0.06)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginLeft: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundAlt,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  previewContainer: {
    alignItems: 'center',
    padding: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Roboto_700Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  previewFeatures: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  webViewContainer: {
    height: 400,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Roboto_500Medium',
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
  },
  errorContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    fontFamily: 'Roboto_500Medium',
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Roboto_500Medium',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.backgroundAlt,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  attribution: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.7,
  },
});

export default RainfallRadar;
