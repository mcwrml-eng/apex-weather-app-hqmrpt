
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
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  // Check if we're running on web
  const isWeb = Platform.OS === 'web';
  
  // Enhanced state management
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [showRadar, setShowRadar] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'retrying' | 'timeout'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [connectionStartTime, setConnectionStartTime] = useState<Date>(new Date());
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RETRY_ATTEMPTS = 5;
  const RETRY_DELAYS = [1000, 2000, 4000, 8000, 15000];
  const CONNECTION_TIMEOUT = isWeb ? 20000 : 15000; // Longer timeout for web
  const WEBVIEW_READY_TIMEOUT = 5000;

  console.log('RainfallRadar: Component initialized', { 
    latitude, 
    longitude, 
    circuitName, 
    connectionStatus,
    retryCount,
    isWeb,
    platform: Platform.OS,
    isDark,
    webViewKey
  });

  // Enhanced retry mechanism with exponential backoff
  const retryConnection = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log('RainfallRadar: Max retry attempts reached');
      setConnectionStatus('error');
      setHasError(true);
      setErrorMessage('Connection Failed');
      setErrorDetails(`Unable to connect after ${MAX_RETRY_ATTEMPTS} attempts. Please check your internet connection and try again.`);
      setIsLoading(false);
      return;
    }

    const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    console.log(`RainfallRadar: Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
    
    setRetryCount(prev => prev + 1);
    setConnectionStatus('retrying');
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    setErrorDetails('');

    // Clear existing timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      console.log('RainfallRadar: Executing retry');
      setWebViewKey(prev => prev + 1);
      setConnectionStatus('connecting');
      setConnectionStartTime(new Date());
      setIsWebViewReady(false);
    }, delay);
  }, [retryCount, isWeb]);

  // Enhanced refresh function
  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Refreshing radar');
    
    // Clear all timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
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
    setErrorDetails('');
    setLastUpdateTime(null);
    setConnectionStartTime(new Date());
    setIsWebViewReady(false);
  }, []);

  // Enhanced toggle animation
  const toggleAnimation = useCallback(() => {
    console.log('RainfallRadar: Toggle animation', { isWebViewReady, connectionStatus });
    if (webViewRef.current && isWebViewReady && connectionStatus === 'connected') {
      try {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'toggleAnimation'
        }));
      } catch (error) {
        console.error('RainfallRadar: Failed to send toggle message:', error);
      }
    }
  }, [connectionStatus, isWebViewReady]);

  // Connection timeout effect
  useEffect(() => {
    if (connectionStatus === 'connecting') {
      connectionTimeoutRef.current = setTimeout(() => {
        console.log('RainfallRadar: Connection timeout');
        setConnectionStatus('timeout');
        setHasError(true);
        setErrorMessage('Connection Timeout');
        setErrorDetails(`Failed to connect within ${CONNECTION_TIMEOUT / 1000} seconds. This may be due to network issues or server unavailability.`);
        setIsLoading(false);
        
        // Auto-retry on timeout
        setTimeout(() => {
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            retryConnection();
          }
        }, 2000);
      }, CONNECTION_TIMEOUT);
    } else {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    }

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [connectionStatus, retryConnection, retryCount]);

  // Auto-start animation effect
  useEffect(() => {
    if (autoStartAnimation && totalFrames > 1 && !isAnimating && connectionStatus === 'connected' && isWebViewReady) {
      console.log('RainfallRadar: Auto-starting animation');
      const timer = setTimeout(toggleAnimation, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoStartAnimation, totalFrames, isAnimating, connectionStatus, toggleAnimation, isWebViewReady]);

  // Auto-refresh effect
  useEffect(() => {
    if (!showRadar || connectionStatus === 'error' || connectionStatus === 'timeout') return;
    
    const refreshTimer = setInterval(() => {
      console.log('RainfallRadar: Auto-refreshing');
      refreshRadar();
    }, refreshInterval * 60 * 1000);
    
    return () => clearInterval(refreshTimer);
  }, [showRadar, connectionStatus, refreshInterval, refreshRadar]);

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
        3,
        false
      );
    }
  }, [connectionStatus, connectionPulse]);

  // Error shake animation effect
  useEffect(() => {
    if (hasError) {
      errorShake.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 100 }),
          withTiming(8, { duration: 100 }),
          withTiming(-4, { duration: 100 }),
          withTiming(4, { duration: 100 }),
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
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [0.98, 1.02]) }]
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }]
  }));

  const errorShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }]
  }));

  const connectionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(connectionPulse.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(connectionPulse.value, [0, 1], [1, 1.1]) }]
  }));

  // Enhanced HTML generation with better error handling and web compatibility
  const generateRadarHTML = useCallback(() => {
    console.log('RainfallRadar: Generating radar HTML for platform:', Platform.OS);
    
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
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-top: 4px solid ${colors.primary};
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
            margin: 0 auto 16px;
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
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            max-width: 300px;
            box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
        }
        .status {
            position: absolute;
            top: 12px;
            left: 12px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 13px;
            color: white;
            font-weight: 600;
            backdrop-filter: blur(10px);
        }
        .web-notice {
            position: absolute;
            bottom: 12px;
            right: 12px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 11px;
            color: white;
            max-width: 220px;
            backdrop-filter: blur(10px);
        }
        .connection-indicator {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 1000;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #00ff00;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
        }
        .retry-button {
            background: ${colors.primary};
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 16px;
            transition: all 0.2s;
        }
        .retry-button:hover {
            background: ${colors.primary}dd;
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div style="font-weight: 600; margin-bottom: 8px;">Loading Radar</div>
        <div style="font-size: 12px; opacity: 0.8;">Connecting to weather services...</div>
    </div>
    
    <div id="error" class="error" style="display: none;">
        <div style="font-weight: bold; margin-bottom: 12px; font-size: 16px;">⚠️ Connection Failed</div>
        <div id="errorMessage" style="margin-bottom: 8px;">Unable to load radar data</div>
        <div id="errorDetails" style="font-size: 12px; opacity: 0.9;"></div>
        <button class="retry-button" onclick="retryConnection()">🔄 Retry Connection</button>
    </div>
    
    <div id="map"></div>
    <div id="status" class="status">🔄 Connecting...</div>
    <div id="connectionIndicator" class="connection-indicator" style="display: none; background: #ffaa00;"></div>
    
    ${isWeb ? `
    <div class="web-notice">
        🌐 <strong>Web Preview Mode</strong><br>
        Enhanced compatibility for web browsers<br>
        <small>Full features available on mobile app</small>
    </div>
    ` : ''}

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        console.log('RainfallRadar: Starting radar initialization for platform: ${Platform.OS}');
        
        const isWebPlatform = ${isWeb};
        const webViewKey = ${webViewKey};
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let animationInterval = null;
        let isAnimating = false;
        let connectionStartTime = Date.now();
        let retryAttempts = 0;
        let maxRetries = 3;
        
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
        
        function showError(message, details = '') {
            console.error('RainfallRadar: Error -', message, details);
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const errorMessage = document.getElementById('errorMessage');
            const errorDetails = document.getElementById('errorDetails');
            
            if (loading) loading.style.display = 'none';
            if (error) {
                error.style.display = 'block';
                if (errorMessage) errorMessage.textContent = message;
                if (errorDetails) errorDetails.textContent = details;
            }
            updateStatus('❌ Error', '#ff0000');
            
            sendMessage({
                type: 'error',
                message: message,
                details: details,
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
                    console.log('RainfallRadar Web Message:', messageData);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
        
        function retryConnection() {
            if (retryAttempts >= maxRetries) {
                showError('Max retries exceeded', 'Please check your internet connection and refresh the page.');
                return;
            }
            
            retryAttempts++;
            console.log('RainfallRadar: Retrying connection, attempt', retryAttempts);
            
            const error = document.getElementById('error');
            if (error) error.style.display = 'none';
            
            updateStatus('🔄 Retrying...', '#ffaa00');
            
            setTimeout(() => {
                initMap();
            }, 1000 * retryAttempts);
        }
        
        async function initMap() {
            try {
                console.log('RainfallRadar: Initializing map, attempt', retryAttempts + 1);
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
                    zoomControl: true,
                    attributionControl: false,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true,
                    dragging: true,
                    maxZoom: 12,
                    minZoom: 4,
                    preferCanvas: true
                }).setView([lat, lng], 7);
                
                console.log('RainfallRadar: Map created, loading tiles');
                
                // Enhanced tile layer with better error handling
                const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 12,
                    crossOrigin: true,
                    attribution: '© OpenStreetMap',
                    errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    timeout: 10000
                });
                
                let tilesLoaded = 0;
                let tilesTotal = 0;
                
                tileLayer.on('loading', () => {
                    console.log('RainfallRadar: Base tiles loading');
                    updateStatus('🗺️ Loading map...', '#ffaa00');
                });
                
                tileLayer.on('load', () => {
                    console.log('RainfallRadar: Base tiles loaded');
                    updateStatus('🌦️ Loading radar...', '#ffaa00');
                });
                
                tileLayer.on('tileerror', (e) => {
                    console.warn('RainfallRadar: Tile load error:', e);
                });
                
                tileLayer.addTo(map);
                
                // Enhanced circuit marker
                const marker = L.marker([lat, lng], {
                    title: '${safeCircuitName}'
                }).addTo(map);
                
                marker.bindPopup(\`
                    <div style="text-align: center; padding: 8px;">
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${safeCircuitName}</div>
                        <div style="color: #666; font-size: 12px;">Racing Circuit</div>
                        <div style="color: #888; font-size: 11px; margin-top: 4px;">
                            \${lat.toFixed(4)}, \${lng.toFixed(4)}
                        </div>
                        \${isWebPlatform ? '<div style="color: #007acc; font-size: 11px; margin-top: 4px;"><em>🌐 Web Preview Mode</em></div>' : ''}
                    </div>
                \`, {
                    maxWidth: 200,
                    className: 'custom-popup'
                });
                
                // Send ready message
                sendMessage({
                    type: 'webViewReady',
                    mapInitialized: true
                });
                
                // Load radar data with delay to ensure map is ready
                setTimeout(() => {
                    loadRadarData();
                }, 500);
                
            } catch (error) {
                console.error('Map initialization failed:', error);
                showError('Map initialization failed', error.message);
            }
        }
        
        async function loadRadarData() {
            try {
                console.log('RainfallRadar: Loading radar data');
                updateStatus('📡 Loading radar data...', '#ffaa00');
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, isWebPlatform ? 20000 : 15000);
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                    method: 'GET',
                    headers: { 
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'User-Agent': isWebPlatform ? 'Mozilla/5.0 (Web Radar)' : 'Mobile Radar App'
                    },
                    signal: controller.signal,
                    mode: 'cors'
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                console.log('RainfallRadar: API response received', data);
                
                if (data && data.radar && data.radar.past) {
                    radarData = [...(data.radar.past || []), ...(data.radar.nowcast || [])];
                    
                    if (radarData.length > 0) {
                        console.log('RainfallRadar: Loaded', radarData.length, 'radar frames');
                        currentFrame = Math.max(0, radarData.length - 1);
                        
                        hideLoading();
                        updateStatus(\`✅ Connected (\${radarData.length} frames)\`, '#00ff00');
                        
                        sendMessage({
                            type: 'connected',
                            totalFrames: radarData.length,
                            currentFrame: currentFrame,
                            platform: isWebPlatform ? 'web' : 'native',
                            connectionTime: Date.now() - connectionStartTime
                        });
                        
                        showRadarFrame(currentFrame);
                        
                        // Auto-start animation after a delay
                        setTimeout(() => {
                            if (radarData.length > 1) {
                                sendMessage({ type: 'readyForAnimation' });
                            }
                        }, 1500);
                        
                    } else {
                        throw new Error('No radar data available for this region');
                    }
                } else {
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.error('Failed to load radar data:', error);
                let errorMsg = 'Failed to load radar data';
                let errorDetail = '';
                
                if (error.name === 'AbortError') {
                    errorMsg = 'Connection timeout';
                    errorDetail = 'The request took too long to complete. Please check your internet connection.';
                } else if (error.message.includes('HTTP')) {
                    errorMsg = 'Server error';
                    errorDetail = error.message;
                } else if (error.message.includes('Failed to fetch')) {
                    errorMsg = 'Network error';
                    errorDetail = 'Unable to reach weather services. Please check your internet connection.';
                } else {
                    errorDetail = error.message;
                }
                
                showError(errorMsg, errorDetail);
            }
        }
        
        function showRadarFrame(frameIndex) {
            try {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) {
                    console.warn('Invalid frame index or map not ready:', frameIndex);
                    return;
                }
                
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                    radarLayer = null;
                }
                
                const frame = radarData[frameIndex];
                if (!frame || !frame.path) {
                    console.warn('Invalid frame data:', frame);
                    return;
                }
                
                const radarUrl = \`https://tilecache.rainviewer.com/v2/radar/\${frame.path}/256/{z}/{x}/{y}/2/1_1.png\`;
                console.log('RainfallRadar: Loading frame', frameIndex, 'from', radarUrl);
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: ${safeOpacity},
                    crossOrigin: true,
                    errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    timeout: 8000,
                    maxZoom: 12
                });
                
                radarLayer.on('loading', () => {
                    console.log('RainfallRadar: Radar tiles loading for frame', frameIndex);
                });
                
                radarLayer.on('load', () => {
                    console.log('RainfallRadar: Radar tiles loaded for frame', frameIndex);
                });
                
                radarLayer.on('tileerror', (e) => {
                    console.warn('RainfallRadar: Radar tile error for frame', frameIndex, ':', e);
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
                
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length,
                    frameTime: frame.time || 'unknown'
                });
                
            } catch (error) {
                console.error('Failed to show radar frame:', error);
            }
        }
        
        function startAnimation() {
            if (isAnimating || radarData.length <= 1) {
                console.log('Animation already running or insufficient frames');
                return;
            }
            
            console.log('RainfallRadar: Starting animation');
            isAnimating = true;
            updateStatus(\`🎬 Animating (\${radarData.length} frames)\`, '#00ff00');
            
            sendMessage({
                type: 'animationStarted',
                totalFrames: radarData.length
            });
            
            animationInterval = setInterval(() => {
                currentFrame = (currentFrame + 1) % radarData.length;
                showRadarFrame(currentFrame);
            }, 600);
        }
        
        function stopAnimation() {
            if (!isAnimating) return;
            
            console.log('RainfallRadar: Stopping animation');
            isAnimating = false;
            updateStatus(\`✅ Connected (\${radarData.length} frames)\`, '#00ff00');
            
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
            console.log('RainfallRadar: Toggle animation requested, current state:', isAnimating);
            if (isAnimating) {
                stopAnimation();
            } else {
                startAnimation();
            }
        }
        
        // Enhanced message handling
        function handleMessage(event) {
            try {
                let message;
                if (typeof event.data === 'string') {
                    message = JSON.parse(event.data);
                } else {
                    message = event.data;
                }
                
                console.log('RainfallRadar: Received message:', message);
                
                switch (message.type) {
                    case 'toggleAnimation':
                        toggleAnimation();
                        break;
                    case 'refresh':
                        location.reload();
                        break;
                    case 'showFrame':
                        if (message.frameIndex !== undefined) {
                            showRadarFrame(message.frameIndex);
                        }
                        break;
                }
            } catch (error) {
                console.log('Non-JSON message received:', event.data);
            }
        }
        
        // Message handling for both native and web
        if (window.addEventListener) {
            window.addEventListener('message', handleMessage);
        }
        if (document.addEventListener) {
            document.addEventListener('message', handleMessage);
        }
        
        // Initialize when DOM is ready
        function initializeRadar() {
            console.log('RainfallRadar: DOM ready, initializing for platform:', isWebPlatform ? 'web' : 'native');
            connectionStartTime = Date.now();
            initMap();
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeRadar);
        } else {
            initializeRadar();
        }
        
        // Enhanced error handling
        window.addEventListener('error', function(event) {
            console.error('Global JavaScript error:', event.error);
            showError('Script error', event.error?.message || 'An unexpected error occurred');
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled promise rejection:', event.reason);
            showError('Network error', event.reason?.message || 'Connection failed');
        });
        
        // Heartbeat to detect if WebView is still responsive
        setInterval(() => {
            sendMessage({
                type: 'heartbeat',
                timestamp: Date.now(),
                isAnimating: isAnimating,
                currentFrame: currentFrame,
                totalFrames: radarData.length
            });
        }, 30000);
        
    </script>
</body>
</html>`;
  }, [latitude, longitude, circuitName, radarOpacity, isWeb, colors, webViewKey]);

  // Enhanced WebView event handlers
  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: WebView loaded successfully');
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const error = syntheticEvent.nativeEvent;
    console.error('RainfallRadar: WebView error:', error);
    
    setIsLoading(false);
    setHasError(true);
    setConnectionStatus('error');
    
    let errorMsg = 'WebView Error';
    let errorDetail = error.description || 'Unknown WebView error occurred';
    
    if (error.description?.includes('net::ERR_INTERNET_DISCONNECTED')) {
      errorMsg = 'No Internet Connection';
      errorDetail = 'Please check your internet connection and try again.';
    } else if (error.description?.includes('net::ERR_NETWORK_CHANGED')) {
      errorMsg = 'Network Changed';
      errorDetail = 'Your network connection changed. Retrying...';
    } else if (error.description?.includes('net::ERR_TIMED_OUT')) {
      errorMsg = 'Connection Timeout';
      errorDetail = 'The connection timed out. Please try again.';
    }
    
    setErrorMessage(errorMsg);
    setErrorDetails(errorDetail);
    
    // Auto-retry for certain types of errors
    if (error.description?.includes('NETWORK_CHANGED') || error.description?.includes('TIMED_OUT')) {
      setTimeout(() => {
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          retryConnection();
        }
      }, 3000);
    }
  }, [retryConnection, retryCount]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Message from WebView:', message.type, message);
      
      switch (message.type) {
        case 'webViewReady':
          setIsWebViewReady(true);
          console.log('RainfallRadar: WebView is ready for interaction');
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
          setErrorDetails('');
          console.log('RainfallRadar: Successfully connected with', message.totalFrames, 'frames');
          break;
          
        case 'error':
          setConnectionStatus('error');
          setIsLoading(false);
          setHasError(true);
          setErrorMessage(message.message || 'Unknown error');
          setErrorDetails(message.details || '');
          console.error('RainfallRadar: Error from WebView:', message.message, message.details);
          
          // Auto-retry if we haven't exceeded max attempts
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            setTimeout(() => {
              retryConnection();
            }, 2000);
          }
          break;
          
        case 'frameChanged':
          setCurrentFrame(message.currentFrame || 0);
          break;
          
        case 'animationStarted':
          setIsAnimating(true);
          console.log('RainfallRadar: Animation started');
          break;
          
        case 'animationStopped':
          setIsAnimating(false);
          console.log('RainfallRadar: Animation stopped');
          break;
          
        case 'readyForAnimation':
          console.log('RainfallRadar: WebView ready for animation');
          break;
          
        case 'heartbeat':
          // WebView is responsive
          console.log('RainfallRadar: Heartbeat received');
          break;
          
        default:
          console.log('RainfallRadar: Unknown message type:', message.type);
      }
    } catch (error) {
      console.log('RainfallRadar: Non-JSON message received:', event.nativeEvent.data);
    }
  }, [retryConnection, retryCount]);

  const toggleRadarView = useCallback(() => {
    console.log('RainfallRadar: Toggling radar view');
    if (!alwaysVisible) {
      setShowRadar(!showRadar);
      if (!showRadar) {
        refreshRadar();
      }
    }
  }, [showRadar, alwaysVisible, refreshRadar]);

  // Create styles with theme colors
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: '0 8px 32px rgba(16,24,40,0.08)',
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
    titleTextContainer: {
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
    alwaysOnBadge: {
      backgroundColor: colors.accent + '25',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    alwaysOnText: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '700',
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
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    statusText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '700',
    },
    retryText: {
      fontSize: 12,
      color: colors.warning,
      fontWeight: '600',
    },
    frameText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    animatingText: {
      color: colors.primary,
      fontWeight: '700',
    },
    previewContainer: {
      alignItems: 'center',
      padding: 40,
    },
    previewIcon: {
      marginBottom: 20,
    },
    previewTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    previewDescription: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    webViewContainer: {
      height: 420,
      position: 'relative',
    },
    webView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      height: 420,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
    },
    loadingText: {
      fontSize: 17,
      color: colors.text,
      marginTop: 20,
      fontWeight: '700',
    },
    loadingSubtext: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 6,
      textAlign: 'center',
      maxWidth: 280,
    },
    errorContainer: {
      height: 420,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      padding: 24,
    },
    errorTitle: {
      fontSize: 20,
      color: colors.error,
      marginTop: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      marginTop: 10,
      textAlign: 'center',
      fontWeight: '600',
    },
    errorSubtext: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 10,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 300,
    },
    errorActions: {
      flexDirection: 'row',
      gap: 12,
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
    cancelButton: {
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    cancelText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
    footer: {
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.backgroundAlt,
    },
    footerText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 4,
      fontWeight: '500',
    },
    attribution: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      opacity: 0.7,
    },
  });

  // Enhanced prop validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.error('RainfallRadar: Invalid coordinates:', { latitude, longitude });
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="warning" size={22} color={colors.error} />
            <Text style={styles.title}>Rainfall Radar Error</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="location-off" size={56} color={colors.error} />
          <Text style={styles.errorTitle}>Invalid Location Data</Text>
          <Text style={styles.errorSubtext}>
            Cannot display radar for this circuit. Please check the circuit configuration.
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
            <Icon name="rainy" size={22} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
          <TouchableOpacity onPress={toggleRadarView} style={styles.toggleButton}>
            <Icon name="play" size={16} color="#fff" />
            <Text style={styles.toggleText}>Launch Radar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.previewContainer}>
          <Animated.View style={[styles.previewIcon, pulseStyle]}>
            <Icon name="thunderstorm" size={64} color={colors.precipitation} />
          </Animated.View>
          <Text style={styles.previewTitle}>Enhanced & Reliable</Text>
          <Text style={styles.previewDescription}>
            Live weather radar with improved connection stability and better error handling for {circuitName}
            {isWeb && '\n\nWeb Preview Mode with enhanced compatibility'}
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
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Rainfall Radar</Text>
            <Text style={styles.subtitle}>
              {circuitName}
              {isWeb && ' • Web Preview Mode'}
            </Text>
          </View>
          {alwaysVisible && (
            <View style={styles.alwaysOnBadge}>
              <Text style={styles.alwaysOnText}>
                {isWeb ? 'WEB MODE' : 'ALWAYS ON'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.controls}>
          {totalFrames > 1 && connectionStatus === 'connected' && isWebViewReady && (
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

      {/* Enhanced status display */}
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
        
        {retryCount > 0 && connectionStatus !== 'connected' && (
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
            <Icon name="cloud-download" size={48} color={colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>
            {connectionStatus === 'retrying' ? 'Reconnecting...' : 
             connectionStatus === 'timeout' ? 'Connection Timeout' : 'Loading Radar'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {connectionStatus === 'retrying' 
              ? `Attempt ${retryCount}/${MAX_RETRY_ATTEMPTS} - Enhanced retry logic with exponential backoff` 
              : connectionStatus === 'timeout'
                ? 'Connection took too long. Retrying with optimized settings...'
                : isWeb 
                  ? 'Web preview mode with enhanced compatibility and error handling'
                  : 'Optimized connection handling with improved stability'
            }
          </Text>
        </Animated.View>
      )}

      {hasError && (connectionStatus === 'error' || connectionStatus === 'timeout') && (
        <Animated.View style={[styles.errorContainer, errorShakeStyle]}>
          <Icon name="cloud-offline" size={56} color={colors.error} />
          <Text style={styles.errorTitle}>{errorMessage || 'Connection Failed'}</Text>
          <Text style={styles.errorText}>
            {retryCount >= MAX_RETRY_ATTEMPTS ? 'Max retries exceeded' : 'Temporary connection issue'}
          </Text>
          <Text style={styles.errorSubtext}>
            {errorDetails || 'Unable to connect to radar services'}
            {isWeb && '\n\nNote: Web preview mode has enhanced compatibility but some features may be limited.'}
            {retryCount >= MAX_RETRY_ATTEMPTS && '\n\nPlease check your internet connection and try refreshing.'}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
              <Icon name="refresh" size={16} color="#fff" />
              <Text style={styles.retryButtonText}>
                {retryCount >= MAX_RETRY_ATTEMPTS ? 'Reset & Retry' : 'Retry Now'}
              </Text>
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
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => {
            console.log('RainfallRadar: WebView load started for key:', webViewKey);
            setIsLoading(true);
            setIsWebViewReady(false);
          }}
          onLoadEnd={() => {
            console.log('RainfallRadar: WebView load ended for key:', webViewKey);
          }}
          onHttpError={(syntheticEvent) => {
            console.error('RainfallRadar: HTTP error:', syntheticEvent.nativeEvent);
            handleWebViewError(syntheticEvent);
          }}
          onRenderProcessGone={(syntheticEvent) => {
            console.error('RainfallRadar: Render process gone:', syntheticEvent.nativeEvent);
            // Auto-refresh on render process crash
            setTimeout(() => {
              refreshRadar();
            }, 1000);
          }}
        />
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Live radar • Updates every {refreshInterval} minutes
          {lastUpdateTime && ` • Last: ${lastUpdateTime.toLocaleTimeString()}`}
          {isWeb && ' • Web Preview Mode'}
          {retryCount > 0 && ` • Retry ${retryCount}/${MAX_RETRY_ATTEMPTS}`}
        </Text>
        <Text style={styles.attribution}>
          Powered by RainViewer API • Enhanced connection handling
        </Text>
      </View>
    </View>
  );
};

// Enhanced helper functions
const getConnectionStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return '#10B981';
    case 'connecting': return '#F59E0B';
    case 'retrying': return '#F97316';
    case 'timeout': return '#EF4444';
    case 'error': return '#DC2626';
    default: return '#6B7280';
  }
};

const getConnectionStatusText = (status: string): string => {
  switch (status) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting';
    case 'retrying': return 'Retrying';
    case 'timeout': return 'Timeout';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
};

export default RainfallRadar;
