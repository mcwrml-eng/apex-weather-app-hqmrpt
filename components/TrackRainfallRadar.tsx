
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
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

const { width: screenWidth } = Dimensions.get('window');

const TrackRainfallRadar: React.FC<Props> = ({ 
  latitude, 
  longitude, 
  circuitName,
  country,
  category,
  compact = true,
  showControls = true,
  autoStartAnimation = true,
  radarOpacity = 0.8
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  // Check if we're running on web
  const isWeb = Platform.OS === 'web';
  
  // Enhanced state management
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'retrying'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAYS = [2000, 4000, 8000];

  console.log('TrackRainfallRadar: Component initialized', { 
    latitude, 
    longitude, 
    circuitName,
    category,
    connectionStatus,
    retryCount,
    isWeb
  });

  // Enhanced retry mechanism
  const retryConnection = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log('TrackRainfallRadar: Max retry attempts reached');
      setConnectionStatus('error');
      setHasError(true);
      setErrorMessage('Connection Failed');
      setIsLoading(false);
      return;
    }

    const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    console.log(`TrackRainfallRadar: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
    
    setRetryCount(prev => prev + 1);
    setConnectionStatus('retrying');
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      console.log('TrackRainfallRadar: Executing retry');
      setWebViewKey(prev => prev + 1);
      setConnectionStatus('connecting');
      setIsWebViewReady(false);
    }, delay);
  }, [retryCount]);

  // Enhanced refresh function
  const refreshRadar = useCallback(() => {
    console.log('TrackRainfallRadar: Refreshing radar');
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
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
    setIsWebViewReady(false);
  }, []);

  // Toggle animation
  const toggleAnimation = useCallback(() => {
    console.log('TrackRainfallRadar: Toggle animation', { isWebViewReady, connectionStatus });
    if (webViewRef.current && isWebViewReady && connectionStatus === 'connected') {
      try {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'toggleAnimation'
        }));
      } catch (error) {
        console.error('TrackRainfallRadar: Failed to send toggle message:', error);
      }
    }
  }, [connectionStatus, isWebViewReady]);

  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Auto-start animation effect
  useEffect(() => {
    if (autoStartAnimation && totalFrames > 1 && !isAnimating && connectionStatus === 'connected' && isWebViewReady) {
      console.log('TrackRainfallRadar: Auto-starting animation');
      const timer = setTimeout(toggleAnimation, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoStartAnimation, totalFrames, isAnimating, connectionStatus, toggleAnimation, isWebViewReady]);

  // Animation values
  const pulseAnimation = useSharedValue(0);
  const loadingRotation = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const connectionPulse = useSharedValue(0);

  // Loading animation effect
  useEffect(() => {
    if (isLoading) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
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

  // Connection status animation
  useEffect(() => {
    if (connectionStatus === 'connected') {
      connectionPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.7, { duration: 800 })
        ),
        2,
        false
      );
    }
  }, [connectionStatus, connectionPulse]);

  // Error shake animation effect
  useEffect(() => {
    if (hasError) {
      errorShake.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 100 }),
          withTiming(4, { duration: 100 }),
          withTiming(-2, { duration: 100 }),
          withTiming(2, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        1,
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
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [0.99, 1.01]) }]
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }]
  }));

  const errorShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }]
  }));

  const connectionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(connectionPulse.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(connectionPulse.value, [0, 1], [1, 1.05]) }]
  }));

  // Get category color
  const getCategoryColor = useCallback(() => {
    switch (category) {
      case 'f1': return colors.f1Red || '#E10600';
      case 'motogp': return colors.motogpBlue || '#FF8C00';
      case 'indycar': return colors.indycarBlue || '#0066CC';
      default: return colors.primary;
    }
  }, [category, colors]);

  // Enhanced HTML generation
  const generateRadarHTML = useCallback(() => {
    console.log('TrackRainfallRadar: Generating radar HTML for platform:', Platform.OS);
    
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    const safeCountry = country.replace(/[<>"'&]/g, '');
    const safeOpacity = Math.max(0.1, Math.min(1, radarOpacity));
    const categoryColor = getCategoryColor();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Rainfall Radar - ${safeCircuitName}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { 
            box-sizing: border-box; 
            margin: 0; 
            padding: 0; 
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background};
            color: ${colors.text};
            overflow: hidden;
            height: 100vh;
            width: 100vw;
        }
        #map {
            height: 100vh;
            width: 100vw;
            position: relative;
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
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-top: 3px solid ${categoryColor};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
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
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            max-width: 280px;
            box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
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
            font-weight: 600;
            backdrop-filter: blur(8px);
        }
        .circuit-info {
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
            color: white;
            max-width: 200px;
            backdrop-filter: blur(8px);
        }
        .category-badge {
            background: ${categoryColor};
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
            display: inline-block;
        }
        .connection-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00ff00;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
        .retry-button {
            background: ${categoryColor};
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 12px;
            transition: all 0.2s;
        }
        .retry-button:hover {
            background: ${categoryColor}dd;
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div style="font-weight: 600; margin-bottom: 6px;">Loading Radar</div>
        <div style="font-size: 11px; opacity: 0.8;">${safeCircuitName}</div>
    </div>
    
    <div id="error" class="error" style="display: none;">
        <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px;">⚠️ Connection Failed</div>
        <div id="errorMessage" style="margin-bottom: 6px;">Unable to load radar data</div>
        <button class="retry-button" onclick="retryConnection()">🔄 Retry</button>
    </div>
    
    <div id="map"></div>
    <div id="status" class="status">🔄 Connecting...</div>
    <div id="connectionIndicator" class="connection-indicator" style="display: none; background: #ffaa00;"></div>
    
    <div class="circuit-info">
        <div class="category-badge">${category.toUpperCase()}</div>
        <div style="font-weight: bold; margin-bottom: 2px;">${safeCircuitName}</div>
        <div style="opacity: 0.8;">${safeCountry}</div>
        ${isWeb ? '<div style="color: #007acc; font-size: 10px; margin-top: 4px;"><em>🌐 Web Mode</em></div>' : ''}
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        console.log('TrackRainfallRadar: Starting radar initialization for ${safeCircuitName}');
        
        const isWebPlatform = ${isWeb};
        const webViewKey = ${webViewKey};
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let animationInterval = null;
        let isAnimating = false;
        let retryAttempts = 0;
        let maxRetries = 2;
        
        function updateStatus(text, color = '#ffffff') {
            const status = document.getElementById('status');
            const indicator = document.getElementById('connectionIndicator');
            if (status) {
                status.textContent = text;
                status.style.color = color;
            }
            if (indicator) {
                indicator.style.display = 'block';
                indicator.style.background = color === '#00ff00' ? '#00ff00' : 
                                           color === '#ffaa00' ? '#ffaa00' : '#ff0000';
            }
        }
        
        function showError(message) {
            console.error('TrackRainfallRadar: Error -', message);
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const errorMessage = document.getElementById('errorMessage');
            
            if (loading) loading.style.display = 'none';
            if (error) {
                error.style.display = 'block';
                if (errorMessage) errorMessage.textContent = message;
            }
            updateStatus('❌ Error', '#ff0000');
            
            sendMessage({
                type: 'error',
                message: message,
                retryAttempts: retryAttempts,
                webViewKey: webViewKey
            });
        }
        
        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
        
        function sendMessage(data) {
            try {
                const messageData = {
                    ...data,
                    timestamp: Date.now(),
                    platform: isWebPlatform ? 'web' : 'native',
                    webViewKey: webViewKey
                };
                
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(messageData));
                } else if (isWebPlatform && window.parent && window.parent !== window) {
                    window.parent.postMessage(messageData, '*');
                } else {
                    console.log('TrackRainfallRadar Web Message:', messageData);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
        
        function retryConnection() {
            if (retryAttempts >= maxRetries) {
                showError('Max retries exceeded');
                return;
            }
            
            retryAttempts++;
            console.log('TrackRainfallRadar: Retrying connection, attempt', retryAttempts);
            
            const error = document.getElementById('error');
            if (error) error.style.display = 'none';
            
            updateStatus('🔄 Retrying...', '#ffaa00');
            
            setTimeout(() => {
                initMap();
            }, 1000);
        }
        
        async function initMap() {
            try {
                console.log('TrackRainfallRadar: Initializing map for ${safeCircuitName}');
                updateStatus('🔄 Initializing...', '#ffaa00');
                
                const lat = parseFloat(${latitude});
                const lng = parseFloat(${longitude});
                
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinates provided');
                }
                
                // Clear existing map if any
                if (map) {
                    map.remove();
                    map = null;
                }
                
                map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true,
                    dragging: true,
                    maxZoom: 10,
                    minZoom: 5,
                    preferCanvas: true
                }).setView([lat, lng], ${compact ? '6' : '7'});
                
                console.log('TrackRainfallRadar: Map created, loading tiles');
                
                // Enhanced tile layer
                const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 10,
                    crossOrigin: true,
                    attribution: '© OpenStreetMap',
                    timeout: 8000
                });
                
                tileLayer.on('load', () => {
                    console.log('TrackRainfallRadar: Base tiles loaded');
                    updateStatus('🌦️ Loading radar...', '#ffaa00');
                });
                
                tileLayer.addTo(map);
                
                // Circuit marker with category styling
                const marker = L.marker([lat, lng], {
                    title: '${safeCircuitName}'
                }).addTo(map);
                
                marker.bindPopup(\`
                    <div style="text-align: center; padding: 6px;">
                        <div style="background: ${categoryColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 6px;">${category.toUpperCase()}</div>
                        <div style="font-weight: bold; font-size: 13px; margin-bottom: 3px;">${safeCircuitName}</div>
                        <div style="color: #666; font-size: 11px;">${safeCountry}</div>
                        <div style="color: #888; font-size: 10px; margin-top: 3px;">
                            \${lat.toFixed(3)}, \${lng.toFixed(3)}
                        </div>
                    </div>
                \`, {
                    maxWidth: 180,
                    className: 'custom-popup'
                });
                
                // Send ready message
                sendMessage({
                    type: 'webViewReady',
                    mapInitialized: true
                });
                
                // Load radar data
                setTimeout(() => {
                    loadRadarData();
                }, 300);
                
            } catch (error) {
                console.error('Map initialization failed:', error);
                showError('Map initialization failed');
            }
        }
        
        async function loadRadarData() {
            try {
                console.log('TrackRainfallRadar: Loading radar data');
                updateStatus('📡 Loading radar...', '#ffaa00');
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, 12000);
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                    method: 'GET',
                    headers: { 
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    },
                    signal: controller.signal,
                    mode: 'cors'
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }
                
                const data = await response.json();
                console.log('TrackRainfallRadar: API response received');
                
                if (data && data.radar && data.radar.past) {
                    radarData = [...(data.radar.past || []), ...(data.radar.nowcast || [])];
                    
                    if (radarData.length > 0) {
                        console.log('TrackRainfallRadar: Loaded', radarData.length, 'radar frames');
                        currentFrame = Math.max(0, radarData.length - 1);
                        
                        hideLoading();
                        updateStatus(\`✅ Live (\${radarData.length})\`, '#00ff00');
                        
                        sendMessage({
                            type: 'connected',
                            totalFrames: radarData.length,
                            currentFrame: currentFrame
                        });
                        
                        showRadarFrame(currentFrame);
                        
                        // Auto-start animation
                        setTimeout(() => {
                            if (radarData.length > 1) {
                                sendMessage({ type: 'readyForAnimation' });
                            }
                        }, 1000);
                        
                    } else {
                        throw new Error('No radar data available');
                    }
                } else {
                    throw new Error('Invalid API response');
                }
            } catch (error) {
                console.error('Failed to load radar data:', error);
                let errorMsg = 'Failed to load radar data';
                
                if (error.name === 'AbortError') {
                    errorMsg = 'Connection timeout';
                } else if (error.message.includes('HTTP')) {
                    errorMsg = 'Server error';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMsg = 'Network error';
                }
                
                showError(errorMsg);
            }
        }
        
        function showRadarFrame(frameIndex) {
            try {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) {
                    return;
                }
                
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                    radarLayer = null;
                }
                
                const frame = radarData[frameIndex];
                if (!frame || !frame.path) {
                    return;
                }
                
                const radarUrl = \`https://tilecache.rainviewer.com/v2/radar/\${frame.path}/256/{z}/{x}/{y}/2/1_1.png\`;
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: ${safeOpacity},
                    crossOrigin: true,
                    timeout: 6000,
                    maxZoom: 10
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
                
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length
                });
                
            } catch (error) {
                console.error('Failed to show radar frame:', error);
            }
        }
        
        function startAnimation() {
            if (isAnimating || radarData.length <= 1) return;
            
            console.log('TrackRainfallRadar: Starting animation');
            isAnimating = true;
            updateStatus(\`🎬 Animating (\${radarData.length})\`, '#00ff00');
            
            sendMessage({
                type: 'animationStarted',
                totalFrames: radarData.length
            });
            
            animationInterval = setInterval(() => {
                currentFrame = (currentFrame + 1) % radarData.length;
                showRadarFrame(currentFrame);
            }, 500);
        }
        
        function stopAnimation() {
            if (!isAnimating) return;
            
            console.log('TrackRainfallRadar: Stopping animation');
            isAnimating = false;
            updateStatus(\`✅ Live (\${radarData.length})\`, '#00ff00');
            
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
            
            sendMessage({
                type: 'animationStopped',
                currentFrame: currentFrame
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
        function handleMessage(event) {
            try {
                let message;
                if (typeof event.data === 'string') {
                    message = JSON.parse(event.data);
                } else {
                    message = event.data;
                }
                
                console.log('TrackRainfallRadar: Received message:', message);
                
                switch (message.type) {
                    case 'toggleAnimation':
                        toggleAnimation();
                        break;
                    case 'refresh':
                        location.reload();
                        break;
                }
            } catch (error) {
                console.log('Non-JSON message received:', event.data);
            }
        }
        
        if (window.addEventListener) {
            window.addEventListener('message', handleMessage);
        }
        
        // Initialize when DOM is ready
        function initializeRadar() {
            console.log('TrackRainfallRadar: DOM ready, initializing');
            initMap();
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeRadar);
        } else {
            initializeRadar();
        }
        
        // Error handling
        window.addEventListener('error', function(event) {
            console.error('Global JavaScript error:', event.error);
            showError('Script error');
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            showError('Network error');
        });
        
    </script>
</body>
</html>`;
  }, [latitude, longitude, circuitName, country, category, radarOpacity, isWeb, colors, webViewKey, compact, getCategoryColor]);

  // Enhanced WebView event handlers
  const handleWebViewLoad = useCallback(() => {
    console.log('TrackRainfallRadar: WebView loaded successfully');
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const error = syntheticEvent.nativeEvent;
    console.error('TrackRainfallRadar: WebView error:', error);
    
    setIsLoading(false);
    setHasError(true);
    setConnectionStatus('error');
    setErrorMessage('WebView Error');
    
    // Auto-retry for certain types of errors
    if (error.description?.includes('NETWORK_CHANGED') || error.description?.includes('TIMED_OUT')) {
      setTimeout(() => {
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          retryConnection();
        }
      }, 2000);
    }
  }, [retryConnection, retryCount]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('TrackRainfallRadar: Message from WebView:', message.type);
      
      switch (message.type) {
        case 'webViewReady':
          setIsWebViewReady(true);
          break;
          
        case 'connected':
          setConnectionStatus('connected');
          setIsLoading(false);
          setHasError(false);
          setTotalFrames(message.totalFrames || 0);
          setCurrentFrame(message.currentFrame || 0);
          setLastUpdateTime(new Date());
          setRetryCount(0);
          setErrorMessage('');
          break;
          
        case 'error':
          setConnectionStatus('error');
          setIsLoading(false);
          setHasError(true);
          setErrorMessage(message.message || 'Unknown error');
          
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            setTimeout(() => {
              retryConnection();
            }, 1500);
          }
          break;
          
        case 'frameChanged':
          setCurrentFrame(message.currentFrame || 0);
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
  }, [retryConnection, retryCount]);

  // Create styles with theme colors
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: compact ? 12 : 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: '0 6px 24px rgba(16,24,40,0.08)',
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
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginRight: 8,
    },
    categoryText: {
      fontSize: 10,
      color: getCategoryColor(),
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    titleTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: compact ? 15 : 17,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: compact ? 11 : 13,
      color: colors.textMuted,
      marginTop: 1,
    },
    controls: {
      flexDirection: 'row',
      gap: 6,
    },
    controlButton: {
      padding: compact ? 6 : 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    animationButton: {
      padding: compact ? 6 : 8,
      borderRadius: 8,
      backgroundColor: getCategoryColor(),
    },
    expandButton: {
      padding: compact ? 6 : 8,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    statusContainer: {
      padding: compact ? 10 : 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      fontSize: compact ? 11 : 12,
      color: colors.text,
      fontWeight: '600',
    },
    frameText: {
      fontSize: compact ? 10 : 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    webViewContainer: {
      height: compact ? (isExpanded ? 300 : 200) : (isExpanded ? 400 : 280),
      position: 'relative',
    },
    webView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      height: compact ? 200 : 280,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
    },
    loadingText: {
      fontSize: compact ? 14 : 16,
      color: colors.text,
      marginTop: 16,
      fontWeight: '600',
    },
    loadingSubtext: {
      fontSize: compact ? 11 : 12,
      color: colors.textMuted,
      marginTop: 4,
      textAlign: 'center',
      maxWidth: 200,
    },
    errorContainer: {
      height: compact ? 200 : 280,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: 20,
    },
    errorTitle: {
      fontSize: compact ? 16 : 18,
      color: colors.error,
      marginTop: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    errorText: {
      fontSize: compact ? 12 : 13,
      color: colors.textMuted,
      marginTop: 8,
      marginBottom: 16,
      textAlign: 'center',
      lineHeight: 18,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: getCategoryColor(),
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: compact ? 12 : 13,
      fontWeight: '600',
    },
    footer: {
      padding: compact ? 8 : 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
    },
    footerText: {
      fontSize: compact ? 10 : 11,
      color: colors.textMuted,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  // Enhanced prop validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.error('TrackRainfallRadar: Invalid coordinates:', { latitude, longitude });
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="warning" size={18} color={colors.error} />
            <Text style={styles.title}>Invalid Location</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="location-off" size={40} color={colors.error} />
          <Text style={styles.errorTitle}>Location Error</Text>
          <Text style={styles.errorText}>
            Cannot display radar for this circuit.
          </Text>
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
          <Icon name="rainy" size={compact ? 18 : 20} color={colors.precipitation} />
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>{circuitName}</Text>
            <Text style={styles.subtitle}>
              {country} • Live Radar
              {isWeb && ' • Web Mode'}
            </Text>
          </View>
        </View>
        {showControls && (
          <View style={styles.controls}>
            {totalFrames > 1 && connectionStatus === 'connected' && isWebViewReady && (
              <TouchableOpacity onPress={toggleAnimation} style={styles.animationButton}>
                <Icon 
                  name={isAnimating ? "pause" : "play"} 
                  size={compact ? 12 : 14} 
                  color="#fff" 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={refreshRadar} style={styles.controlButton}>
              <Animated.View style={loadingStyle}>
                <Icon name="refresh" size={compact ? 12 : 14} color={colors.text} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleExpanded} style={styles.expandButton}>
              <Icon 
                name={isExpanded ? "contract" : "expand"} 
                size={compact ? 12 : 14} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status display */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <Animated.View style={[
            styles.statusDot, 
            { backgroundColor: getConnectionStatusColor(connectionStatus) },
            connectionStatus === 'connected' ? connectionStyle : {}
          ]} />
          <Text style={styles.statusText}>
            {getConnectionStatusText(connectionStatus)}
            {isWeb && connectionStatus === 'connected' && ' (Web)'}
          </Text>
        </View>
        
        {totalFrames > 0 && connectionStatus === 'connected' && (
          <Text style={styles.frameText}>
            {currentFrame + 1}/{totalFrames}
            {isAnimating && ' • Playing'}
          </Text>
        )}
      </View>

      {isLoading && (
        <Animated.View style={[styles.loadingContainer, pulseStyle]}>
          <Animated.View style={loadingStyle}>
            <Icon name="cloud-download" size={compact ? 32 : 40} color={getCategoryColor()} />
          </Animated.View>
          <Text style={styles.loadingText}>
            {connectionStatus === 'retrying' ? 'Reconnecting...' : 'Loading Radar'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {connectionStatus === 'retrying' 
              ? `Attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}` 
              : isWeb 
                ? 'Web preview mode'
                : 'Live weather radar'
            }
          </Text>
        </Animated.View>
      )}

      {hasError && connectionStatus === 'error' && (
        <Animated.View style={[styles.errorContainer, errorShakeStyle]}>
          <Icon name="cloud-offline" size={compact ? 32 : 40} color={colors.error} />
          <Text style={styles.errorTitle}>{errorMessage || 'Connection Failed'}</Text>
          <Text style={styles.errorText}>
            {retryCount >= MAX_RETRY_ATTEMPTS 
              ? 'Max retries exceeded. Please check your connection.' 
              : 'Temporary connection issue. Retrying...'
            }
          </Text>
          <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
            <Icon name="refresh" size={compact ? 12 : 14} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => {
            setIsLoading(true);
            setIsWebViewReady(false);
          }}
          onLoadEnd={() => {
            console.log('TrackRainfallRadar: WebView load ended');
          }}
          onHttpError={(syntheticEvent) => {
            console.error('TrackRainfallRadar: HTTP error:', syntheticEvent.nativeEvent);
            handleWebViewError(syntheticEvent);
          }}
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Live radar • Updates every 10 minutes
          {lastUpdateTime && ` • ${lastUpdateTime.toLocaleTimeString()}`}
          {isWeb && ' • Web Preview'}
        </Text>
      </View>
    </View>
  );
};

// Helper functions
const getConnectionStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return '#10B981';
    case 'connecting': return '#F59E0B';
    case 'retrying': return '#F97316';
    case 'error': return '#DC2626';
    default: return '#6B7280';
  }
};

const getConnectionStatusText = (status: string): string => {
  switch (status) {
    case 'connected': return 'Live';
    case 'connecting': return 'Connecting';
    case 'retrying': return 'Retrying';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
};

export default TrackRainfallRadar;
