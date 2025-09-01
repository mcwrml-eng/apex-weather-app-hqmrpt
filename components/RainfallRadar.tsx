
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  withSpring
} from 'react-native-reanimated';
import Icon from './Icon';
import { colors } from '../styles/commonStyles';

interface Props {
  latitude: number;
  longitude: number;
  circuitName: string;
  alwaysVisible?: boolean;
  autoStartAnimation?: boolean;
  showIntensityLegend?: boolean;
  enableSatelliteView?: boolean;
  radarOpacity?: number;
  refreshInterval?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RainfallRadar: React.FC<Props> = ({ 
  latitude, 
  longitude, 
  circuitName, 
  alwaysVisible = true,
  autoStartAnimation = true,
  showIntensityLegend = true,
  enableSatelliteView = true,
  radarOpacity = 0.7,
  refreshInterval = 10
}) => {
  // Simplified state management
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRadar, setShowRadar] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'retrying'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const webViewRef = useRef<WebView>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simplified animation values
  const pulseAnimation = useSharedValue(0);
  const loadingRotation = useSharedValue(0);
  const errorShake = useSharedValue(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAYS = [2000, 4000, 8000];
  const CONNECTION_TIMEOUT = 10000;

  console.log('RainfallRadar: Simplified component initialized', { 
    latitude, 
    longitude, 
    circuitName, 
    connectionStatus,
    retryCount
  });

  // Simplified retry mechanism
  const retryConnection = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log('RainfallRadar: Max retry attempts reached');
      setConnectionStatus('error');
      setHasError(true);
      setErrorMessage(`Failed to connect after ${MAX_RETRY_ATTEMPTS} attempts`);
      setIsLoading(false);
      return;
    }

    const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    console.log(`RainfallRadar: Retrying in ${delay}ms (attempt ${retryCount + 1})`);
    
    setRetryCount(prev => prev + 1);
    setConnectionStatus('retrying');
    setIsLoading(true);
    setHasError(false);

    retryTimeoutRef.current = setTimeout(() => {
      console.log('RainfallRadar: Executing retry');
      setWebViewKey(prev => prev + 1);
      setConnectionStatus('connecting');
    }, delay);
  }, [retryCount]);

  // Simplified refresh function
  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Refreshing radar');
    setWebViewKey(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
    setIsAnimating(false);
    setCurrentFrame(0);
    setTotalFrames(0);
    setRetryCount(0);
    setConnectionStatus('connecting');
    setErrorMessage('');
    setLastUpdateTime(null);
  }, []);

  // Simplified toggle animation
  const toggleAnimation = useCallback(() => {
    console.log('RainfallRadar: Toggle animation');
    if (webViewRef.current && connectionStatus === 'connected') {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleAnimation'
      }));
    }
  }, [connectionStatus]);

  // Auto-start animation effect
  useEffect(() => {
    if (autoStartAnimation && totalFrames > 1 && !isAnimating && connectionStatus === 'connected') {
      console.log('RainfallRadar: Auto-starting animation');
      const timer = setTimeout(toggleAnimation, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoStartAnimation, totalFrames, isAnimating, connectionStatus, toggleAnimation]);

  // Auto-refresh effect
  useEffect(() => {
    if (!showRadar || connectionStatus === 'error') return;
    
    const refreshTimer = setInterval(() => {
      console.log('RainfallRadar: Auto-refreshing');
      refreshRadar();
    }, refreshInterval * 60 * 1000);
    
    return () => clearInterval(refreshTimer);
  }, [showRadar, connectionStatus, refreshInterval, refreshRadar]);

  // Loading animation effect
  useEffect(() => {
    if (isLoading) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
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
  }, [isLoading, pulseAnimation, loadingRotation]);

  // Error shake animation effect
  useEffect(() => {
    if (hasError) {
      errorShake.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        2,
        false
      );
    }
  }, [hasError, errorShake]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.6, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [0.98, 1.02]) }]
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }]
  }));

  const errorShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }]
  }));

  // Simplified HTML generation
  const generateRadarHTML = useCallback(() => {
    console.log('RainfallRadar: Generating simplified HTML');
    
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    const safeOpacity = Math.max(0.1, Math.min(1, radarOpacity));
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Rainfall Radar - ${safeCircuitName}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background};
            color: ${colors.text};
            overflow: hidden;
        }
        #map {
            height: 100vh;
            width: 100%;
        }
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
        .loading-spinner {
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
        .error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(255, 59, 48, 0.95);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            max-width: 250px;
        }
        .status {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 12px;
            color: white;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div>Loading Radar...</div>
    </div>
    
    <div id="error" class="error" style="display: none;">
        <div style="font-weight: bold; margin-bottom: 8px;">Connection Failed</div>
        <div id="errorMessage">Unable to load radar data</div>
    </div>
    
    <div id="map"></div>
    <div id="status" class="status">Connecting...</div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        console.log('RainfallRadar: Starting simplified radar');
        
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let animationInterval = null;
        let isAnimating = false;
        
        function updateStatus(text) {
            const status = document.getElementById('status');
            if (status) status.textContent = text;
        }
        
        function showError(message) {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const errorMessage = document.getElementById('errorMessage');
            
            if (loading) loading.style.display = 'none';
            if (error) {
                error.style.display = 'block';
                if (errorMessage) errorMessage.textContent = message;
            }
            updateStatus('Error');
            
            sendMessage({
                type: 'error',
                message: message
            });
        }
        
        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
        
        function sendMessage(data) {
            try {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
        
        async function initMap() {
            try {
                console.log('RainfallRadar: Initializing map');
                updateStatus('Initializing...');
                
                const lat = parseFloat(${latitude});
                const lng = parseFloat(${longitude});
                
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinates');
                }
                
                map = L.map('map', {
                    zoomControl: true,
                    attributionControl: false,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true,
                    dragging: true,
                    maxZoom: 10,
                    minZoom: 5
                }).setView([lat, lng], 7);
                
                // Simple tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 10,
                    crossOrigin: true
                }).addTo(map);
                
                // Circuit marker
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup('<b>${safeCircuitName}</b><br>Racing Circuit');
                
                // Load radar data
                await loadRadarData();
                
            } catch (error) {
                console.error('Map initialization failed:', error);
                showError('Map initialization failed: ' + error.message);
            }
        }
        
        async function loadRadarData() {
            try {
                console.log('RainfallRadar: Loading radar data');
                updateStatus('Loading radar...');
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                
                const data = await response.json();
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past.concat(data.radar.nowcast || []);
                    
                    if (radarData.length > 0) {
                        console.log('RainfallRadar: Loaded', radarData.length, 'frames');
                        currentFrame = radarData.length - 1;
                        
                        hideLoading();
                        updateStatus('Connected');
                        
                        sendMessage({
                            type: 'connected',
                            totalFrames: radarData.length,
                            currentFrame: currentFrame
                        });
                        
                        showRadarFrame(currentFrame);
                    } else {
                        throw new Error('No radar data available');
                    }
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Failed to load radar data:', error);
                showError('Failed to load radar: ' + error.message);
            }
        }
        
        function showRadarFrame(frameIndex) {
            try {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) return;
                
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                }
                
                const frame = radarData[frameIndex];
                if (!frame || !frame.path) return;
                
                const radarUrl = 'https://tilecache.rainviewer.com/v2/radar/' + frame.path + '/256/{z}/{x}/{y}/2/1_1.png';
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: ${safeOpacity},
                    crossOrigin: true
                }).addTo(map);
                
                currentFrame = frameIndex;
                
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length
                });
                
            } catch (error) {
                console.error('Failed to show frame:', error);
            }
        }
        
        function startAnimation() {
            if (isAnimating || radarData.length <= 1) return;
            
            isAnimating = true;
            updateStatus('Animating...');
            
            sendMessage({
                type: 'animationStarted'
            });
            
            animationInterval = setInterval(() => {
                currentFrame = (currentFrame + 1) % radarData.length;
                showRadarFrame(currentFrame);
            }, 800);
        }
        
        function stopAnimation() {
            if (!isAnimating) return;
            
            isAnimating = false;
            updateStatus('Connected');
            
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
            
            sendMessage({
                type: 'animationStopped'
            });
        }
        
        function toggleAnimation() {
            if (isAnimating) {
                stopAnimation();
            } else {
                startAnimation();
            }
        }
        
        // Message handling
        window.addEventListener('message', function(event) {
            try {
                const message = JSON.parse(event.data);
                
                switch (message.type) {
                    case 'toggleAnimation':
                        toggleAnimation();
                        break;
                }
            } catch (error) {
                console.log('Non-JSON message received');
            }
        });
        
        // Initialize when ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('RainfallRadar: DOM ready, initializing');
            initMap();
        });
        
        // Error handling
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
            showError('Script error occurred');
        });
        
    </script>
</body>
</html>`;
  }, [latitude, longitude, circuitName, radarOpacity]);

  // WebView event handlers
  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: WebView loaded');
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('RainfallRadar: WebView error:', syntheticEvent.nativeEvent);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('WebView error: ' + syntheticEvent.nativeEvent.description);
    setConnectionStatus('error');
    retryConnection();
  }, [retryConnection]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Message from WebView:', message);
      
      switch (message.type) {
        case 'connected':
          setConnectionStatus('connected');
          setIsLoading(false);
          setHasError(false);
          setTotalFrames(message.totalFrames);
          setCurrentFrame(message.currentFrame);
          setLastUpdateTime(new Date());
          setRetryCount(0);
          break;
        case 'error':
          setConnectionStatus('error');
          setIsLoading(false);
          setHasError(true);
          setErrorMessage(message.message);
          retryConnection();
          break;
        case 'frameChanged':
          setCurrentFrame(message.currentFrame);
          break;
        case 'animationStarted':
          setIsAnimating(true);
          break;
        case 'animationStopped':
          setIsAnimating(false);
          break;
      }
    } catch (error) {
      console.log('RainfallRadar: Non-JSON message:', event.nativeEvent.data);
    }
  }, [retryConnection]);

  const toggleRadarView = useCallback(() => {
    console.log('RainfallRadar: Toggling radar view');
    if (!alwaysVisible) {
      setShowRadar(!showRadar);
      if (!showRadar) {
        refreshRadar();
      }
    }
  }, [showRadar, alwaysVisible, refreshRadar]);

  // Prop validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.error('RainfallRadar: Invalid coordinates:', { latitude, longitude });
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="warning" size={20} color={colors.error} />
            <Text style={styles.title}>Rainfall Radar Error</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="location-off" size={48} color={colors.error} />
          <Text style={styles.errorText}>Invalid Location Data</Text>
          <Text style={styles.errorSubtext}>
            Cannot display radar for this circuit.
          </Text>
        </View>
      </View>
    );
  }

  // Preview when radar is hidden
  if (!showRadar && !alwaysVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Simplified Rainfall Radar</Text>
          </View>
          <TouchableOpacity onPress={toggleRadarView} style={styles.toggleButton}>
            <Icon name="play" size={16} color="#fff" />
            <Text style={styles.toggleText}>Launch Radar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.previewContainer}>
          <Animated.View style={[styles.previewIcon, pulseStyle]}>
            <Icon name="thunderstorm" size={56} color={colors.precipitation} />
          </Animated.View>
          <Text style={styles.previewTitle}>Simplified & Reliable</Text>
          <Text style={styles.previewDescription}>
            Streamlined radar with improved connection stability for {circuitName}
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
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Simplified Rainfall Radar</Text>
            <Text style={styles.subtitle}>{circuitName}</Text>
          </View>
          {alwaysVisible && (
            <View style={styles.alwaysOnBadge}>
              <Text style={styles.alwaysOnText}>Always On</Text>
            </View>
          )}
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

      {/* Status display */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor(connectionStatus) }]} />
          <Text style={styles.statusText}>{getConnectionStatusText(connectionStatus)}</Text>
        </View>
        
        {retryCount > 0 && (
          <Text style={styles.retryText}>
            Retry {retryCount}/{MAX_RETRY_ATTEMPTS}
          </Text>
        )}
        
        {totalFrames > 0 && connectionStatus === 'connected' && (
          <Text style={styles.frameText}>
            Frame {currentFrame + 1} of {totalFrames}
            {isAnimating && <Text style={styles.animatingText}> • Animating</Text>}
          </Text>
        )}
      </View>

      {isLoading && (
        <Animated.View style={[styles.loadingContainer, pulseStyle]}>
          <Animated.View style={loadingStyle}>
            <Icon name="cloud-download" size={40} color={colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>
            {connectionStatus === 'retrying' ? 'Reconnecting...' : 'Loading Radar'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {connectionStatus === 'retrying' 
              ? `Attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}` 
              : 'Simplified connection handling'
            }
          </Text>
        </Animated.View>
      )}

      {hasError && connectionStatus === 'error' && (
        <Animated.View style={[styles.errorContainer, errorShakeStyle]}>
          <Icon name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorSubtext}>
            {errorMessage || 'Unable to connect to radar services'}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
              <Icon name="refresh" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Retry Now</Text>
            </TouchableOpacity>
            {!alwaysVisible && (
              <TouchableOpacity onPress={toggleRadarView} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      <Animated.View style={[
        styles.webViewContainer, 
        { opacity: isLoading || hasError ? 0 : 1 }
      ]}>
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ html: generateRadarHTML() }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          scrollEnabled={true}
          bounces={false}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          onLoadStart={() => {
            console.log('RainfallRadar: WebView load started');
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            console.log('RainfallRadar: WebView load ended');
          }}
          onHttpError={(syntheticEvent) => {
            console.error('RainfallRadar: HTTP error:', syntheticEvent.nativeEvent);
            handleWebViewError(syntheticEvent);
          }}
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Simplified radar • Updates every {refreshInterval} minutes
          {lastUpdateTime && ` • Last: ${lastUpdateTime.toLocaleTimeString()}`}
        </Text>
        <Text style={styles.attribution}>
          Powered by RainViewer API
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
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  alwaysOnBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  alwaysOnText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
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
  animationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
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
  },
  statusContainer: {
    padding: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundAlt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  retryText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  frameText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  animatingText: {
    color: colors.primary,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    padding: 32,
  },
  previewIcon: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textMuted,
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
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    color: colors.error,
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
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
    textAlign: 'center',
    marginBottom: 4,
  },
  attribution: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    opacity: 0.7,
  },
});

// Helper functions
const getConnectionStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return '#00ff00';
    case 'connecting': return '#ffaa00';
    case 'retrying': return '#ff8800';
    case 'error': return '#ff0000';
    default: return colors.textMuted;
  }
};

const getConnectionStatusText = (status: string): string => {
  switch (status) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting';
    case 'retrying': return 'Retrying';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
};

export default RainfallRadar;
