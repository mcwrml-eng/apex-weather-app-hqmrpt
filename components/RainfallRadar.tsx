
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withSequence,
  interpolate,
  Easing
} from 'react-native-reanimated';
import Icon from './Icon';
import { colors } from '../styles/commonStyles';

interface Props {
  latitude: number;
  longitude: number;
  circuitName: string;
  alwaysVisible?: boolean;
  autoStartAnimation?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const RainfallRadar: React.FC<Props> = ({ 
  latitude, 
  longitude, 
  circuitName, 
  alwaysVisible = false,
  autoStartAnimation = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRadar, setShowRadar] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulLoad, setLastSuccessfulLoad] = useState<Date | null>(null);
  const webViewRef = useRef<WebView>(null);
  
  // Animation values
  const pulseAnimation = useSharedValue(0);
  const playButtonRotation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  console.log('RainfallRadar: Rendering with enhanced error handling:', { 
    latitude, 
    longitude, 
    circuitName, 
    showRadar, 
    isAnimating,
    currentFrame,
    totalFrames,
    retryCount,
    hasError,
    lastSuccessfulLoad: lastSuccessfulLoad?.toISOString()
  });

  // Auto-start animation when frames are loaded and autoStartAnimation is true
  useEffect(() => {
    if (autoStartAnimation && totalFrames > 1 && !isAnimating && showRadar && !hasError) {
      console.log('RainfallRadar: Auto-starting animation');
      const timeoutId = setTimeout(() => {
        toggleAnimation();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [totalFrames, showRadar, autoStartAnimation, hasError]);

  // Start pulse animation for loading state
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
    }
  }, [isLoading]);

  // Animate play button rotation
  useEffect(() => {
    playButtonRotation.value = withTiming(isAnimating ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    });
  }, [isAnimating]);

  // Update progress animation when frame changes
  useEffect(() => {
    if (totalFrames > 0) {
      progressAnimation.value = withTiming(currentFrame / (totalFrames - 1), {
        duration: 200,
        easing: Easing.out(Easing.ease)
      });
    }
  }, [currentFrame, totalFrames]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pulseAnimation.value, [0, 1], [0.5, 1]),
      transform: [
        { scale: interpolate(pulseAnimation.value, [0, 1], [0.95, 1.05]) }
      ]
    };
  });

  const playButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(playButtonRotation.value, [0, 1], [0, 360])}deg` }
      ]
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`
    };
  });

  // Enhanced HTML generation with better error handling and caching
  const generateRadarHTML = useCallback(() => {
    console.log('RainfallRadar: Generating enhanced HTML with improved error handling');
    
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    const cacheKey = `radar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Rainfall Radar - ${safeCircuitName}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background};
            color: ${colors.text};
            overflow: hidden;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }
        #map {
            height: 100vh;
            width: 100%;
            position: relative;
        }
        .radar-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 8px;
            padding: 8px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
            transition: all 0.2s ease;
            -webkit-appearance: none;
            appearance: none;
        }
        .radar-toggle:hover, .radar-toggle:active {
            opacity: 0.8;
            transform: scale(0.98);
        }
        .radar-toggle.active {
            background: ${colors.accent};
            box-shadow: 0 0 10px rgba(0, 122, 255, 0.3);
        }
        .animation-controls {
            display: flex;
            gap: 4px;
            margin-top: 8px;
        }
        .animation-btn {
            background: ${colors.secondary};
            color: white;
            border: none;
            padding: 6px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            flex: 1;
            transition: all 0.2s ease;
            -webkit-appearance: none;
            appearance: none;
        }
        .animation-btn:hover, .animation-btn:active {
            opacity: 0.8;
        }
        .animation-btn.active {
            background: ${colors.accent};
        }
        .time-slider {
            width: 100%;
            margin-top: 8px;
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.3);
            outline: none;
        }
        .time-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${colors.primary};
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .time-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: ${colors.primary};
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .frame-info {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            margin-top: 4px;
        }
        .legend {
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 8px;
            padding: 8px;
            font-size: 11px;
            color: white;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: opacity 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .error-message {
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
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(255, 59, 48, 0.3);
        }
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 8px 16px;
            border-radius: 8px;
            margin-top: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .retry-btn:hover, .retry-btn:active {
            background: rgba(255, 255, 255, 0.3);
        }
        .radar-layer {
            transition: opacity 0.3s ease;
        }
        .connection-status {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 10px;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .status-online { background: rgba(52, 199, 89, 0.9); }
        .status-offline { background: rgba(255, 59, 48, 0.9); }
        .status-loading { background: rgba(255, 149, 0, 0.9); }
    </style>
</head>
<body>
    <div id="connectionStatus" class="connection-status status-loading">
        Connecting...
    </div>
    
    <div id="loading" class="loading">
        <div style="font-size: 16px; margin-bottom: 8px;">🌧️</div>
        <div>Loading rainfall radar...</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">Powered by RainViewer</div>
        <div style="font-size: 10px; margin-top: 4px; opacity: 0.5;">Cache: ${cacheKey}</div>
    </div>
    
    <div id="error" class="error-message" style="display: none;">
        <div style="font-size: 16px; margin-bottom: 8px;">⚠️</div>
        <div id="errorTitle">Failed to load radar data</div>
        <div id="errorMessage" style="font-size: 12px; margin-top: 8px;">Please check your connection</div>
        <button class="retry-btn" onclick="retryLoad()">Retry</button>
    </div>
    
    <div id="map"></div>
    
    <div class="radar-controls">
        <button id="radarToggle" class="radar-toggle active">Radar Active</button>
        <button id="satelliteToggle" class="radar-toggle">Satellite</button>
        
        <div class="animation-controls" id="animationControls">
            <button id="playPauseBtn" class="animation-btn">▶</button>
            <button id="speedBtn" class="animation-btn">1x</button>
            <button id="loopBtn" class="animation-btn active">Loop ✓</button>
        </div>
        
        <input type="range" id="timeSlider" class="time-slider" min="0" max="11" value="11">
        <div id="frameInfo" class="frame-info">Frame 1 of 12</div>
    </div>
    
    <div class="legend" id="legend">
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
        console.log('RainfallRadar: Starting enhanced map initialization');
        
        let map;
        let radarLayer = null;
        let radarData = [];
        let currentFrame = 0;
        let isRadarVisible = true;
        let isSatelliteView = false;
        let isAnimating = false;
        let animationInterval = null;
        let animationSpeed = 1000;
        let isLooping = true;
        let animationDirection = 1;
        let autoStartRequested = ${autoStartAnimation ? 'true' : 'false'};
        let retryCount = 0;
        let maxRetries = 3;
        let connectionTimeout = 15000; // 15 seconds
        let isOnline = navigator.onLine;
        
        // Enhanced error tracking
        let lastError = null;
        let errorCount = 0;
        let loadStartTime = Date.now();
        
        // Animation speeds
        const speeds = [
            { label: '0.5x', value: 2000 },
            { label: '1x', value: 1000 },
            { label: '2x', value: 500 },
            { label: '4x', value: 250 }
        ];
        let currentSpeedIndex = 1;
        
        // Connection status monitoring
        function updateConnectionStatus(status, message) {
            const statusEl = document.getElementById('connectionStatus');
            if (statusEl) {
                statusEl.className = 'connection-status status-' + status;
                statusEl.textContent = message || status;
            }
        }
        
        // Enhanced error handling wrapper
        function safeExecute(fn, errorMessage, fallback = null) {
            try {
                return fn();
            } catch (error) {
                console.error(errorMessage, error);
                errorCount++;
                lastError = error;
                showError(errorMessage + ': ' + error.message);
                sendMessage({
                    type: 'error',
                    error: errorMessage,
                    details: error.message,
                    errorCount: errorCount,
                    retryCount: retryCount
                });
                return fallback;
            }
        }
        
        function showError(message, details = null) {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const errorTitle = document.getElementById('errorTitle');
            const errorMessage = document.getElementById('errorMessage');
            
            if (loading) loading.style.display = 'none';
            if (error) {
                error.style.display = 'block';
                if (errorTitle) errorTitle.textContent = message;
                if (errorMessage) {
                    errorMessage.textContent = details || 'Please check your internet connection and try again.';
                }
            }
            
            updateConnectionStatus('offline', 'Connection failed');
        }
        
        function hideError() {
            const error = document.getElementById('error');
            if (error) error.style.display = 'none';
            updateConnectionStatus('online', 'Connected');
        }
        
        // Enhanced message sending with error handling
        function sendMessage(data) {
            try {
                if (window.ReactNativeWebView) {
                    const message = JSON.stringify({
                        ...data,
                        timestamp: Date.now(),
                        cacheKey: '${cacheKey}',
                        retryCount: retryCount,
                        errorCount: errorCount
                    });
                    window.ReactNativeWebView.postMessage(message);
                    console.log('RainfallRadar: Sent message to React Native:', data.type);
                } else {
                    console.warn('RainfallRadar: ReactNativeWebView not available');
                }
            } catch (error) {
                console.error('Failed to send message to React Native:', error);
            }
        }
        
        // Retry mechanism
        function retryLoad() {
            if (retryCount < maxRetries) {
                retryCount++;
                console.log('RainfallRadar: Retrying load attempt', retryCount);
                hideError();
                
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.style.display = 'block';
                    loading.querySelector('div').textContent = \`Retrying... (Attempt \${retryCount}/\${maxRetries})\`;
                }
                
                updateConnectionStatus('loading', \`Retrying \${retryCount}/\${maxRetries}\`);
                
                // Clear existing data and restart
                radarData = [];
                currentFrame = 0;
                if (radarLayer && map) {
                    map.removeLayer(radarLayer);
                    radarLayer = null;
                }
                
                // Retry after a delay
                setTimeout(() => {
                    loadRadarData();
                }, 2000);
            } else {
                showError('Maximum retry attempts reached', 'Please refresh the page or check your internet connection.');
                sendMessage({
                    type: 'maxRetriesReached',
                    retryCount: retryCount,
                    errorCount: errorCount
                });
            }
        }
        
        // Initialize map with enhanced error handling
        function initMap() {
            console.log('RainfallRadar: Initializing enhanced map');
            
            return safeExecute(() => {
                const lat = parseFloat(${latitude});
                const lng = parseFloat(${longitude});
                
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinates: lat=' + lat + ', lng=' + lng);
                }
                
                console.log('RainfallRadar: Creating map at', lat, lng);
                
                map = L.map('map', {
                    center: [lat, lng],
                    zoom: 8,
                    zoomControl: true,
                    attributionControl: true,
                    preferCanvas: true,
                    maxZoom: 18,
                    minZoom: 3
                });
                
                // Enhanced tile layers with error handling
                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 18,
                    timeout: 10000,
                    retryDelay: 1000,
                    retryLimit: 3,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                });
                
                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
                    maxZoom: 18,
                    timeout: 10000,
                    retryDelay: 1000,
                    retryLimit: 3,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'
                });
                
                osmLayer.addTo(map);
                
                // Enhanced circuit marker
                const circuitIcon = L.divIcon({
                    html: '<div style="background: ${colors.primary}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                    className: 'circuit-marker'
                });
                
                L.marker([lat, lng], { icon: circuitIcon })
                    .addTo(map)
                    .bindPopup('<b>${safeCircuitName}</b><br>Racing Circuit<br>Lat: ' + lat.toFixed(4) + ', Lng: ' + lng.toFixed(4))
                    .openPopup();
                
                // Enhanced event listeners
                const radarToggle = document.getElementById('radarToggle');
                const satelliteToggle = document.getElementById('satelliteToggle');
                const timeSlider = document.getElementById('timeSlider');
                const playPauseBtn = document.getElementById('playPauseBtn');
                const speedBtn = document.getElementById('speedBtn');
                const loopBtn = document.getElementById('loopBtn');
                
                if (satelliteToggle) satelliteToggle.addEventListener('click', toggleSatellite);
                if (timeSlider) timeSlider.addEventListener('input', updateRadarFrame);
                if (playPauseBtn) playPauseBtn.addEventListener('click', toggleAnimation);
                if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);
                if (loopBtn) loopBtn.addEventListener('click', toggleLoop);
                
                // Map event listeners for error handling
                map.on('tileerror', function(e) {
                    console.warn('RainfallRadar: Tile load error:', e);
                    errorCount++;
                });
                
                map.on('tileload', function(e) {
                    console.log('RainfallRadar: Tile loaded successfully');
                });
                
                // Load radar data
                loadRadarData();
                
                // Hide loading
                const loading = document.getElementById('loading');
                if (loading) loading.style.display = 'none';
                
                hideError();
                updateConnectionStatus('online', 'Map loaded');
                
                console.log('RainfallRadar: Enhanced map initialized successfully');
                
                // Layer switching functions
                window.switchToSatellite = function() {
                    return safeExecute(() => {
                        map.removeLayer(osmLayer);
                        satelliteLayer.addTo(map);
                        isSatelliteView = true;
                        const btn = document.getElementById('satelliteToggle');
                        if (btn) {
                            btn.textContent = 'Street Map';
                            btn.classList.add('active');
                        }
                    }, 'Failed to switch to satellite view');
                };
                
                window.switchToStreet = function() {
                    return safeExecute(() => {
                        map.removeLayer(satelliteLayer);
                        osmLayer.addTo(map);
                        isSatelliteView = false;
                        const btn = document.getElementById('satelliteToggle');
                        if (btn) {
                            btn.textContent = 'Satellite';
                            btn.classList.remove('active');
                        }
                    }, 'Failed to switch to street view');
                };
                
                return true;
            }, 'Failed to initialize map');
        }
        
        function toggleSatellite() {
            safeExecute(() => {
                if (isSatelliteView) {
                    window.switchToStreet();
                } else {
                    window.switchToSatellite();
                }
            }, 'Failed to toggle satellite view');
        }
        
        // Enhanced radar data loading with better error handling
        async function loadRadarData() {
            console.log('RainfallRadar: Loading radar data with enhanced error handling');
            updateConnectionStatus('loading', 'Loading radar data...');
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                    console.warn('RainfallRadar: Request timed out after', connectionTimeout, 'ms');
                }, connectionTimeout);
                
                console.log('RainfallRadar: Fetching from RainViewer API...');
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(\`Network response was not ok: \${response.status} \${response.statusText}\`);
                }
                
                const data = await response.json();
                console.log('RainfallRadar: Received radar data:', data);
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past.concat(data.radar.nowcast || []);
                    console.log('RainfallRadar: Loaded radar frames:', radarData.length);
                    
                    if (radarData.length > 0) {
                        currentFrame = radarData.length - 1;
                        const slider = document.getElementById('timeSlider');
                        if (slider) {
                            slider.max = radarData.length - 1;
                            slider.value = currentFrame;
                        }
                        updateFrameInfo();
                        
                        // Show radar
                        showRadarFrame(currentFrame);
                        isRadarVisible = true;
                        
                        // Show controls
                        const legend = document.getElementById('legend');
                        const animationControls = document.getElementById('animationControls');
                        const frameInfo = document.getElementById('frameInfo');
                        const timeSlider = document.getElementById('timeSlider');
                        
                        if (legend) legend.style.display = 'block';
                        if (animationControls) animationControls.style.display = 'flex';
                        if (frameInfo) frameInfo.style.display = 'block';
                        if (timeSlider) timeSlider.style.display = 'block';
                        
                        // Send success message
                        sendMessage({
                            type: 'framesLoaded',
                            totalFrames: radarData.length,
                            currentFrame: currentFrame,
                            loadTime: Date.now() - loadStartTime
                        });
                        
                        updateConnectionStatus('online', \`\${radarData.length} frames loaded\`);
                        
                        // Auto-start animation if requested
                        if (autoStartRequested && radarData.length > 1) {
                            console.log('RainfallRadar: Auto-starting animation as requested');
                            setTimeout(() => {
                                startAnimation();
                            }, 1500);
                        }
                        
                        // Reset retry count on success
                        retryCount = 0;
                        errorCount = 0;
                        
                    } else {
                        throw new Error('No radar data available in response');
                    }
                } else {
                    throw new Error('Invalid radar data structure received');
                }
            } catch (error) {
                console.error('RainfallRadar: Failed to load radar data:', error);
                
                let errorMessage = 'Failed to load radar data';
                let errorDetails = error.message;
                
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timed out';
                    errorDetails = \`Connection timeout after \${connectionTimeout/1000} seconds\`;
                } else if (error.message.includes('Network')) {
                    errorMessage = 'Network error';
                    errorDetails = 'Please check your internet connection';
                } else if (error.message.includes('CORS')) {
                    errorMessage = 'Access blocked';
                    errorDetails = 'Radar service may be temporarily unavailable';
                }
                
                showError(errorMessage, errorDetails);
                
                sendMessage({
                    type: 'loadError',
                    error: errorMessage,
                    details: errorDetails,
                    retryCount: retryCount,
                    canRetry: retryCount < maxRetries
                });
                
                // Auto-retry if we haven't exceeded max retries
                if (retryCount < maxRetries) {
                    setTimeout(() => {
                        retryLoad();
                    }, 3000);
                }
            }
        }
        
        function showRadarFrame(frameIndex) {
            return safeExecute(() => {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) return;
                
                // Remove existing radar layer
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                }
                
                const frame = radarData[frameIndex];
                if (!frame || !frame.path) {
                    console.warn('RainfallRadar: Invalid frame data for index', frameIndex);
                    return;
                }
                
                const radarUrl = 'https://tilecache.rainviewer.com/v2/radar/' + frame.path + '/256/{z}/{x}/{y}/2/1_1.png';
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: 0.6,
                    attribution: 'Radar data © RainViewer',
                    className: 'radar-layer',
                    timeout: 8000,
                    retryDelay: 1000,
                    retryLimit: 2,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0idHJhbnNwYXJlbnQiLz48L3N2Zz4='
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
                
                // Update slider
                const slider = document.getElementById('timeSlider');
                if (slider) slider.value = frameIndex;
                
                updateFrameInfo();
                
                // Send frame update
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length
                });
                
                const frameTime = new Date(frame.time * 1000);
                console.log('RainfallRadar: Showing radar frame for:', frameTime.toLocaleString());
                
            }, 'Failed to show radar frame');
        }
        
        function updateRadarFrame(event) {
            safeExecute(() => {
                const frameIndex = parseInt(event.target.value);
                if (isRadarVisible && !isNaN(frameIndex)) {
                    showRadarFrame(frameIndex);
                }
            }, 'Failed to update radar frame');
        }
        
        function updateFrameInfo() {
            const frameInfo = document.getElementById('frameInfo');
            if (frameInfo && radarData.length > 0) {
                const frameTime = new Date(radarData[currentFrame].time * 1000);
                const timeStr = frameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                frameInfo.textContent = \`Frame \${currentFrame + 1} of \${radarData.length} - \${timeStr}\`;
            }
        }
        
        function toggleAnimation() {
            safeExecute(() => {
                if (isAnimating) {
                    stopAnimation();
                } else {
                    startAnimation();
                }
            }, 'Failed to toggle animation');
        }
        
        function startAnimation() {
            if (radarData.length <= 1) return;
            
            isAnimating = true;
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.textContent = '⏸';
                playPauseBtn.classList.add('active');
            }
            
            animationInterval = setInterval(() => {
                let nextFrame = currentFrame + animationDirection;
                
                if (nextFrame >= radarData.length) {
                    if (isLooping) {
                        nextFrame = 0;
                    } else {
                        animationDirection = -1;
                        nextFrame = radarData.length - 2;
                    }
                } else if (nextFrame < 0) {
                    if (isLooping) {
                        nextFrame = radarData.length - 1;
                    } else {
                        animationDirection = 1;
                        nextFrame = 1;
                    }
                }
                
                showRadarFrame(nextFrame);
            }, animationSpeed);
            
            sendMessage({
                type: 'animationStarted',
                speed: animationSpeed
            });
            
            console.log('RainfallRadar: Animation started');
        }
        
        function stopAnimation() {
            isAnimating = false;
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
            
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.textContent = '▶';
                playPauseBtn.classList.remove('active');
            }
            
            sendMessage({
                type: 'animationStopped'
            });
            
            console.log('RainfallRadar: Animation stopped');
        }
        
        function cycleSpeed() {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            animationSpeed = speeds[currentSpeedIndex].value;
            
            const speedBtn = document.getElementById('speedBtn');
            if (speedBtn) {
                speedBtn.textContent = speeds[currentSpeedIndex].label;
            }
            
            // Restart animation with new speed if currently animating
            if (isAnimating) {
                stopAnimation();
                startAnimation();
            }
            
            console.log('RainfallRadar: Speed changed to', speeds[currentSpeedIndex].label);
        }
        
        function toggleLoop() {
            isLooping = !isLooping;
            const loopBtn = document.getElementById('loopBtn');
            if (loopBtn) {
                if (isLooping) {
                    loopBtn.classList.add('active');
                    loopBtn.textContent = 'Loop ✓';
                } else {
                    loopBtn.classList.remove('active');
                    loopBtn.textContent = 'Loop';
                }
            }
            
            console.log('RainfallRadar: Loop mode', isLooping ? 'enabled' : 'disabled');
        }
        
        // Enhanced connection monitoring
        window.addEventListener('online', function() {
            console.log('RainfallRadar: Connection restored');
            isOnline = true;
            updateConnectionStatus('online', 'Connection restored');
            
            // Retry loading if we had errors
            if (errorCount > 0 && retryCount < maxRetries) {
                setTimeout(() => {
                    retryLoad();
                }, 1000);
            }
        });
        
        window.addEventListener('offline', function() {
            console.log('RainfallRadar: Connection lost');
            isOnline = false;
            updateConnectionStatus('offline', 'No internet connection');
        });
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('RainfallRadar: DOM loaded, initializing enhanced radar map');
            loadStartTime = Date.now();
            
            if (!isOnline) {
                showError('No internet connection', 'Please check your connection and try again.');
                return;
            }
            
            initMap();
        });
        
        // Auto-refresh radar data every 10 minutes
        setInterval(function() {
            if (isOnline && errorCount < 5) {
                console.log('RainfallRadar: Auto-refreshing radar data');
                loadRadarData();
            }
        }, 10 * 60 * 1000);
        
        // Enhanced global error handlers
        window.addEventListener('error', function(event) {
            console.error('RainfallRadar: Global error:', event.error);
            errorCount++;
            sendMessage({
                type: 'globalError',
                error: event.error?.message || 'Unknown error',
                filename: event.filename,
                lineno: event.lineno,
                errorCount: errorCount
            });
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            console.error('RainfallRadar: Unhandled promise rejection:', event.reason);
            errorCount++;
            sendMessage({
                type: 'promiseRejection',
                reason: event.reason?.message || event.reason,
                errorCount: errorCount
            });
        });
        
        // Expose retry function globally
        window.retryLoad = retryLoad;
        
    </script>
</body>
</html>`;
  }, [circuitName, latitude, longitude, autoStartAnimation]);

  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: WebView loaded successfully');
    setIsLoading(false);
    setHasError(false);
    setLastSuccessfulLoad(new Date());
  }, []);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('RainfallRadar: WebView error:', syntheticEvent.nativeEvent);
    setIsLoading(false);
    setHasError(true);
    setRetryCount(prev => prev + 1);
  }, []);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Received message from WebView:', message);
      
      switch (message.type) {
        case 'error':
        case 'loadError':
        case 'globalError':
        case 'promiseRejection':
          console.error('RainfallRadar: Error from WebView:', message);
          setHasError(true);
          setRetryCount(message.retryCount || 0);
          break;
        case 'framesLoaded':
          setTotalFrames(message.totalFrames);
          setCurrentFrame(message.currentFrame);
          setHasError(false);
          setLastSuccessfulLoad(new Date());
          break;
        case 'frameChanged':
          setCurrentFrame(message.currentFrame);
          break;
        case 'animationStarted':
          setIsAnimating(true);
          setAnimationSpeed(message.speed);
          break;
        case 'animationStopped':
          setIsAnimating(false);
          break;
        case 'maxRetriesReached':
          setHasError(true);
          setRetryCount(message.retryCount);
          break;
      }
    } catch (error) {
      console.log('RainfallRadar: Non-JSON message from WebView:', event.nativeEvent.data);
    }
  }, []);

  const toggleRadarView = useCallback(() => {
    console.log('RainfallRadar: Toggling radar view from', showRadar, 'to', !showRadar);
    if (!alwaysVisible) {
      setShowRadar(!showRadar);
      if (!showRadar) {
        setIsLoading(true);
        setHasError(false);
        setRetryCount(0);
      }
    }
  }, [showRadar, alwaysVisible]);

  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Refreshing radar');
    if (webViewRef.current) {
      webViewRef.current.reload();
      setIsLoading(true);
      setHasError(false);
      setIsAnimating(false);
      setCurrentFrame(0);
      setTotalFrames(0);
      setRetryCount(0);
    }
  }, []);

  const toggleAnimation = useCallback(() => {
    console.log('RainfallRadar: Toggling animation from React Native');
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleAnimation'
      }));
    }
  }, []);

  // Validate props
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    console.error('RainfallRadar: Invalid coordinates provided:', { latitude, longitude });
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Rainfall Radar</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="warning" size={32} color={colors.error} />
          <Text style={styles.errorText}>Invalid location data</Text>
          <Text style={styles.errorSubtext}>Cannot display radar for this circuit</Text>
        </View>
      </View>
    );
  }

  // When alwaysVisible is true, always show the radar
  if (!showRadar && !alwaysVisible) {
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
          <Animated.View style={[styles.previewIcon, pulseStyle]}>
            <Icon name="cloud-outline" size={48} color={colors.textMuted} />
          </Animated.View>
          <Text style={styles.previewTitle}>Animated Rainfall Radar</Text>
          <Text style={styles.previewDescription}>
            View real-time precipitation data and animated forecasts for {circuitName}
          </Text>
          <Text style={styles.previewFeatures}>
            • Live radar animation{'\n'}
            • 12-hour historical data{'\n'}
            • Adjustable playback speed{'\n'}
            • Loop and timeline controls{'\n'}
            • Satellite view option{'\n'}
            • Enhanced error handling{'\n'}
            • Automatic retry on failure
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
          <Text style={styles.title}>Live Rainfall Radar</Text>
          <Text style={styles.subtitle}>{circuitName}</Text>
          {alwaysVisible && (
            <View style={styles.alwaysOnBadge}>
              <Text style={styles.alwaysOnText}>Always On</Text>
            </View>
          )}
          {retryCount > 0 && (
            <View style={styles.retryBadge}>
              <Text style={styles.retryText}>Retry {retryCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.controls}>
          {totalFrames > 1 && (
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
            <Icon name="refresh" size={16} color={colors.text} />
          </TouchableOpacity>
          {!alwaysVisible && (
            <TouchableOpacity onPress={toggleRadarView} style={styles.controlButton}>
              <Icon name="close" size={16} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {totalFrames > 1 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressText}>
            Frame {currentFrame + 1} of {totalFrames}
            {isAnimating && (
              <Text style={styles.animatingText}> • Animating</Text>
            )}
            {autoStartAnimation && !isAnimating && totalFrames > 1 && !hasError && (
              <Text style={styles.autoStartText}> • Auto-starting...</Text>
            )}
            {hasError && retryCount > 0 && (
              <Text style={styles.errorText}> • Error (Retry {retryCount})</Text>
            )}
          </Text>
        </View>
      )}

      {isLoading && (
        <Animated.View style={[styles.loadingContainer, pulseStyle]}>
          <Icon name="cloud-download" size={32} color={colors.textMuted} />
          <Text style={styles.loadingText}>
            {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Loading radar data...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {alwaysVisible ? 'Enhanced always-on radar' : 'Powered by RainViewer'}
          </Text>
          {lastSuccessfulLoad && (
            <Text style={styles.lastUpdateText}>
              Last update: {lastSuccessfulLoad.toLocaleTimeString()}
            </Text>
          )}
        </Animated.View>
      )}

      {hasError && (
        <View style={styles.errorContainer}>
          <Icon name="cloud-offline" size={32} color={colors.error} />
          <Text style={styles.errorText}>
            {retryCount >= 3 ? 'Max retries reached' : 'Failed to load radar'}
          </Text>
          <Text style={styles.errorSubtext}>
            {retryCount >= 3 
              ? 'Please check your internet connection and refresh' 
              : 'Checking connection and retrying...'}
          </Text>
          {retryCount < 3 && (
            <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry Now</Text>
            </TouchableOpacity>
          )}
          {lastSuccessfulLoad && (
            <Text style={styles.lastUpdateText}>
              Last successful load: {lastSuccessfulLoad.toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.webViewContainer, { opacity: isLoading || hasError ? 0 : 1 }]}>
        <WebView
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
          incognito={true}
          thirdPartyCookiesEnabled={false}
          sharedCookiesEnabled={false}
          textZoom={100}
          allowsLinkPreview={false}
          allowFileAccess={false}
          allowUniversalAccessFromFileURLs={false}
          allowFileAccessFromFileURLs={false}
          setSupportMultipleWindows={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyboardDisplayRequiresUserAction={false}
          hideKeyboardAccessoryView={true}
          allowsBackForwardNavigationGestures={false}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {alwaysVisible ? 'Enhanced always-on radar' : 'Real-time radar data'} • Updates every 10 minutes
          {isAnimating && ` • Speed: ${animationSpeed}ms/frame`}
          {retryCount > 0 && ` • Retries: ${retryCount}`}
        </Text>
        <Text style={styles.attribution}>
          Powered by RainViewer & OpenStreetMap • Enhanced error handling
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
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
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
  retryBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  retryText: {
    fontSize: 10,
    color: colors.warning,
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
  progressContainer: {
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  animatingText: {
    color: colors.primary,
    fontWeight: '600',
  },
  autoStartText: {
    color: colors.accent,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    padding: 32,
  },
  previewIcon: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewFeatures: {
    fontSize: 13,
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
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  lastUpdateText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  retryButtonText: {
    color: '#fff',
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
  },
  attribution: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.7,
  },
});

export default RainfallRadar;
