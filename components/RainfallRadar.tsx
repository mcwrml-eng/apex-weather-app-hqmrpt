
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import ErrorBoundary from './ErrorBoundary';
import { colors } from '../styles/commonStyles';

interface Props {
  latitude: number;
  longitude: number;
  circuitName: string;
  alwaysVisible?: boolean;
  autoStartAnimation?: boolean;
}

interface RadarState {
  isLoading: boolean;
  hasError: boolean;
  showRadar: boolean;
  isAnimating: boolean;
  currentFrame: number;
  totalFrames: number;
  retryCount: number;
  errorMessage: string;
  lastSuccessfulLoad: Date | null;
  usesFallback: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000]; // Progressive delays
const DEBOUNCE_DELAY = 1000; // Prevent rapid re-renders

const RainfallRadar: React.FC<Props> = ({ 
  latitude, 
  longitude, 
  circuitName, 
  alwaysVisible = false,
  autoStartAnimation = false 
}) => {
  // Consolidated state to prevent multiple re-renders
  const [state, setState] = useState<RadarState>({
    isLoading: true,
    hasError: false,
    showRadar: alwaysVisible,
    isAnimating: false,
    currentFrame: 0,
    totalFrames: 0,
    retryCount: 0,
    errorMessage: '',
    lastSuccessfulLoad: null,
    usesFallback: false
  });

  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const webViewRef = useRef<WebView>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Animation values
  const pulseAnimation = useSharedValue(0);
  const playButtonRotation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  console.log('RainfallRadar: Rendering with state:', {
    ...state,
    latitude,
    longitude,
    circuitName,
    lastSuccessfulLoad: state.lastSuccessfulLoad?.toISOString()
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Debounced state update function
  const updateState = useCallback((updates: Partial<RadarState>) => {
    if (!mountedRef.current) return;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setState(prevState => ({ ...prevState, ...updates }));
      }
    }, 100); // Small debounce to prevent rapid updates
  }, []);

  // Auto-start animation when frames are loaded
  useEffect(() => {
    if (autoStartAnimation && state.totalFrames > 1 && !state.isAnimating && 
        state.showRadar && !state.hasError && !state.isLoading) {
      console.log('RainfallRadar: Auto-starting animation');
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          toggleAnimation();
        }
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.totalFrames, state.showRadar, autoStartAnimation, state.hasError, state.isLoading]);

  // Animation effects
  useEffect(() => {
    if (state.isLoading) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [state.isLoading]);

  useEffect(() => {
    playButtonRotation.value = withTiming(state.isAnimating ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    });
  }, [state.isAnimating]);

  useEffect(() => {
    if (state.totalFrames > 0) {
      progressAnimation.value = withTiming(state.currentFrame / (state.totalFrames - 1), {
        duration: 200,
        easing: Easing.out(Easing.ease)
      });
    }
  }, [state.currentFrame, state.totalFrames]);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnimation.value, [0, 1], [0.5, 1]),
    transform: [{ scale: interpolate(pulseAnimation.value, [0, 1], [0.95, 1.05]) }]
  }));

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(playButtonRotation.value, [0, 1], [0, 360])}deg` }]
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`
  }));

  // Memoized HTML generation to prevent unnecessary re-renders
  const radarHTML = useMemo(() => {
    console.log('RainfallRadar: Generating optimized HTML');
    
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
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            margin: 0; padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${colors.background};
            color: ${colors.text};
            overflow: hidden;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }
        #map { height: 100vh; width: 100%; position: relative; background-color: #f0f0f0; }
        .loading {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 2000; background: rgba(0, 0, 0, 0.9); color: white;
            padding: 20px; border-radius: 12px; text-align: center;
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .error-message {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 2000; background: rgba(255, 59, 48, 0.95); color: white;
            padding: 20px; border-radius: 12px; text-align: center;
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(255, 59, 48, 0.3); max-width: 300px;
        }
        .fallback-map {
            width: 100%; height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            color: white; text-align: center;
        }
        .fallback-icon { font-size: 48px; margin-bottom: 16px; }
        .fallback-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
        .fallback-description {
            font-size: 14px; opacity: 0.8; max-width: 250px; line-height: 1.4;
        }
        .retry-btn {
            background: rgba(255, 255, 255, 0.2); color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 8px 16px; border-radius: 8px; margin-top: 12px;
            cursor: pointer; transition: all 0.2s ease;
        }
        .retry-btn:hover, .retry-btn:active { background: rgba(255, 255, 255, 0.3); }
        .radar-controls {
            position: absolute; top: 10px; right: 10px; z-index: 1000;
            background: rgba(0, 0, 0, 0.85); border-radius: 8px; padding: 8px;
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .radar-toggle {
            background: ${colors.primary}; color: white; border: none;
            padding: 8px 12px; border-radius: 6px; font-size: 12px;
            cursor: pointer; margin-bottom: 4px; width: 100%;
            transition: all 0.2s ease; -webkit-appearance: none; appearance: none;
        }
        .radar-toggle:hover, .radar-toggle:active { opacity: 0.8; transform: scale(0.98); }
        .radar-toggle.active { background: ${colors.accent}; box-shadow: 0 0 10px rgba(0, 122, 255, 0.3); }
        .animation-controls { display: flex; gap: 4px; margin-top: 8px; }
        .animation-btn {
            background: ${colors.secondary}; color: white; border: none;
            padding: 6px 8px; border-radius: 4px; font-size: 11px;
            cursor: pointer; flex: 1; transition: all 0.2s ease;
            -webkit-appearance: none; appearance: none;
        }
        .animation-btn:hover, .animation-btn:active { opacity: 0.8; }
        .animation-btn.active { background: ${colors.accent}; }
        .time-slider {
            width: 100%; margin-top: 8px; -webkit-appearance: none; appearance: none;
            height: 4px; border-radius: 2px; background: rgba(255, 255, 255, 0.3); outline: none;
        }
        .time-slider::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none; width: 16px; height: 16px;
            border-radius: 50%; background: ${colors.primary}; cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .time-slider::-moz-range-thumb {
            width: 16px; height: 16px; border-radius: 50%; background: ${colors.primary};
            cursor: pointer; border: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .frame-info {
            font-size: 10px; color: rgba(255, 255, 255, 0.8);
            text-align: center; margin-top: 4px;
        }
        .legend {
            position: absolute; bottom: 10px; left: 10px; z-index: 1000;
            background: rgba(0, 0, 0, 0.85); border-radius: 8px; padding: 8px;
            font-size: 11px; color: white; backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px); transition: opacity 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .legend-title { font-weight: bold; margin-bottom: 4px; }
        .legend-item { display: flex; align-items: center; margin-bottom: 2px; }
        .legend-color { width: 12px; height: 12px; margin-right: 6px; border-radius: 2px; }
        .connection-status {
            position: absolute; top: 10px; left: 10px; z-index: 1000;
            background: rgba(0, 0, 0, 0.8); color: white; padding: 6px 10px;
            border-radius: 6px; font-size: 10px; backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .status-online { background: rgba(52, 199, 89, 0.9); }
        .status-offline { background: rgba(255, 59, 48, 0.9); }
        .status-loading { background: rgba(255, 149, 0, 0.9); }
    </style>
</head>
<body>
    <div id="connectionStatus" class="connection-status status-loading">Initializing...</div>
    
    <div id="loading" class="loading">
        <div style="font-size: 16px; margin-bottom: 8px;">🌧️</div>
        <div>Loading rainfall radar...</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">Optimized loading</div>
    </div>
    
    <div id="error" class="error-message" style="display: none;">
        <div style="font-size: 16px; margin-bottom: 8px;">⚠️</div>
        <div id="errorTitle">Service Unavailable</div>
        <div id="errorMessage" style="font-size: 12px; margin-top: 8px;">Radar service is temporarily unavailable</div>
        <button class="retry-btn" onclick="retryLoad()">Try Again</button>
    </div>
    
    <div id="map">
        <div id="fallbackMap" class="fallback-map" style="display: none;">
            <div class="fallback-icon">🗺️</div>
            <div class="fallback-title">Radar Unavailable</div>
            <div class="fallback-description">
                The rainfall radar service is currently unavailable.
                <br><br>
                <strong>${safeCircuitName}</strong><br>
                Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}
            </div>
        </div>
    </div>
    
    <div class="radar-controls" id="radarControls" style="display: none;">
        <button id="radarToggle" class="radar-toggle active">Radar Active</button>
        <button id="satelliteToggle" class="radar-toggle">Satellite View</button>
        
        <div class="animation-controls" id="animationControls">
            <button id="playPauseBtn" class="animation-btn">▶</button>
            <button id="speedBtn" class="animation-btn">1x</button>
            <button id="loopBtn" class="animation-btn active">Loop ✓</button>
        </div>
        
        <input type="range" id="timeSlider" class="time-slider" min="0" max="11" value="11">
        <div id="frameInfo" class="frame-info">Frame 1 of 12</div>
    </div>
    
    <div class="legend" id="legend" style="display: none;">
        <div class="legend-title">Rainfall Intensity</div>
        <div class="legend-item"><div class="legend-color" style="background: #00ff00;"></div><span>Light</span></div>
        <div class="legend-item"><div class="legend-color" style="background: #ffff00;"></div><span>Moderate</span></div>
        <div class="legend-item"><div class="legend-color" style="background: #ff8000;"></div><span>Heavy</span></div>
        <div class="legend-item"><div class="legend-color" style="background: #ff0000;"></div><span>Very Heavy</span></div>
        <div class="legend-item"><div class="legend-color" style="background: #8000ff;"></div><span>Extreme</span></div>
    </div>

    <script>
        console.log('RainfallRadar: Starting optimized radar initialization');
        
        let map = null;
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
        let connectionTimeout = 15000; // Reduced timeout
        let isOnline = navigator.onLine;
        let leafletLoaded = false;
        let usesFallback = false;
        let loadStartTime = Date.now();
        let lastError = null;
        let errorCount = 0;
        let isInitialized = false;
        
        // Debounce function to prevent rapid API calls
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
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
                        errorCount: errorCount,
                        usesFallback: usesFallback
                    });
                    window.ReactNativeWebView.postMessage(message);
                    console.log('RainfallRadar: Sent message:', data.type);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
        
        function updateConnectionStatus(status, message) {
            const statusEl = document.getElementById('connectionStatus');
            if (statusEl) {
                statusEl.className = 'connection-status status-' + status;
                statusEl.textContent = message || status;
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
                    errorMessage.textContent = details || 'Service temporarily unavailable';
                }
            }
            
            updateConnectionStatus('offline', 'Service unavailable');
            
            // Show fallback after multiple failures
            if (retryCount >= 2) {
                setTimeout(() => showFallbackMap(), 2000);
            }
        }
        
        function hideError() {
            const error = document.getElementById('error');
            if (error) error.style.display = 'none';
            updateConnectionStatus('online', 'Connected');
        }
        
        function showFallbackMap() {
            console.log('RainfallRadar: Showing fallback map');
            const fallbackMap = document.getElementById('fallbackMap');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            
            if (fallbackMap) fallbackMap.style.display = 'flex';
            if (loading) loading.style.display = 'none';
            if (error) error.style.display = 'none';
            
            usesFallback = true;
            updateConnectionStatus('offline', 'Using fallback');
            
            sendMessage({
                type: 'fallbackShown',
                reason: 'Service unavailable',
                retryCount: retryCount
            });
        }
        
        function hideFallbackMap() {
            const fallbackMap = document.getElementById('fallbackMap');
            if (fallbackMap) fallbackMap.style.display = 'none';
            usesFallback = false;
        }
        
        // Progressive retry with exponential backoff
        const debouncedRetry = debounce(function() {
            if (retryCount < maxRetries && !isInitialized) {
                retryCount++;
                console.log('RainfallRadar: Retry attempt', retryCount);
                hideError();
                hideFallbackMap();
                
                const loading = document.getElementById('loading');
                if (loading) {
                    loading.style.display = 'block';
                    loading.querySelector('div').textContent = \`Retrying... (\${retryCount}/\${maxRetries})\`;
                }
                
                updateConnectionStatus('loading', \`Retry \${retryCount}/\${maxRetries}\`);
                
                // Clear existing data
                radarData = [];
                currentFrame = 0;
                if (radarLayer && map) {
                    map.removeLayer(radarLayer);
                    radarLayer = null;
                }
                
                // Progressive delay
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
                setTimeout(() => {
                    if (leafletLoaded) {
                        loadRadarData();
                    } else {
                        initMap();
                    }
                }, delay);
            } else {
                showError('Service Unavailable', 'Please try again later');
                showFallbackMap();
                sendMessage({
                    type: 'maxRetriesReached',
                    retryCount: retryCount
                });
            }
        }, 2000);
        
        window.retryLoad = debouncedRetry;
        
        // Load Leaflet with timeout
        function loadLeaflet() {
            return new Promise((resolve, reject) => {
                if (window.L) {
                    leafletLoaded = true;
                    resolve();
                    return;
                }
                
                const timeout = setTimeout(() => {
                    reject(new Error('Leaflet load timeout'));
                }, 10000);
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                link.onload = () => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = () => {
                        clearTimeout(timeout);
                        leafletLoaded = true;
                        resolve();
                    };
                    script.onerror = () => {
                        clearTimeout(timeout);
                        reject(new Error('Leaflet script failed'));
                    };
                    document.head.appendChild(script);
                };
                link.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Leaflet CSS failed'));
                };
                document.head.appendChild(link);
            });
        }
        
        // Initialize map with better error handling
        async function initMap() {
            if (isInitialized) return;
            
            try {
                console.log('RainfallRadar: Initializing optimized map');
                await loadLeaflet();
                
                const lat = parseFloat(${latitude});
                const lng = parseFloat(${longitude});
                
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinates');
                }
                
                map = L.map('map', {
                    center: [lat, lng],
                    zoom: 8,
                    zoomControl: true,
                    attributionControl: true,
                    preferCanvas: true,
                    maxZoom: 18,
                    minZoom: 3
                });
                
                // Base layer with error handling
                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap',
                    maxZoom: 18,
                    timeout: 10000,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzMzMyIvPjwvc3ZnPg=='
                });
                
                osmLayer.addTo(map);
                
                // Circuit marker
                const circuitIcon = L.divIcon({
                    html: '<div style="background: ${colors.primary}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                    className: 'circuit-marker'
                });
                
                L.marker([lat, lng], { icon: circuitIcon })
                    .addTo(map)
                    .bindPopup('<b>${safeCircuitName}</b><br>Racing Circuit')
                    .openPopup();
                
                // Event listeners
                const timeSlider = document.getElementById('timeSlider');
                const playPauseBtn = document.getElementById('playPauseBtn');
                const speedBtn = document.getElementById('speedBtn');
                const loopBtn = document.getElementById('loopBtn');
                
                if (timeSlider) timeSlider.addEventListener('input', updateRadarFrame);
                if (playPauseBtn) playPauseBtn.addEventListener('click', toggleAnimation);
                if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);
                if (loopBtn) loopBtn.addEventListener('click', toggleLoop);
                
                isInitialized = true;
                await loadRadarData();
                
                const loading = document.getElementById('loading');
                if (loading) loading.style.display = 'none';
                
                hideError();
                hideFallbackMap();
                updateConnectionStatus('online', 'Map loaded');
                
                console.log('RainfallRadar: Map initialized successfully');
                
            } catch (error) {
                console.error('RainfallRadar: Map initialization failed:', error);
                showError('Map Failed', error.message);
                setTimeout(() => showFallbackMap(), 3000);
            }
        }
        
        // Load radar data with improved error handling
        async function loadRadarData() {
            console.log('RainfallRadar: Loading radar data');
            updateConnectionStatus('loading', 'Loading radar...');
            
            const apiUrls = [
                'https://api.rainviewer.com/public/weather-maps.json'
            ];
            
            for (let i = 0; i < apiUrls.length; i++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), connectionTimeout);
                    
                    const response = await fetch(apiUrls[i], {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        mode: 'cors'
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(\`HTTP \${response.status}\`);
                    }
                    
                    const data = await response.json();
                    
                    if (data?.radar?.past) {
                        radarData = data.radar.past.concat(data.radar.nowcast || []);
                        
                        if (radarData.length > 0) {
                            currentFrame = radarData.length - 1;
                            const slider = document.getElementById('timeSlider');
                            if (slider) {
                                slider.max = radarData.length - 1;
                                slider.value = currentFrame;
                            }
                            updateFrameInfo();
                            showRadarFrame(currentFrame);
                            
                            // Show controls
                            const controls = ['legend', 'animationControls', 'frameInfo', 'timeSlider', 'radarControls'];
                            controls.forEach(id => {
                                const el = document.getElementById(id);
                                if (el) el.style.display = id === 'animationControls' ? 'flex' : 'block';
                            });
                            
                            sendMessage({
                                type: 'framesLoaded',
                                totalFrames: radarData.length,
                                currentFrame: currentFrame,
                                loadTime: Date.now() - loadStartTime
                            });
                            
                            updateConnectionStatus('online', \`\${radarData.length} frames\`);
                            
                            // Auto-start if requested
                            if (autoStartRequested && radarData.length > 1) {
                                setTimeout(() => startAnimation(), 1500);
                            }
                            
                            retryCount = 0;
                            errorCount = 0;
                            return;
                        }
                    }
                    
                    throw new Error('No radar data available');
                    
                } catch (error) {
                    console.error('RainfallRadar: API error:', error);
                    
                    if (i === apiUrls.length - 1) {
                        let errorMessage = 'Service Unavailable';
                        let errorDetails = 'Unable to connect to radar service';
                        
                        if (error.name === 'AbortError') {
                            errorMessage = 'Connection Timeout';
                            errorDetails = 'Request timed out';
                        } else if (error.message.includes('HTTP')) {
                            errorMessage = 'Service Error';
                            errorDetails = error.message;
                        }
                        
                        showError(errorMessage, errorDetails);
                        
                        sendMessage({
                            type: 'loadError',
                            error: errorMessage,
                            details: errorDetails,
                            retryCount: retryCount,
                            canRetry: retryCount < maxRetries
                        });
                        
                        if (retryCount < maxRetries) {
                            setTimeout(() => debouncedRetry(), 3000);
                        } else {
                            showFallbackMap();
                        }
                    }
                }
            }
        }
        
        function showRadarFrame(frameIndex) {
            try {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) return;
                
                if (radarLayer) {
                    map.removeLayer(radarLayer);
                }
                
                const frame = radarData[frameIndex];
                if (!frame?.path) return;
                
                const radarUrl = 'https://tilecache.rainviewer.com/v2/radar/' + frame.path + '/256/{z}/{x}/{y}/2/1_1.png';
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: 0.6,
                    attribution: 'Radar © RainViewer',
                    timeout: 8000,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0idHJhbnNwYXJlbnQiLz48L3N2Zz4='
                });
                
                radarLayer.addTo(map);
                currentFrame = frameIndex;
                
                const slider = document.getElementById('timeSlider');
                if (slider) slider.value = frameIndex;
                
                updateFrameInfo();
                
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length
                });
                
            } catch (error) {
                console.error('Failed to show radar frame:', error);
            }
        }
        
        function updateRadarFrame(event) {
            const frameIndex = parseInt(event.target.value);
            if (!isNaN(frameIndex)) {
                showRadarFrame(frameIndex);
            }
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
            if (isAnimating) {
                stopAnimation();
            } else {
                startAnimation();
            }
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
            
            sendMessage({ type: 'animationStarted', speed: animationSpeed });
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
            
            sendMessage({ type: 'animationStopped' });
        }
        
        const speeds = [
            { label: '0.5x', value: 2000 },
            { label: '1x', value: 1000 },
            { label: '2x', value: 500 },
            { label: '4x', value: 250 }
        ];
        let currentSpeedIndex = 1;
        
        function cycleSpeed() {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            animationSpeed = speeds[currentSpeedIndex].value;
            
            const speedBtn = document.getElementById('speedBtn');
            if (speedBtn) {
                speedBtn.textContent = speeds[currentSpeedIndex].label;
            }
            
            if (isAnimating) {
                stopAnimation();
                startAnimation();
            }
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
        }
        
        // Connection monitoring
        window.addEventListener('online', function() {
            isOnline = true;
            updateConnectionStatus('online', 'Connection restored');
            if (errorCount > 0 && retryCount < maxRetries) {
                setTimeout(() => debouncedRetry(), 2000);
            }
        });
        
        window.addEventListener('offline', function() {
            isOnline = false;
            updateConnectionStatus('offline', 'No connection');
        });
        
        // Initialize when DOM loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('RainfallRadar: DOM loaded, initializing');
            loadStartTime = Date.now();
            
            if (!isOnline) {
                showError('No Internet', 'Check connection and try again');
                setTimeout(() => showFallbackMap(), 3000);
                return;
            }
            
            initMap();
        });
        
        // Auto-refresh every 20 minutes (less frequent)
        setInterval(function() {
            if (isOnline && errorCount < 2 && !usesFallback && radarData.length > 0) {
                console.log('RainfallRadar: Auto-refreshing');
                loadRadarData();
            }
        }, 20 * 60 * 1000);
        
        // Global error handlers
        window.addEventListener('error', function(event) {
            console.error('Global error:', event.error);
            errorCount++;
            sendMessage({
                type: 'globalError',
                error: event.error?.message || 'Unknown error',
                errorCount: errorCount
            });
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled rejection:', event.reason);
            errorCount++;
            sendMessage({
                type: 'promiseRejection',
                reason: event.reason?.message || event.reason,
                errorCount: errorCount
            });
        });
        
    </script>
</body>
</html>`;
  }, [circuitName, latitude, longitude, autoStartAnimation]);

  // Event handlers with proper error handling
  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: WebView loaded successfully');
    updateState({
      isLoading: false,
      hasError: false,
      lastSuccessfulLoad: new Date(),
      errorMessage: ''
    });
  }, [updateState]);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('RainfallRadar: WebView error:', syntheticEvent.nativeEvent);
    updateState({
      isLoading: false,
      hasError: true,
      retryCount: state.retryCount + 1,
      errorMessage: 'WebView failed to load'
    });
  }, [updateState, state.retryCount]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Message from WebView:', message.type);
      
      switch (message.type) {
        case 'error':
        case 'loadError':
        case 'globalError':
        case 'promiseRejection':
          updateState({
            hasError: true,
            retryCount: message.retryCount || state.retryCount,
            errorMessage: message.error || 'Service error'
          });
          break;
        case 'framesLoaded':
          updateState({
            totalFrames: message.totalFrames,
            currentFrame: message.currentFrame,
            hasError: false,
            lastSuccessfulLoad: new Date(),
            errorMessage: '',
            isLoading: false
          });
          break;
        case 'frameChanged':
          updateState({ currentFrame: message.currentFrame });
          break;
        case 'animationStarted':
          updateState({ isAnimating: true });
          setAnimationSpeed(message.speed);
          break;
        case 'animationStopped':
          updateState({ isAnimating: false });
          break;
        case 'maxRetriesReached':
          updateState({
            hasError: true,
            retryCount: message.retryCount,
            errorMessage: 'Service unavailable after retries'
          });
          break;
        case 'fallbackShown':
          updateState({
            hasError: true,
            usesFallback: true,
            errorMessage: 'Using fallback map'
          });
          break;
      }
    } catch (error) {
      console.log('RainfallRadar: Non-JSON message from WebView');
    }
  }, [updateState, state.retryCount]);

  const toggleRadarView = useCallback(() => {
    if (!alwaysVisible) {
      const newShowRadar = !state.showRadar;
      updateState({
        showRadar: newShowRadar,
        isLoading: newShowRadar,
        hasError: false,
        retryCount: 0,
        errorMessage: ''
      });
    }
  }, [state.showRadar, alwaysVisible, updateState]);

  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Manual refresh');
    if (webViewRef.current) {
      webViewRef.current.reload();
      updateState({
        isLoading: true,
        hasError: false,
        isAnimating: false,
        currentFrame: 0,
        totalFrames: 0,
        retryCount: 0,
        errorMessage: ''
      });
    }
  }, [updateState]);

  const toggleAnimation = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'toggleAnimation' }));
    }
  }, []);

  // Validate props
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  // Preview state when not visible
  if (!state.showRadar && !alwaysVisible) {
    return (
      <ErrorBoundary>
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
            <Text style={styles.previewTitle}>Enhanced Rainfall Radar</Text>
            <Text style={styles.previewDescription}>
              View optimized real-time precipitation data for {circuitName}
            </Text>
            <Text style={styles.previewFeatures}>
              • Improved error handling{'\n'}
              • Automatic retry with fallback{'\n'}
              • Debounced loading{'\n'}
              • Memory leak prevention{'\n'}
              • Progressive retry delays{'\n'}
              • Enhanced user feedback
            </Text>
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Enhanced Rainfall Radar</Text>
            <Text style={styles.subtitle}>{circuitName}</Text>
            {alwaysVisible && (
              <View style={styles.alwaysOnBadge}>
                <Text style={styles.alwaysOnText}>Always On</Text>
              </View>
            )}
            {state.retryCount > 0 && (
              <View style={styles.retryBadge}>
                <Text style={styles.retryText}>Retry {state.retryCount}</Text>
              </View>
            )}
            {state.usesFallback && (
              <View style={styles.fallbackBadge}>
                <Text style={styles.fallbackText}>Fallback</Text>
              </View>
            )}
          </View>
          <View style={styles.controls}>
            {state.totalFrames > 1 && (
              <TouchableOpacity onPress={toggleAnimation} style={styles.animationButton}>
                <Animated.View style={playButtonStyle}>
                  <Icon 
                    name={state.isAnimating ? "pause" : "play"} 
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

        {state.totalFrames > 1 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.progressText}>
              Frame {state.currentFrame + 1} of {state.totalFrames}
              {state.isAnimating && (
                <Text style={styles.animatingText}> • Animating</Text>
              )}
              {state.hasError && state.retryCount > 0 && (
                <Text style={styles.errorText}> • Error (Retry {state.retryCount})</Text>
              )}
              {state.usesFallback && (
                <Text style={styles.fallbackText}> • Using Fallback</Text>
              )}
            </Text>
          </View>
        )}

        {state.isLoading && (
          <Animated.View style={[styles.loadingContainer, pulseStyle]}>
            <Icon name="cloud-download" size={32} color={colors.textMuted} />
            <Text style={styles.loadingText}>
              {state.retryCount > 0 ? `Retrying... (${state.retryCount}/${MAX_RETRIES})` : 'Loading optimized radar...'}
            </Text>
            <Text style={styles.loadingSubtext}>
              Enhanced error handling and performance
            </Text>
            {state.lastSuccessfulLoad && (
              <Text style={styles.lastUpdateText}>
                Last update: {state.lastSuccessfulLoad.toLocaleTimeString()}
              </Text>
            )}
          </Animated.View>
        )}

        {state.hasError && !state.isLoading && (
          <View style={styles.errorContainer}>
            <Icon name="cloud-offline" size={32} color={colors.error} />
            <Text style={styles.errorText}>
              {state.retryCount >= MAX_RETRIES ? 'Service Unavailable' : 'Connection Error'}
            </Text>
            <Text style={styles.errorSubtext}>
              {state.errorMessage || (state.retryCount >= MAX_RETRIES 
                ? 'Radar service is temporarily unavailable. Fallback map may be shown.' 
                : 'Attempting to reconnect with improved error handling...')}
            </Text>
            {state.retryCount < MAX_RETRIES && (
              <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry Now</Text>
              </TouchableOpacity>
            )}
            {state.lastSuccessfulLoad && (
              <Text style={styles.lastUpdateText}>
                Last successful load: {state.lastSuccessfulLoad.toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}

        <View style={[styles.webViewContainer, { opacity: state.isLoading ? 0.3 : 1 }]}>
          <WebView
            ref={webViewRef}
            source={{ html: radarHTML }}
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
            incognito={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
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
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Enhanced radar with improved error handling • Updates every 20 minutes
            {state.isAnimating && ` • Speed: ${animationSpeed}ms/frame`}
            {state.retryCount > 0 && ` • Retries: ${state.retryCount}`}
          </Text>
          <Text style={styles.attribution}>
            Powered by RainViewer & OpenStreetMap • Optimized for reliability
          </Text>
        </View>
      </View>
    </ErrorBoundary>
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
  fallbackBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  fallbackText: {
    fontSize: 10,
    color: colors.error,
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
    padding: 20,
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
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
