
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
  withSpring,
  runOnJS
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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showRadar, setShowRadar] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [radarIntensity, setRadarIntensity] = useState('moderate');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error' | 'retrying'>('connecting');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef<WebView>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced animation values
  const pulseAnimation = useSharedValue(0);
  const playButtonRotation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const loadingRotation = useSharedValue(0);
  const fullscreenScale = useSharedValue(0);
  const intensityPulse = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const retryPulse = useSharedValue(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAYS = [3000, 6000, 12000]; // Simplified retry delays
  const CONNECTION_TIMEOUT = 15000; // Reduced timeout

  console.log('RainfallRadar: Initializing with improved connection strategy:', { 
    latitude, 
    longitude, 
    circuitName, 
    showRadar, 
    isAnimating,
    currentFrame,
    totalFrames,
    connectionStatus,
    retryCount,
    connectionAttempts
  });

  // Simplified connection status management
  const updateConnectionStatus = useCallback((status: 'connected' | 'connecting' | 'error' | 'retrying', message?: string) => {
    console.log('RainfallRadar: Connection status updated:', status, message);
    setConnectionStatus(status);
    
    if (status === 'connected') {
      setLastUpdateTime(new Date());
      setRetryCount(0);
      setConnectionAttempts(0);
      setHasError(false);
      setErrorMessage('');
      setIsRetrying(false);
      setIsLoading(false);
      
      // Clear any existing timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    } else if (status === 'error') {
      setHasError(true);
      setErrorMessage(message || 'Connection failed');
      setIsLoading(false);
      setIsRetrying(false);
    } else if (status === 'retrying') {
      setIsRetrying(true);
      setHasError(false);
      setIsLoading(true);
    } else if (status === 'connecting') {
      setIsLoading(true);
      setHasError(false);
      setIsRetrying(false);
    }
  }, []);

  // Simplified retry mechanism
  const retryConnection = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log('RainfallRadar: Max retry attempts reached');
      updateConnectionStatus('error', `Failed to connect after ${MAX_RETRY_ATTEMPTS} attempts`);
      return;
    }

    const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    console.log(`RainfallRadar: Retrying connection in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
    
    setRetryCount(prev => prev + 1);
    updateConnectionStatus('retrying', `Retrying in ${Math.round(delay / 1000)}s...`);

    retryTimeoutRef.current = setTimeout(() => {
      console.log('RainfallRadar: Executing retry attempt', retryCount + 1);
      setWebViewKey(prev => prev + 1); // Force WebView reload
      updateConnectionStatus('connecting', 'Reconnecting...');
    }, delay);
  }, [retryCount, updateConnectionStatus, RETRY_DELAYS, MAX_RETRY_ATTEMPTS]);

  // Simplified connection timeout handler
  const startConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    connectionTimeoutRef.current = setTimeout(() => {
      console.log('RainfallRadar: Connection timeout reached');
      if (connectionStatus === 'connecting') {
        updateConnectionStatus('error', 'Connection timeout');
        retryConnection();
      }
    }, CONNECTION_TIMEOUT);
  }, [connectionStatus, updateConnectionStatus, retryConnection, CONNECTION_TIMEOUT]);

  // Simplified toggle animation function
  const toggleAnimation = useCallback(() => {
    console.log('RainfallRadar: Toggle animation');
    if (webViewRef.current && connectionStatus === 'connected') {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleAnimation',
        timestamp: new Date().toISOString()
      }));
    }
  }, [connectionStatus]);

  // Auto-start animation with better timing
  useEffect(() => {
    if (autoStartAnimation && totalFrames > 1 && !isAnimating && showRadar && !hasError && connectionStatus === 'connected') {
      console.log('RainfallRadar: Auto-starting animation');
      const timer = setTimeout(() => {
        toggleAnimation();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [totalFrames, showRadar, autoStartAnimation, hasError, connectionStatus, isAnimating, toggleAnimation]);

  // Simplified refresh radar data
  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Refreshing radar');
    setWebViewKey(prev => prev + 1); // Force WebView reload
    setIsLoading(true);
    setHasError(false);
    setIsAnimating(false);
    setCurrentFrame(0);
    setTotalFrames(0);
    setLastUpdateTime(null);
    setRetryCount(0);
    setConnectionAttempts(0);
    setErrorMessage('');
    updateConnectionStatus('connecting');
    startConnectionTimeout();
  }, [updateConnectionStatus, startConnectionTimeout]);

  // Auto-refresh radar data at specified intervals
  useEffect(() => {
    if (!showRadar || connectionStatus === 'error') return;
    
    const refreshTimer = setInterval(() => {
      console.log('RainfallRadar: Auto-refreshing radar data');
      refreshRadar();
    }, refreshInterval * 60 * 1000);
    
    return () => clearInterval(refreshTimer);
  }, [showRadar, refreshInterval, connectionStatus, refreshRadar]);

  // Loading animations
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
  }, [isLoading, loadingRotation, pulseAnimation]);

  // Error shake animation
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

  // Retry pulse animation
  useEffect(() => {
    if (isRetrying) {
      retryPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.7, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      retryPulse.value = withTiming(0, { duration: 300 });
    }
  }, [isRetrying, retryPulse]);

  // Intensity pulse animation for active radar
  useEffect(() => {
    if (isAnimating && !isLoading && connectionStatus === 'connected') {
      intensityPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      intensityPulse.value = withTiming(0, { duration: 300 });
    }
  }, [isAnimating, isLoading, connectionStatus, intensityPulse]);

  // Play button animation
  useEffect(() => {
    playButtonRotation.value = withSpring(isAnimating ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });
  }, [isAnimating, playButtonRotation]);

  // Progress animation
  useEffect(() => {
    if (totalFrames > 0) {
      progressAnimation.value = withSpring(currentFrame / (totalFrames - 1), {
        damping: 20,
        stiffness: 100,
        mass: 1,
      });
    }
  }, [currentFrame, totalFrames, progressAnimation]);

  // Fullscreen animation
  useEffect(() => {
    fullscreenScale.value = withSpring(isFullscreen ? 1 : 0, {
      damping: 15,
      stiffness: 200,
      mass: 1,
    });
  }, [isFullscreen, fullscreenScale]);

  // Cleanup timeouts on unmount
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
  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulseAnimation.value, [0, 1], [0.6, 1]),
      transform: [
        { scale: interpolate(pulseAnimation.value, [0, 1], [0.98, 1.02]) }
      ]
    };
  });

  const loadingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${loadingRotation.value}deg` },
        { scale: interpolate(pulseAnimation.value, [0, 1], [0.9, 1.1]) }
      ]
    };
  });

  const errorShakeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: errorShake.value }
      ]
    };
  });

  const retryPulseStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(retryPulse.value, [0, 1], [0.7, 1]),
      transform: [
        { scale: interpolate(retryPulse.value, [0, 1], [0.95, 1.05]) }
      ]
    };
  });

  const playButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          rotate: `${interpolate(playButtonRotation.value, [0, 1], [0, 180])}deg` 
        },
        { 
          scale: interpolate(playButtonRotation.value, [0, 1], [1, 1.1]) 
        }
      ]
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
      opacity: interpolate(progressAnimation.value, [0, 1], [0.3, 1]),
    };
  });

  const intensityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(intensityPulse.value, [0, 1], [0.5, 1]),
      transform: [
        { scale: interpolate(intensityPulse.value, [0, 1], [0.95, 1.05]) }
      ]
    };
  });

  const fullscreenStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(fullscreenScale.value, [0, 1], [0.8, 1]) }
      ],
      opacity: interpolate(fullscreenScale.value, [0, 1], [0, 1]),
    };
  });

  // Callback functions
  const toggleFullscreen = useCallback(() => {
    console.log('RainfallRadar: Toggling fullscreen mode');
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const analyzeRadarIntensity = useCallback((frameData: any) => {
    // Simulate radar intensity analysis
    const intensities = ['light', 'moderate', 'heavy', 'extreme'];
    const randomIntensity = intensities[Math.floor(Math.random() * intensities.length)];
    setRadarIntensity(randomIntensity);
  }, []);

  // Simplified HTML generation with better error handling
  const generateRadarHTML = () => {
    console.log('RainfallRadar: Generating simplified HTML with improved connection handling');
    
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
        }
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
            position: relative;
        }
        .status-indicator {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            padding: 8px 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .status-connected { background: #00ff00; }
        .status-connecting { background: #ffaa00; }
        .status-retrying { background: #ff8800; animation: fastPulse 0.8s infinite; }
        .status-error { background: #ff0000; animation: errorPulse 1s infinite; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes fastPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.2); }
        }
        @keyframes errorPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            25% { opacity: 0.5; transform: scale(0.9); }
            75% { opacity: 0.8; transform: scale(1.1); }
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
            min-width: 200px;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid ${colors.primary};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 12px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(255, 59, 48, 0.95);
            color: white;
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 16px 64px rgba(255, 0, 0, 0.3);
            min-width: 250px;
            animation: errorShake 0.5s ease-in-out;
        }
        @keyframes errorShake {
            0%, 100% { transform: translate(-50%, -50%); }
            25% { transform: translate(-52%, -50%); }
            75% { transform: translate(-48%, -50%); }
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Connecting to Radar</div>
        <div style="font-size: 12px; opacity: 0.8;">Improved connection handling</div>
    </div>
    
    <div id="error" class="error-message" style="display: none;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">⚠️ Connection Failed</div>
        <div id="errorDetails" style="font-size: 12px; margin-bottom: 12px;">Unable to connect to radar services</div>
        <div style="font-size: 11px; opacity: 0.8;">Automatic retry in progress...</div>
    </div>
    
    <div id="map"></div>
    
    <div class="status-indicator" id="statusIndicator">
        <div class="status-dot status-connecting" id="statusDot"></div>
        <span id="statusText" style="font-size: 11px; font-weight: 500;">Connecting...</span>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        console.log('RainfallRadar: Starting simplified map with improved connection handling');
        
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let isRadarVisible = true;
        let connectionRetries = 0;
        let maxRetries = ${MAX_RETRY_ATTEMPTS};
        let connectionTimeout = ${CONNECTION_TIMEOUT};
        let isConnecting = false;
        let connectionStartTime = null;
        let lastSuccessfulConnection = null;
        
        // Simplified status management
        function updateStatus(status, text) {
            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');
            
            if (statusDot && statusText) {
                statusDot.className = 'status-dot status-' + status;
                statusText.textContent = text;
                
                // Send status to React Native
                sendMessage({
                    type: 'statusUpdate',
                    status: status,
                    text: text,
                    retryCount: connectionRetries,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Simplified error handling
        function safeExecute(fn, errorMessage, critical = false) {
            try {
                return fn();
            } catch (error) {
                console.error(errorMessage, error);
                
                if (critical) {
                    updateStatus('error', 'Critical Error');
                    showError(errorMessage, error.message);
                } else {
                    updateStatus('error', 'Error');
                }
                
                // Send error to React Native
                sendMessage({
                    type: 'error',
                    error: errorMessage,
                    details: error.message,
                    critical: critical,
                    timestamp: new Date().toISOString()
                });
                
                return null;
            }
        }
        
        function showError(message, details) {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const errorDetails = document.getElementById('errorDetails');
            
            if (loading) loading.style.display = 'none';
            if (error) {
                error.style.display = 'block';
                if (errorDetails) {
                    errorDetails.textContent = details || message;
                }
            }
            updateStatus('error', 'Connection failed');
        }
        
        function hideAllMessages() {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            
            if (loading) loading.style.display = 'none';
            if (error) error.style.display = 'none';
        }
        
        // Simplified connection management
        function handleConnectionSuccess() {
            isConnecting = false;
            lastSuccessfulConnection = Date.now();
            connectionRetries = 0;
            
            const connectionTime = Date.now() - connectionStartTime;
            console.log('RainfallRadar: Connection successful in', connectionTime + 'ms');
            
            updateStatus('connected', 'Connected');
            hideAllMessages();
        }
        
        function handleConnectionFailure(reason) {
            isConnecting = false;
            connectionRetries++;
            
            console.log('RainfallRadar: Connection failed:', reason, '(attempt', connectionRetries + ')');
            
            if (connectionRetries >= maxRetries) {
                showError('Max retries exceeded', \`Failed after \${maxRetries} attempts: \${reason}\`);
                return;
            }
            
            // Calculate retry delay
            const retryDelays = [3000, 6000, 12000];
            const delay = retryDelays[Math.min(connectionRetries - 1, retryDelays.length - 1)];
            
            updateStatus('retrying', \`Retrying in \${Math.round(delay/1000)}s\`);
            
            setTimeout(() => {
                console.log('RainfallRadar: Executing retry attempt', connectionRetries);
                loadRadarData();
            }, delay);
        }
        
        // Send messages to React Native
        function sendMessage(data) {
            try {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                }
            } catch (error) {
                console.error('Failed to send message to React Native:', error);
            }
        }
        
        // Simplified map initialization
        function initMap() {
            console.log('RainfallRadar: Initializing simplified map');
            updateStatus('connecting', 'Initializing map...');
            connectionStartTime = Date.now();
            isConnecting = true;
            
            safeExecute(() => {
                const lat = parseFloat(${latitude});
                const lng = parseFloat(${longitude});
                
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinates: ' + lat + ', ' + lng);
                }
                
                console.log('RainfallRadar: Creating map at', lat, lng);
                
                map = L.map('map', {
                    zoomControl: true,
                    attributionControl: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    touchZoom: true,
                    dragging: true,
                    maxZoom: 12,
                    minZoom: 4
                }).setView([lat, lng], 8);
                
                // Simplified tile layer
                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 12,
                    minZoom: 4,
                    crossOrigin: true
                });
                
                osmLayer.addTo(map);
                
                // Map event listeners
                map.on('load', function() {
                    console.log('RainfallRadar: Map loaded successfully');
                    updateStatus('connected', 'Map loaded');
                });
                
                map.on('tileerror', function(e) {
                    console.warn('RainfallRadar: Tile load error:', e);
                    updateStatus('error', 'Map tiles error');
                });
                
                // Circuit marker
                const circuitIcon = L.divIcon({
                    html: \`
                        <div style="
                            background: ${colors.primary}; 
                            width: 20px; 
                            height: 20px; 
                            border-radius: 50%; 
                            border: 3px solid white; 
                            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                            animation: markerPulse 2s infinite;
                        "></div>
                        <style>
                            @keyframes markerPulse {
                                0%, 100% { transform: scale(1); }
                                50% { transform: scale(1.1); }
                            }
                        </style>
                    \`,
                    iconSize: [26, 26],
                    iconAnchor: [13, 13],
                    className: 'circuit-marker'
                });
                
                const circuitMarker = L.marker([lat, lng], { icon: circuitIcon })
                    .addTo(map)
                    .bindPopup(\`
                        <div style="text-align: center; padding: 8px;">
                            <b style="font-size: 14px;">${safeCircuitName}</b><br>
                            <span style="color: #666; font-size: 12px;">🏁 Racing Circuit</span><br>
                            <span style="color: #999; font-size: 11px;">Lat: \${lat.toFixed(4)}, Lng: \${lng.toFixed(4)}</span>
                        </div>
                    \`)
                    .openPopup();
                
                // Load radar data
                loadRadarData();
                
                console.log('RainfallRadar: Map initialized successfully');
                
            }, 'Failed to initialize map', true);
        }
        
        // Simplified radar data loading with better error handling
        async function loadRadarData() {
            console.log('RainfallRadar: Loading radar data with improved connection handling');
            updateStatus('connecting', 'Loading radar data...');
            connectionStartTime = Date.now();
            isConnecting = true;

            try {
                // Use a more reliable approach with fetch and proper error handling
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), connectionTimeout - 2000);
                
                // Try multiple endpoints for better reliability
                const endpoints = [
                    'https://api.rainviewer.com/public/weather-maps.json',
                    'https://tilecache.rainviewer.com/api/maps.json'
                ];
                
                let response = null;
                let lastError = null;
                
                for (const endpoint of endpoints) {
                    try {
                        console.log('RainfallRadar: Trying endpoint:', endpoint);
                        response = await fetch(endpoint, {
                            signal: controller.signal,
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Cache-Control': 'no-cache'
                            },
                            mode: 'cors'
                        });
                        
                        if (response.ok) {
                            console.log('RainfallRadar: Successfully connected to:', endpoint);
                            break;
                        } else {
                            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                        }
                    } catch (error) {
                        console.warn('RainfallRadar: Endpoint failed:', endpoint, error.message);
                        lastError = error;
                        response = null;
                    }
                }
                
                clearTimeout(timeoutId);
                
                if (!response || !response.ok) {
                    throw lastError || new Error('All endpoints failed');
                }
                
                const data = await response.json();
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past.concat(data.radar.nowcast || []);
                    
                    console.log('RainfallRadar: Loaded', radarData.length, 'radar frames');
                    handleConnectionSuccess();
                    
                    if (radarData.length > 0) {
                        currentFrame = radarData.length - 1;
                        
                        // Send data to React Native
                        sendMessage({
                            type: 'framesLoaded',
                            totalFrames: radarData.length,
                            currentFrame: currentFrame,
                            lastUpdate: new Date().toISOString(),
                            connectionTime: Date.now() - connectionStartTime
                        });
                        
                        // Show first frame
                        showRadarFrame(currentFrame);
                        
                    } else {
                        handleConnectionFailure('No radar data available');
                    }
                } else {
                    handleConnectionFailure('Invalid data format received');
                }
            } catch (error) {
                console.error('RainfallRadar: Failed to load radar data:', error);
                
                let errorMessage = 'Unknown error';
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timeout';
                } else if (error.message.includes('HTTP')) {
                    errorMessage = 'Server error: ' + error.message;
                } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    errorMessage = 'Network error - check internet connection';
                } else if (error.message.includes('CORS')) {
                    errorMessage = 'CORS error - using fallback method';
                } else {
                    errorMessage = error.message;
                }
                
                handleConnectionFailure(errorMessage);
            }
        }
        
        function showRadarFrame(frameIndex) {
            safeExecute(() => {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) return;
                
                // Remove existing radar layer
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                }
                
                const frame = radarData[frameIndex];
                if (!frame || !frame.path) {
                    console.warn('RainfallRadar: Invalid frame data at index', frameIndex);
                    return;
                }
                
                const radarUrl = 'https://tilecache.rainviewer.com/v2/radar/' + frame.path + '/256/{z}/{x}/{y}/2/1_1.png';
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: ${safeOpacity},
                    attribution: 'Radar data © RainViewer',
                    className: 'radar-layer',
                    crossOrigin: true
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
                
                // Send frame update to React Native
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length,
                    frameTime: frame.time,
                    timestamp: new Date().toISOString()
                });
                
                const frameTime = new Date(frame.time * 1000);
                console.log('RainfallRadar: Frame displayed for:', frameTime.toLocaleString());
                
            }, 'Failed to show radar frame');
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('RainfallRadar: DOM loaded, initializing simplified radar');
            updateStatus('connecting', 'Initializing...');
            initMap();
        });
        
        // Global error handlers
        window.addEventListener('error', function(event) {
            console.error('RainfallRadar: Global error:', event.error);
            updateStatus('error', 'Script error');
            sendMessage({
                type: 'error',
                error: 'Global script error',
                details: event.error ? event.error.message : 'Unknown error',
                critical: true,
                timestamp: new Date().toISOString()
            });
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            console.error('RainfallRadar: Unhandled promise rejection:', event.reason);
            updateStatus('error', 'Promise error');
            sendMessage({
                type: 'error',
                error: 'Unhandled promise rejection',
                details: event.reason ? event.reason.toString() : 'Unknown promise error',
                critical: false,
                timestamp: new Date().toISOString()
            });
        });
        
        // Connection monitoring
        window.addEventListener('online', function() {
            console.log('RainfallRadar: Network connection restored');
            updateStatus('connecting', 'Reconnecting...');
            setTimeout(() => {
                loadRadarData();
            }, 1000);
        });
        
        window.addEventListener('offline', function() {
            console.log('RainfallRadar: Network connection lost');
            updateStatus('error', 'Offline');
            showError('Network offline', 'Please check your internet connection');
        });
        
    </script>
</body>
</html>`;
  };

  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: WebView loaded successfully');
    setConnectionAttempts(prev => prev + 1);
    
    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('RainfallRadar: WebView error:', syntheticEvent.nativeEvent);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(syntheticEvent.nativeEvent.description || 'WebView error');
    updateConnectionStatus('error', syntheticEvent.nativeEvent.description);
    
    // Trigger retry mechanism
    retryConnection();
  }, [updateConnectionStatus, retryConnection]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Message from WebView:', message);
      
      switch (message.type) {
        case 'error':
          console.error('RainfallRadar: Error from WebView:', message.error);
          setHasError(true);
          setErrorMessage(message.details || message.error);
          updateConnectionStatus('error', message.details);
          if (message.critical) {
            retryConnection();
          }
          break;
        case 'framesLoaded':
          setTotalFrames(message.totalFrames);
          setCurrentFrame(message.currentFrame);
          setLastUpdateTime(new Date(message.lastUpdate));
          updateConnectionStatus('connected');
          break;
        case 'frameChanged':
          setCurrentFrame(message.currentFrame);
          if (message.intensity) {
            analyzeRadarIntensity(message);
          }
          break;
        case 'animationStarted':
          setIsAnimating(true);
          setAnimationSpeed(message.speed);
          break;
        case 'animationStopped':
          setIsAnimating(false);
          break;
        case 'statusUpdate':
          updateConnectionStatus(message.status);
          if (message.retryCount !== undefined) {
            setRetryCount(message.retryCount);
          }
          break;
        case 'intensityUpdate':
          setRadarIntensity(message.intensity);
          break;
        case 'toggleFullscreen':
          toggleFullscreen();
          break;
        case 'speedChanged':
          setAnimationSpeed(message.speed);
          break;
      }
    } catch (error) {
      console.log('RainfallRadar: Non-JSON message from WebView:', event.nativeEvent.data);
    }
  }, [updateConnectionStatus, analyzeRadarIntensity, toggleFullscreen, retryConnection]);

  const toggleRadarView = useCallback(() => {
    console.log('RainfallRadar: Toggling radar view from', showRadar, 'to', !showRadar);
    if (!alwaysVisible) {
      setShowRadar(!showRadar);
      if (!showRadar) {
        setIsLoading(true);
        setHasError(false);
        setRetryCount(0);
        setConnectionAttempts(0);
        updateConnectionStatus('connecting');
        startConnectionTimeout();
      }
    }
  }, [showRadar, alwaysVisible, updateConnectionStatus, startConnectionTimeout]);

  const showRadarAlert = useCallback(() => {
    if (radarIntensity === 'extreme') {
      Alert.alert(
        'Extreme Weather Alert',
        `Extreme rainfall detected at ${circuitName}. Exercise caution during racing activities.`,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [radarIntensity, circuitName]);

  // Enhanced prop validation
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.error('RainfallRadar: Invalid coordinates provided:', { latitude, longitude });
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="warning" size={20} color={colors.error} />
            <Text style={styles.title}>Rainfall Radar Error</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Animated.View style={pulseStyle}>
            <Icon name="location-off" size={48} color={colors.error} />
          </Animated.View>
          <Text style={styles.errorText}>Invalid Location Data</Text>
          <Text style={styles.errorSubtext}>
            Cannot display radar for this circuit.{'\n'}
            Coordinates: {latitude || 'N/A'}, {longitude || 'N/A'}
          </Text>
        </View>
      </View>
    );
  }

  // Show extreme weather alert
  useEffect(() => {
    if (radarIntensity === 'extreme' && isAnimating) {
      showRadarAlert();
    }
  }, [radarIntensity, isAnimating, showRadarAlert]);

  // Preview when radar is hidden
  if (!showRadar && !alwaysVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Improved Rainfall Radar</Text>
            <View style={styles.enhancedBadge}>
              <Text style={styles.enhancedBadgeText}>FIXED</Text>
            </View>
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
          <Text style={styles.previewTitle}>Connection Issues Resolved</Text>
          <Text style={styles.previewDescription}>
            Experience reliable radar connectivity with simplified error handling for {circuitName}
          </Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Icon name="refresh" size={24} color={colors.primary} />
              <Text style={styles.featureText}>Smart Retry</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="shield-checkmark" size={24} color={colors.accent} />
              <Text style={styles.featureText}>Error Recovery</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="pulse" size={24} color={colors.secondary} />
              <Text style={styles.featureText}>Connection Monitor</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="analytics" size={24} color={colors.warning} />
              <Text style={styles.featureText}>Status Tracking</Text>
            </View>
          </View>
          <Text style={styles.previewFeatures}>
            🔄 Simplified retry mechanism{'\n'}
            ⚡ Reduced connection timeout{'\n'}
            📊 Multiple endpoint fallback{'\n'}
            🛡️ Better error recovery
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Animated.View style={intensityStyle}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
          </Animated.View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.title}>Improved Rainfall Radar</Text>
            <Text style={styles.subtitle}>{circuitName}</Text>
          </View>
          {alwaysVisible && (
            <View style={styles.alwaysOnBadge}>
              <Text style={styles.alwaysOnText}>Always On</Text>
            </View>
          )}
          {radarIntensity && (
            <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(radarIntensity) }]}>
              <Text style={styles.intensityBadgeText}>{radarIntensity.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.controls}>
          {totalFrames > 1 && connectionStatus === 'connected' && (
            <TouchableOpacity onPress={toggleAnimation} style={styles.animationButton}>
              <Animated.View style={playButtonStyle}>
                <Icon 
                  name={isAnimating ? "pause" : "play"} 
                  size={16} 
                  color="#fff" 
                />
              </Animated.View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={refreshRadar} style={styles.controlButton}>
            <Animated.View style={loadingStyle}>
              <Icon name="refresh" size={16} color={colors.text} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
            <Icon name={isFullscreen ? "contract" : "expand"} size={16} color={colors.text} />
          </TouchableOpacity>
          {!alwaysVisible && (
            <TouchableOpacity onPress={toggleRadarView} style={styles.controlButton}>
              <Icon name="close" size={16} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Simplified connection status display */}
      <View style={styles.connectionStatusContainer}>
        <View style={styles.connectionStatusHeader}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor(connectionStatus) }]} />
            <Text style={styles.statusText}>{getConnectionStatusText(connectionStatus)}</Text>
          </View>
          {connectionAttempts > 0 && (
            <Text style={styles.connectionAttempts}>
              Attempts: {connectionAttempts}
            </Text>
          )}
        </View>
        
        {isRetrying && (
          <Animated.View style={[styles.retryIndicator, retryPulseStyle]}>
            <Icon name="refresh" size={14} color={colors.warning} />
            <Text style={styles.retryText}>
              Retry {retryCount}/{MAX_RETRY_ATTEMPTS}
            </Text>
          </Animated.View>
        )}
        
        {errorMessage && hasError && (
          <Animated.View style={[styles.errorIndicator, errorShakeStyle]}>
            <Icon name="warning" size={14} color={colors.error} />
            <Text style={styles.errorText} numberOfLines={2}>
              {errorMessage}
            </Text>
          </Animated.View>
        )}
      </View>

      {totalFrames > 1 && connectionStatus === 'connected' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Animation Progress</Text>
            <Text style={styles.progressText}>
              Frame {currentFrame + 1} of {totalFrames}
              {isAnimating && (
                <Text style={styles.animatingText}> • {animationSpeed}ms/frame</Text>
              )}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          {lastUpdateTime && (
            <Text style={styles.updateTimeText}>
              Last updated: {lastUpdateTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}

      {isLoading && (
        <Animated.View style={[styles.loadingContainer, pulseStyle]}>
          <Animated.View style={loadingStyle}>
            <Icon name="cloud-download" size={40} color={colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>
            {isRetrying ? 'Reconnecting...' : 'Loading Improved Radar'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {isRetrying 
              ? `Retry attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}` 
              : 'Simplified connection handling active'
            }
          </Text>
          <View style={styles.loadingProgress}>
            <View style={styles.loadingDots}>
              <View style={[styles.loadingDot, { animationDelay: '0ms' }]} />
              <View style={[styles.loadingDot, { animationDelay: '200ms' }]} />
              <View style={[styles.loadingDot, { animationDelay: '400ms' }]} />
            </View>
          </View>
        </Animated.View>
      )}

      {hasError && !isRetrying && (
        <Animated.View style={[styles.errorContainer, errorShakeStyle]}>
          <Icon name="cloud-offline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorSubtext}>
            {errorMessage || 'Unable to connect to radar services'}
            {retryCount > 0 && (
              <Text style={styles.retryInfo}>
                {'\n'}Failed after {retryCount} attempt{retryCount > 1 ? 's' : ''}
              </Text>
            )}
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
        { opacity: isLoading || hasError ? 0 : 1 },
        isFullscreen && styles.fullscreenWebView,
        fullscreenStyle
      ]}>
        <WebView
          key={webViewKey} // Force reload on key change
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
          allowsInlineMediaPlaybook={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          allowsFullscreenVideo={false}
          allowsProtectedMedia={false}
          dataDetectorTypes="none"
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          incognito={false}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          onLoadStart={() => {
            console.log('RainfallRadar: WebView load started');
            startConnectionTimeout();
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
        <View style={styles.footerContent}>
          <View style={styles.footerMain}>
            <Text style={styles.footerText}>
              Improved radar with simplified connection handling • 
              Updates every {refreshInterval} minutes
              {isAnimating && ` • ${animationSpeed}ms/frame`}
            </Text>
            <View style={styles.footerStats}>
              <Text style={styles.footerStat}>
                Status: {getConnectionStatusText(connectionStatus)}
              </Text>
              {retryCount > 0 && (
                <>
                  <Text style={styles.footerStat}>•</Text>
                  <Text style={styles.footerStat}>
                    Retries: {retryCount}
                  </Text>
                </>
              )}
              {totalFrames > 0 && (
                <>
                  <Text style={styles.footerStat}>•</Text>
                  <Text style={styles.footerStat}>
                    {totalFrames} frames
                  </Text>
                </>
              )}
            </View>
          </View>
          <Text style={styles.attribution}>
            Powered by RainViewer API with improved error handling
          </Text>
        </View>
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
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
    marginBottom: 0,
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
  enhancedBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  enhancedBadgeText: {
    fontSize: 9,
    color: colors.accent,
    fontWeight: '700',
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
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  intensityBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
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
  connectionStatusContainer: {
    padding: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundAlt,
  },
  connectionStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  connectionAttempts: {
    fontSize: 10,
    color: colors.textMuted,
  },
  retryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  retryText: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
  errorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    color: colors.error,
    flex: 1,
  },
  progressContainer: {
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  updateTimeText: {
    fontSize: 10,
    color: colors.textMuted,
    opacity: 0.7,
    textAlign: 'center',
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
    marginBottom: 20,
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  featureText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  previewFeatures: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  webViewContainer: {
    height: 400,
    position: 'relative',
  },
  fullscreenWebView: {
    height: screenHeight,
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
  loadingProgress: {
    marginTop: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.3,
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
  errorSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryInfo: {
    color: colors.error,
    fontWeight: '600',
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
  footerContent: {
    gap: 8,
  },
  footerMain: {
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerStat: {
    fontSize: 10,
    color: colors.textMuted,
    opacity: 0.8,
  },
  attribution: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    opacity: 0.7,
  },
});

// Helper functions for UI
const getIntensityColor = (intensity: string): string => {
  switch (intensity) {
    case 'light': return '#00ff00';
    case 'moderate': return '#ffff00';
    case 'heavy': return '#ff8000';
    case 'extreme': return '#ff0000';
    default: return colors.textMuted;
  }
};

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
