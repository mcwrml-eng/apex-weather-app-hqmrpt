
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
  alwaysVisible?: boolean;
  autoStartAnimation?: boolean;
  radarOpacity?: number;
}

const RainfallRadar: React.FC<Props> = ({ 
  latitude, 
  longitude, 
  circuitName, 
  alwaysVisible = true,
  autoStartAnimation = false,
  radarOpacity = 0.7
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const isWeb = Platform.OS === 'web';
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRadar, setShowRadar] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const webViewRef = useRef<WebView>(null);

  console.log('RainfallRadar: Initialized', { latitude, longitude, circuitName, isWeb });

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

  // Simple HTML generation
  const generateRadarHTML = useCallback(() => {
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rainfall Radar - ${safeCircuitName}</title>
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
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid ${colors.primary};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .status {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        <div>Loading Radar...</div>
    </div>
    
    <div id="map"></div>
    <div id="status" class="status">Connecting...</div>

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
                    zoomControl: true,
                    attributionControl: false,
                    maxZoom: 10,
                    minZoom: 4
                }).setView([lat, lng], 7);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 10
                }).addTo(map);
                
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('${safeCircuitName}');
                
                loadRadarData();
                
            } catch (error) {
                showError('Map initialization failed');
            }
        }
        
        async function loadRadarData() {
            try {
                updateStatus('Loading radar data...');
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
                const data = await response.json();
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past;
                    
                    if (radarData.length > 0) {
                        currentFrame = radarData.length - 1;
                        hideLoading();
                        updateStatus('✅ Connected');
                        
                        sendMessage({
                            type: 'connected',
                            totalFrames: radarData.length
                        });
                        
                        showRadarFrame(currentFrame);
                    } else {
                        showError('No radar data available');
                    }
                } else {
                    showError('Invalid API response');
                }
            } catch (error) {
                showError('Failed to load radar data');
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
                    maxZoom: 10
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
            }
        }
        
        function toggleAnimation() {
            if (isAnimating) {
                clearInterval(animationInterval);
                isAnimating = false;
                updateStatus('✅ Connected');
                sendMessage({ type: 'animationStopped' });
            } else {
                if (radarData.length > 1) {
                    isAnimating = true;
                    updateStatus('🎬 Animating');
                    sendMessage({ type: 'animationStarted' });
                    
                    animationInterval = setInterval(() => {
                        currentFrame = (currentFrame + 1) % radarData.length;
                        showRadarFrame(currentFrame);
                    }, 600);
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
  }, [latitude, longitude, circuitName, radarOpacity, colors]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Message received:', message.type);
      
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
      console.log('RainfallRadar: Non-JSON message received');
    }
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('RainfallRadar: WebView error:', syntheticEvent.nativeEvent);
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

  const toggleRadarView = useCallback(() => {
    if (!alwaysVisible) {
      setShowRadar(!showRadar);
    }
  }, [showRadar, alwaysVisible]);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [0.98, 1.02]) }]
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }]
  }));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
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
      backgroundColor: colors.backgroundAlt,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    controls: {
      flexDirection: 'row',
      gap: 8,
    },
    controlButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    animationButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    toggleText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    statusContainer: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
    },
    webViewContainer: {
      height: 300,
    },
    webView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text,
      marginTop: 16,
      fontWeight: '600',
    },
    errorContainer: {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: 24,
    },
    errorTitle: {
      fontSize: 18,
      color: colors.error,
      marginTop: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 8,
      marginBottom: 20,
      textAlign: 'center',
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    previewContainer: {
      alignItems: 'center',
      padding: 40,
    },
    previewTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    previewDescription: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  // Validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="warning" size={22} color={colors.error} />
            <Text style={styles.title}>Invalid Location</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="location-off" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorText}>
            Cannot display radar for this circuit.
          </Text>
        </View>
      </View>
    );
  }

  // Preview when hidden
  if (!showRadar && !alwaysVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={22} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
          <TouchableOpacity onPress={toggleRadarView} style={styles.toggleButton}>
            <Icon name="play" size={16} color="#fff" />
            <Text style={styles.toggleText}>Show Radar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.previewContainer}>
          <Animated.View style={pulseStyle}>
            <Icon name="thunderstorm" size={64} color={colors.precipitation} />
          </Animated.View>
          <Text style={styles.previewTitle}>Live Weather Radar</Text>
          <Text style={styles.previewDescription}>
            View real-time precipitation data for {circuitName}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="rainy" size={22} color={colors.precipitation} />
          <View>
            <Text style={styles.title}>Rainfall Radar</Text>
            <Text style={styles.subtitle}>{circuitName}</Text>
          </View>
        </View>
        <View style={styles.controls}>
          {totalFrames > 1 && connectionStatus === 'connected' && (
            <TouchableOpacity onPress={toggleAnimation} style={styles.animationButton}>
              <Icon 
                name={isAnimating ? "pause" : "play"} 
                size={16} 
                color="#fff" 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={refreshRadar} style={styles.controlButton}>
            <Animated.View style={loadingStyle}>
              <Icon name="refresh" size={16} color={colors.text} />
            </Animated.View>
          </TouchableOpacity>
          {!alwaysVisible && (
            <TouchableOpacity onPress={toggleRadarView} style={styles.controlButton}>
              <Icon name="close" size={16} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {connectionStatus === 'connected' ? '✅ Connected' :
           connectionStatus === 'connecting' ? '🔄 Connecting' : '❌ Error'}
          {isWeb && ' (Web Mode)'}
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
            <Icon name="cloud-download" size={48} color={colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading Radar</Text>
        </Animated.View>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorText}>
            Unable to load radar data. Please check your connection.
          </Text>
          <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
            <Icon name="refresh" size={16} color="#fff" />
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

export default RainfallRadar;
