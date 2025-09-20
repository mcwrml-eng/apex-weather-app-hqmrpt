
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  interpolate,
  Easing
} from 'react-native-reanimated';
import Icon from './Icon';
import { useTheme } from '../state/ThemeContext';
import { getColors } from '../styles/commonStyles';

interface Props {
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

const TrackRainfallRadar: React.FC<Props> = ({ 
  latitude, 
  longitude, 
  circuitName,
  country,
  category,
  compact = true,
  showControls = true,
  autoStartAnimation = false,
  radarOpacity = 0.8
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const isWeb = Platform.OS === 'web';
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const webViewRef = useRef<WebView>(null);

  console.log('TrackRainfallRadar: Initialized', { circuitName, category, isWeb });

  // Animation values
  const pulseAnimation = useSharedValue(0);
  const loadingRotation = useSharedValue(0);

  // Loading animation
  useEffect(() => {
    if (isLoading) {
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      loadingRotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(0, { duration: 300 });
      loadingRotation.value = withTiming(0, { duration: 300 });
    }
  }, [isLoading]);

  // Get category color
  const getCategoryColor = useCallback(() => {
    switch (category) {
      case 'f1': return '#E10600';
      case 'motogp': return '#FF8C00';
      case 'indycar': return '#0066CC';
      default: return colors.primary;
    }
  }, [category, colors]);

  // Simple HTML generation
  const generateRadarHTML = useCallback(() => {
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    const safeCountry = country.replace(/[<>"'&]/g, '');
    const categoryColor = getCategoryColor();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Radar - ${safeCircuitName}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: ${colors.background};
            color: ${colors.text};
            overflow: hidden;
        }
        #map { height: 100vh; width: 100vw; }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 16px;
            border-radius: 10px;
            text-align: center;
        }
        .spinner {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid ${categoryColor};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 8px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .status {
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
        }
        .circuit-info {
            position: absolute;
            bottom: 8px;
            left: 8px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 8px;
            border-radius: 6px;
            font-size: 10px;
            max-width: 150px;
        }
        .category-badge {
            background: ${categoryColor};
            color: white;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        <div style="font-size: 12px;">Loading...</div>
    </div>
    
    <div id="map"></div>
    <div id="status" class="status">Connecting...</div>
    
    <div class="circuit-info">
        <div class="category-badge">${category.toUpperCase()}</div>
        <div style="font-weight: bold; font-size: 11px;">${safeCircuitName}</div>
        <div style="opacity: 0.8;">${safeCountry}</div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let animationInterval = null;
        let isAnimating = false;
        
        function sendMessage(data) {
            try {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
        
        function updateStatus(text) {
            const status = document.getElementById('status');
            if (status) status.textContent = text;
        }
        
        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
        
        function showError(message) {
            hideLoading();
            updateStatus('❌ ' + message);
            sendMessage({ type: 'error', message: message });
        }
        
        async function initMap() {
            try {
                const lat = ${latitude};
                const lng = ${longitude};
                
                map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false,
                    maxZoom: 9,
                    minZoom: 5
                }).setView([lat, lng], ${compact ? '6' : '7'});
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 9
                }).addTo(map);
                
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('${safeCircuitName}<br>${safeCountry}');
                
                loadRadarData();
                
            } catch (error) {
                showError('Map failed');
            }
        }
        
        async function loadRadarData() {
            try {
                updateStatus('Loading...');
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                const data = await response.json();
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past;
                    
                    if (radarData.length > 0) {
                        currentFrame = radarData.length - 1;
                        hideLoading();
                        updateStatus('✅ Live');
                        
                        sendMessage({
                            type: 'connected',
                            totalFrames: radarData.length
                        });
                        
                        showRadarFrame(currentFrame);
                    } else {
                        showError('No data');
                    }
                } else {
                    showError('Invalid response');
                }
            } catch (error) {
                showError('Load failed');
            }
        }
        
        function showRadarFrame(frameIndex) {
            if (frameIndex < 0 || frameIndex >= radarData.length || !map) return;
            
            if (radarLayer) {
                map.removeLayer(radarLayer);
            }
            
            const frame = radarData[frameIndex];
            if (frame && frame.path) {
                const radarUrl = \`https://tilecache.rainviewer.com/v2/radar/\${frame.path}/256/{z}/{x}/{y}/2/1_1.png\`;
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: ${radarOpacity},
                    maxZoom: 9
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
            }
        }
        
        function toggleAnimation() {
            if (isAnimating) {
                clearInterval(animationInterval);
                isAnimating = false;
                updateStatus('✅ Live');
                sendMessage({ type: 'animationStopped' });
            } else {
                if (radarData.length > 1) {
                    isAnimating = true;
                    updateStatus('🎬 Playing');
                    sendMessage({ type: 'animationStarted' });
                    
                    animationInterval = setInterval(() => {
                        currentFrame = (currentFrame + 1) % radarData.length;
                        showRadarFrame(currentFrame);
                    }, 500);
                }
            }
        }
        
        window.addEventListener('message', function(event) {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'toggleAnimation') {
                    toggleAnimation();
                }
            } catch (error) {
                // Ignore non-JSON messages
            }
        });
        
        // Initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMap);
        } else {
            initMap();
        }
    </script>
</body>
</html>`;
  }, [latitude, longitude, circuitName, country, category, radarOpacity, colors, compact, getCategoryColor]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('TrackRainfallRadar: Message received:', message.type);
      
      switch (message.type) {
        case 'connected':
          setConnectionStatus('connected');
          setIsLoading(false);
          setHasError(false);
          setTotalFrames(message.totalFrames || 0);
          break;
          
        case 'error':
          setConnectionStatus('error');
          setIsLoading(false);
          setHasError(true);
          break;
          
        case 'animationStarted':
          setIsAnimating(true);
          break;
          
        case 'animationStopped':
          setIsAnimating(false);
          break;
      }
    } catch (error) {
      console.log('TrackRainfallRadar: Non-JSON message received');
    }
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('TrackRainfallRadar: WebView error:', syntheticEvent.nativeEvent);
    setIsLoading(false);
    setHasError(true);
    setConnectionStatus('error');
  }, []);

  const toggleAnimation = useCallback(() => {
    if (webViewRef.current && connectionStatus === 'connected') {
      webViewRef.current.postMessage(JSON.stringify({ type: 'toggleAnimation' }));
    }
  }, [connectionStatus]);

  const refreshRadar = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setConnectionStatus('connecting');
    setTotalFrames(0);
    setIsAnimating(false);
  }, []);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [0.99, 1.01]) }]
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }]
  }));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: compact ? 12 : 16,
      borderWidth: 1,
      borderColor: colors.divider,
      marginBottom: 16,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: compact ? 12 : 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    categoryBadge: {
      backgroundColor: getCategoryColor() + '20',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginRight: 6,
    },
    categoryText: {
      fontSize: 9,
      color: getCategoryColor(),
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    title: {
      fontSize: compact ? 14 : 16,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: compact ? 10 : 12,
      color: colors.textMuted,
      marginTop: 1,
    },
    controls: {
      flexDirection: 'row',
      gap: 6,
    },
    controlButton: {
      padding: compact ? 6 : 8,
      borderRadius: 6,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    animationButton: {
      padding: compact ? 6 : 8,
      borderRadius: 6,
      backgroundColor: getCategoryColor(),
    },
    statusContainer: {
      padding: compact ? 8 : 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusText: {
      fontSize: compact ? 10 : 11,
      color: colors.text,
      fontWeight: '600',
    },
    webViewContainer: {
      height: compact ? 180 : 240,
    },
    webView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      height: compact ? 180 : 240,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
    },
    loadingText: {
      fontSize: compact ? 12 : 14,
      color: colors.text,
      marginTop: 12,
      fontWeight: '600',
    },
    errorContainer: {
      height: compact ? 180 : 240,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: 16,
    },
    errorTitle: {
      fontSize: compact ? 14 : 16,
      color: colors.error,
      marginTop: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    errorText: {
      fontSize: compact ? 11 : 12,
      color: colors.textMuted,
      marginTop: 6,
      marginBottom: 16,
      textAlign: 'center',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: getCategoryColor(),
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: compact ? 11 : 12,
      fontWeight: '600',
    },
  });

  // Validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="warning" size={16} color={colors.error} />
            <Text style={styles.title}>Invalid Location</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="location-off" size={32} color={colors.error} />
          <Text style={styles.errorTitle}>Location Error</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          <Icon name="rainy" size={compact ? 16 : 18} color={colors.precipitation} />
          <View>
            <Text style={styles.title}>{circuitName}</Text>
            <Text style={styles.subtitle}>{country} • Live Radar</Text>
          </View>
        </View>
        {showControls && (
          <View style={styles.controls}>
            {totalFrames > 1 && connectionStatus === 'connected' && (
              <TouchableOpacity onPress={toggleAnimation} style={styles.animationButton}>
                <Icon 
                  name={isAnimating ? "pause" : "play"} 
                  size={compact ? 10 : 12} 
                  color="#fff" 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={refreshRadar} style={styles.controlButton}>
              <Animated.View style={loadingStyle}>
                <Icon name="refresh" size={compact ? 10 : 12} color={colors.text} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {connectionStatus === 'connected' ? '✅ Live' :
           connectionStatus === 'connecting' ? '🔄 Loading' : '❌ Error'}
          {isWeb && ' (Web)'}
        </Text>
        
        {totalFrames > 0 && (
          <Text style={styles.statusText}>
            {totalFrames} frames{isAnimating ? ' • Playing' : ''}
          </Text>
        )}
      </View>

      {isLoading && (
        <Animated.View style={[styles.loadingContainer, pulseStyle]}>
          <Animated.View style={loadingStyle}>
            <Icon name="cloud-download" size={compact ? 28 : 32} color={getCategoryColor()} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading Radar</Text>
        </Animated.View>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={compact ? 28 : 32} color={colors.error} />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>
            Unable to load radar data.
          </Text>
          <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
            <Icon name="refresh" size={compact ? 10 : 12} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !hasError && (
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: generateRadarHTML() }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            onError={handleWebViewError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
          />
        </View>
      )}
    </View>
  );
};

export default TrackRainfallRadar;
