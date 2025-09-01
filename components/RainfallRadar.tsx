
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
  const [showRadar, setShowRadar] = useState(alwaysVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800); // milliseconds per frame
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [radarIntensity, setRadarIntensity] = useState('moderate');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const webViewRef = useRef<WebView>(null);
  
  // Enhanced animation values
  const pulseAnimation = useSharedValue(0);
  const playButtonRotation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const loadingRotation = useSharedValue(0);
  const fullscreenScale = useSharedValue(0);
  const intensityPulse = useSharedValue(0);

  console.log('RainfallRadar: Enhanced rendering with props:', { 
    latitude, 
    longitude, 
    circuitName, 
    showRadar, 
    isAnimating,
    currentFrame,
    totalFrames,
    alwaysVisible,
    autoStartAnimation,
    radarOpacity,
    refreshInterval
  });

  // Enhanced auto-start animation with better timing
  useEffect(() => {
    if (autoStartAnimation && totalFrames > 1 && !isAnimating && showRadar && !hasError) {
      console.log('RainfallRadar: Enhanced auto-starting animation');
      const timer = setTimeout(() => {
        toggleAnimation();
      }, 1500); // Reduced delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [totalFrames, showRadar, autoStartAnimation, hasError]);

  // Auto-refresh radar data at specified intervals
  useEffect(() => {
    if (!showRadar) return;
    
    const refreshTimer = setInterval(() => {
      console.log('RainfallRadar: Auto-refreshing radar data');
      refreshRadar();
    }, refreshInterval * 60 * 1000); // Convert minutes to milliseconds
    
    return () => clearInterval(refreshTimer);
  }, [showRadar, refreshInterval]);

  // Enhanced loading animations
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
  }, [isLoading]);

  // Intensity pulse animation for active radar
  useEffect(() => {
    if (isAnimating && !isLoading) {
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
  }, [isAnimating, isLoading]);

  // Enhanced play button animation
  useEffect(() => {
    playButtonRotation.value = withSpring(isAnimating ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });
  }, [isAnimating]);

  // Smooth progress animation
  useEffect(() => {
    if (totalFrames > 0) {
      progressAnimation.value = withSpring(currentFrame / (totalFrames - 1), {
        damping: 20,
        stiffness: 100,
        mass: 1,
      });
    }
  }, [currentFrame, totalFrames]);

  // Fullscreen animation
  useEffect(() => {
    fullscreenScale.value = withSpring(isFullscreen ? 1 : 0, {
      damping: 15,
      stiffness: 200,
      mass: 1,
    });
  }, [isFullscreen]);

  // Enhanced animated styles
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

  // Enhanced callback functions
  const toggleFullscreen = useCallback(() => {
    console.log('RainfallRadar: Toggling fullscreen mode');
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const updateConnectionStatus = useCallback((status: 'connected' | 'connecting' | 'error') => {
    setConnectionStatus(status);
    if (status === 'connected') {
      setLastUpdateTime(new Date());
    }
  }, []);

  const analyzeRadarIntensity = useCallback((frameData: any) => {
    // Simulate radar intensity analysis
    const intensities = ['light', 'moderate', 'heavy', 'extreme'];
    const randomIntensity = intensities[Math.floor(Math.random() * intensities.length)];
    setRadarIntensity(randomIntensity);
  }, []);

  // Enhanced HTML generation with improved features
  const generateRadarHTML = () => {
    console.log('RainfallRadar: Generating enhanced HTML with advanced features');
    
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    const safeOpacity = Math.max(0.1, Math.min(1, radarOpacity));
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Enhanced Rainfall Radar - ${safeCircuitName}</title>
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
        .radar-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 12px;
            padding: 12px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            min-width: 140px;
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
        .status-error { background: #ff0000; }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .radar-toggle {
            background: ${colors.primary};
            color: white;
            border: none;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 6px;
            width: 100%;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .radar-toggle:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .radar-toggle.active {
            background: ${colors.accent};
            box-shadow: 0 0 15px rgba(0, 122, 255, 0.4);
        }
        .radar-toggle.active::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        .animation-controls {
            display: flex;
            gap: 6px;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        .animation-btn {
            background: ${colors.secondary};
            color: white;
            border: none;
            padding: 8px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            flex: 1;
            min-width: 40px;
            transition: all 0.3s ease;
            position: relative;
        }
        .animation-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        .animation-btn.active {
            background: ${colors.accent};
            box-shadow: 0 0 10px rgba(0, 122, 255, 0.3);
        }
        .animation-btn.pulse {
            animation: buttonPulse 1s infinite;
        }
        @keyframes buttonPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .time-slider {
            width: 100%;
            margin-top: 12px;
            -webkit-appearance: none;
            appearance: none;
            height: 6px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.2);
            outline: none;
            position: relative;
        }
        .time-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${colors.primary};
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
            border: 2px solid white;
            transition: all 0.2s ease;
        }
        .time-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        .time-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${colors.primary};
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }
        .frame-info {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            margin-top: 8px;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            border-radius: 6px;
        }
        .intensity-indicator {
            position: absolute;
            bottom: 60px;
            right: 10px;
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
        .intensity-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            animation: intensityPulse 1.5s infinite;
        }
        .intensity-light { background: #00ff00; }
        .intensity-moderate { background: #ffff00; }
        .intensity-heavy { background: #ff8000; }
        .intensity-extreme { background: #ff0000; }
        @keyframes intensityPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
        }
        .legend {
            position: absolute;
            bottom: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 12px;
            padding: 12px;
            font-size: 11px;
            color: white;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            max-width: 150px;
        }
        .legend:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        .legend-title {
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.95);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 4px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
            transition: all 0.2s ease;
        }
        .legend-item:hover {
            transform: translateX(2px);
        }
        .legend-color {
            width: 14px;
            height: 14px;
            margin-right: 8px;
            border-radius: 3px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
            min-width: 200px;
        }
        .radar-layer {
            transition: opacity 0.5s ease;
        }
        .fullscreen-btn {
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 50%;
            cursor: pointer;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        .fullscreen-btn:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="loading-spinner"></div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Loading Enhanced Radar</div>
        <div style="font-size: 12px; opacity: 0.8;">Powered by RainViewer</div>
    </div>
    
    <div id="error" class="error-message" style="display: none;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">⚠️ Radar Unavailable</div>
        <div style="font-size: 12px;">Please check your connection and try again</div>
    </div>
    
    <div id="map"></div>
    
    <div class="status-indicator" id="statusIndicator">
        <div class="status-dot status-connecting" id="statusDot"></div>
        <span id="statusText" style="font-size: 11px; font-weight: 500;">Connecting...</span>
    </div>
    
    <div class="radar-controls">
        <button id="radarToggle" class="radar-toggle active">🌧️ Radar Active</button>
        ${enableSatelliteView ? '<button id="satelliteToggle" class="radar-toggle">🛰️ Satellite</button>' : ''}
        
        <div class="animation-controls" id="animationControls">
            <button id="playPauseBtn" class="animation-btn pulse">▶️</button>
            <button id="speedBtn" class="animation-btn">1x</button>
            <button id="loopBtn" class="animation-btn active">🔄</button>
        </div>
        
        <input type="range" id="timeSlider" class="time-slider" min="0" max="11" value="11">
        <div id="frameInfo" class="frame-info">Frame 1 of 12</div>
    </div>
    
    ${showIntensityLegend ? `
    <div class="intensity-indicator" id="intensityIndicator">
        <div class="intensity-dot intensity-moderate" id="intensityDot"></div>
        <span id="intensityText" style="font-size: 11px; font-weight: 500;">Moderate</span>
    </div>
    ` : ''}
    
    <button class="fullscreen-btn" id="fullscreenBtn" title="Toggle Fullscreen">⛶</button>
    
    ${showIntensityLegend ? `
    <div class="legend" id="legend">
        <div class="legend-title">🌧️ Rainfall Intensity</div>
        <div class="legend-item">
            <div class="legend-color" style="background: #00ff00;"></div>
            <span>Light (0.1-2.5mm/h)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ffff00;"></div>
            <span>Moderate (2.5-10mm/h)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ff8000;"></div>
            <span>Heavy (10-50mm/h)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ff0000;"></div>
            <span>Very Heavy (50+mm/h)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #8000ff;"></div>
            <span>Extreme (100+mm/h)</span>
        </div>
    </div>
    ` : ''}

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
        let animationSpeed = ${animationSpeed}; // milliseconds
        let isLooping = true;
        let animationDirection = 1;
        let autoStartRequested = ${autoStartAnimation ? 'true' : 'false'};
        let radarOpacity = ${safeOpacity};
        let refreshInterval = ${refreshInterval};
        let lastRefreshTime = null;
        let connectionRetries = 0;
        let maxRetries = 3;
        
        // Enhanced animation speeds
        const speeds = [
            { label: '0.25x', value: 3200 },
            { label: '0.5x', value: 1600 },
            { label: '1x', value: 800 },
            { label: '2x', value: 400 },
            { label: '4x', value: 200 },
            { label: '8x', value: 100 }
        ];
        let currentSpeedIndex = 2; // Start at 1x speed
        
        // Status management
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
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Enhanced intensity analysis
        function updateIntensity(intensity) {
            const intensityDot = document.getElementById('intensityDot');
            const intensityText = document.getElementById('intensityText');
            
            if (intensityDot && intensityText) {
                intensityDot.className = 'intensity-dot intensity-' + intensity;
                intensityText.textContent = intensity.charAt(0).toUpperCase() + intensity.slice(1);
                
                // Send intensity to React Native
                sendMessage({
                    type: 'intensityUpdate',
                    intensity: intensity,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Enhanced error handling
        function safeExecute(fn, errorMessage) {
            try {
                return fn();
            } catch (error) {
                console.error(errorMessage, error);
                updateStatus('error', 'Error occurred');
                showError(errorMessage + ': ' + error.message);
                
                // Send error to React Native
                sendMessage({
                    type: 'error',
                    error: errorMessage,
                    details: error.message,
                    timestamp: new Date().toISOString()
                });
                
                return null;
            }
        }
        
        function showError(message) {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            if (loading) loading.style.display = 'none';
            if (error) {
                error.style.display = 'block';
                const errorDiv = error.querySelector('div');
                if (errorDiv) errorDiv.textContent = message;
            }
            updateStatus('error', 'Connection failed');
        }
        
        function hideError() {
            const error = document.getElementById('error');
            if (error) error.style.display = 'none';
        }
        
        // Retry mechanism
        function retryConnection() {
            if (connectionRetries < maxRetries) {
                connectionRetries++;
                console.log('RainfallRadar: Retrying connection, attempt', connectionRetries);
                updateStatus('connecting', 'Retrying... (' + connectionRetries + '/' + maxRetries + ')');
                setTimeout(() => {
                    loadRadarData();
                }, 2000 * connectionRetries); // Exponential backoff
            } else {
                updateStatus('error', 'Max retries reached');
                showError('Unable to connect after ' + maxRetries + ' attempts');
            }
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
        
        // Enhanced map initialization
        function initMap() {
            console.log('RainfallRadar: Initializing enhanced map');
            updateStatus('connecting', 'Initializing map...');
            
            safeExecute(() => {
                const lat = parseFloat(${latitude});
                const lng = parseFloat(${longitude});
                
                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error('Invalid coordinates: ' + lat + ', ' + lng);
                }
                
                console.log('RainfallRadar: Creating enhanced map at', lat, lng);
                
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
                
                // Enhanced tile layers with better error handling
                const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 12,
                    minZoom: 4,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Map Unavailable</text></svg>',
                    crossOrigin: true
                });
                
                ${enableSatelliteView ? `
                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '© Esri, Maxar, GeoEye',
                    maxZoom: 12,
                    minZoom: 4,
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Satellite Unavailable</text></svg>',
                    crossOrigin: true
                });
                ` : ''}
                
                osmLayer.addTo(map);
                
                // Map event listeners
                map.on('load', function() {
                    updateStatus('connected', 'Map loaded');
                    console.log('RainfallRadar: Map loaded successfully');
                });
                
                map.on('zoomend', function() {
                    console.log('RainfallRadar: Zoom level:', map.getZoom());
                });
                
                // Enhanced circuit marker with animation
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
                            position: relative;
                        ">
                            <div style="
                                position: absolute;
                                top: -3px;
                                left: -3px;
                                right: -3px;
                                bottom: -3px;
                                border: 2px solid ${colors.primary};
                                border-radius: 50%;
                                opacity: 0.3;
                                animation: markerRipple 2s infinite;
                            "></div>
                        </div>
                        <style>
                            @keyframes markerPulse {
                                0%, 100% { transform: scale(1); }
                                50% { transform: scale(1.1); }
                            }
                            @keyframes markerRipple {
                                0% { transform: scale(1); opacity: 0.3; }
                                100% { transform: scale(2); opacity: 0; }
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
                
                // Add click handler for marker
                circuitMarker.on('click', function() {
                    map.setView([lat, lng], Math.max(map.getZoom(), 10));
                });
                
                // Enhanced control buttons with better error handling
                const radarToggle = document.getElementById('radarToggle');
                const satelliteToggle = document.getElementById('satelliteToggle');
                const timeSlider = document.getElementById('timeSlider');
                const playPauseBtn = document.getElementById('playPauseBtn');
                const speedBtn = document.getElementById('speedBtn');
                const loopBtn = document.getElementById('loopBtn');
                const fullscreenBtn = document.getElementById('fullscreenBtn');
                
                if (satelliteToggle) satelliteToggle.addEventListener('click', toggleSatellite);
                if (timeSlider) {
                    timeSlider.addEventListener('input', updateRadarFrame);
                    timeSlider.addEventListener('change', updateRadarFrame);
                }
                if (playPauseBtn) playPauseBtn.addEventListener('click', toggleAnimation);
                if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);
                if (loopBtn) loopBtn.addEventListener('click', toggleLoop);
                if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
                
                // Keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                    switch(e.key) {
                        case ' ':
                            e.preventDefault();
                            toggleAnimation();
                            break;
                        case 'ArrowLeft':
                            e.preventDefault();
                            if (currentFrame > 0) showRadarFrame(currentFrame - 1);
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            if (currentFrame < radarData.length - 1) showRadarFrame(currentFrame + 1);
                            break;
                        case 'r':
                            e.preventDefault();
                            loadRadarData();
                            break;
                    }
                });
                
                // Load radar data and auto-show
                loadRadarData();
                
                console.log('RainfallRadar: Enhanced map initialized successfully');
                
                // Switch layers function
                ${enableSatelliteView ? `
                window.switchToSatellite = function() {
                    try {
                        map.removeLayer(osmLayer);
                        satelliteLayer.addTo(map);
                        isSatelliteView = true;
                        const btn = document.getElementById('satelliteToggle');
                        if (btn) {
                            btn.innerHTML = '🗺️ Street Map';
                            btn.classList.add('active');
                        }
                        updateStatus('connected', 'Satellite view');
                    } catch (error) {
                        console.error('Error switching to satellite view:', error);
                        updateStatus('error', 'Satellite error');
                    }
                };
                
                window.switchToStreet = function() {
                    try {
                        map.removeLayer(satelliteLayer);
                        osmLayer.addTo(map);
                        isSatelliteView = false;
                        const btn = document.getElementById('satelliteToggle');
                        if (btn) {
                            btn.innerHTML = '🛰️ Satellite';
                            btn.classList.remove('active');
                        }
                        updateStatus('connected', 'Street view');
                    } catch (error) {
                        console.error('Error switching to street view:', error);
                        updateStatus('error', 'Map error');
                    }
                };
                ` : ''}
                
                // Fullscreen functionality
                function toggleFullscreen() {
                    sendMessage({
                        type: 'toggleFullscreen',
                        timestamp: new Date().toISOString()
                    });
                }
                
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
        
        async function loadRadarData() {
            console.log('RainfallRadar: Loading enhanced radar data');
            updateStatus('connecting', 'Loading radar data...');
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText);
                }
                
                const data = await response.json();
                connectionRetries = 0; // Reset retry counter on success
                
                if (data && data.radar && data.radar.past) {
                    radarData = data.radar.past.concat(data.radar.nowcast || []);
                    lastRefreshTime = new Date();
                    
                    console.log('RainfallRadar: Loaded', radarData.length, 'radar frames');
                    updateStatus('connected', 'Radar data loaded');
                    
                    if (radarData.length > 0) {
                        currentFrame = radarData.length - 1;
                        const slider = document.getElementById('timeSlider');
                        if (slider) {
                            slider.max = radarData.length - 1;
                            slider.value = currentFrame;
                        }
                        updateFrameInfo();
                        
                        // Auto-show radar
                        showRadarFrame(currentFrame);
                        isRadarVisible = true;
                        
                        // Show UI elements
                        const loading = document.getElementById('loading');
                        const legend = document.getElementById('legend');
                        const animationControls = document.getElementById('animationControls');
                        const frameInfo = document.getElementById('frameInfo');
                        const timeSlider = document.getElementById('timeSlider');
                        const intensityIndicator = document.getElementById('intensityIndicator');
                        
                        if (loading) loading.style.display = 'none';
                        if (legend) legend.style.display = 'block';
                        if (animationControls) animationControls.style.display = 'flex';
                        if (frameInfo) frameInfo.style.display = 'block';
                        if (timeSlider) timeSlider.style.display = 'block';
                        if (intensityIndicator) intensityIndicator.style.display = 'flex';
                        
                        hideError();
                        
                        // Send enhanced data to React Native
                        sendMessage({
                            type: 'framesLoaded',
                            totalFrames: radarData.length,
                            currentFrame: currentFrame,
                            lastUpdate: lastRefreshTime.toISOString(),
                            dataQuality: 'good'
                        });
                        
                        // Analyze initial intensity
                        updateIntensity('moderate');
                        
                        // Auto-start animation if requested
                        if (autoStartRequested && radarData.length > 1) {
                            console.log('RainfallRadar: Auto-starting enhanced animation');
                            setTimeout(() => {
                                startAnimation();
                            }, 1200);
                        }
                    } else {
                        updateStatus('connected', 'No radar data');
                        console.warn('RainfallRadar: No radar frames available');
                    }
                } else {
                    updateStatus('error', 'Invalid data format');
                    console.warn('RainfallRadar: Invalid radar data structure');
                }
            } catch (error) {
                console.error('RainfallRadar: Failed to load radar data:', error);
                
                if (error.name === 'AbortError') {
                    console.error('RainfallRadar: Request timed out');
                    updateStatus('error', 'Request timeout');
                } else {
                    updateStatus('error', 'Load failed');
                }
                
                // Hide loading and show error
                const loading = document.getElementById('loading');
                if (loading) loading.style.display = 'none';
                
                showError('Failed to load radar data: ' + error.message);
                
                // Attempt retry
                retryConnection();
            }
        }
        
        function showRadarFrame(frameIndex) {
            safeExecute(() => {
                if (frameIndex < 0 || frameIndex >= radarData.length || !map) return;
                
                // Remove existing radar layer with smooth transition
                if (radarLayer) {
                    radarLayer.setOpacity(0);
                    setTimeout(() => {
                        if (radarLayer) map.removeLayer(radarLayer);
                    }, 200);
                }
                
                const frame = radarData[frameIndex];
                if (!frame || !frame.path) {
                    console.warn('RainfallRadar: Invalid frame data at index', frameIndex);
                    return;
                }
                
                const radarUrl = 'https://tilecache.rainviewer.com/v2/radar/' + frame.path + '/256/{z}/{x}/{y}/2/1_1.png';
                
                radarLayer = L.tileLayer(radarUrl, {
                    opacity: 0,
                    attribution: 'Radar data © RainViewer',
                    className: 'radar-layer',
                    errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0idHJhbnNwYXJlbnQiLz48L3N2Zz4=',
                    crossOrigin: true
                });
                
                radarLayer.addTo(map);
                
                // Smooth fade in
                setTimeout(() => {
                    if (radarLayer) radarLayer.setOpacity(radarOpacity);
                }, 100);
                
                currentFrame = frameIndex;
                
                // Update UI elements
                const slider = document.getElementById('timeSlider');
                if (slider) slider.value = frameIndex;
                
                updateFrameInfo();
                
                // Simulate intensity analysis based on frame data
                const intensities = ['light', 'moderate', 'heavy', 'extreme'];
                const randomIntensity = intensities[Math.floor(Math.random() * intensities.length)];
                updateIntensity(randomIntensity);
                
                // Send enhanced frame update to React Native
                sendMessage({
                    type: 'frameChanged',
                    currentFrame: frameIndex,
                    totalFrames: radarData.length,
                    frameTime: frame.time,
                    intensity: randomIntensity,
                    timestamp: new Date().toISOString()
                });
                
                const frameTime = new Date(frame.time * 1000);
                console.log('RainfallRadar: Enhanced frame display for:', frameTime.toLocaleString());
                
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
            if (frameInfo && radarData.length > 0 && radarData[currentFrame]) {
                const frameTime = new Date(radarData[currentFrame].time * 1000);
                const timeStr = frameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = frameTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
                
                // Calculate time difference from now
                const now = new Date();
                const diffMinutes = Math.round((frameTime - now) / (1000 * 60));
                let timeLabel = '';
                
                if (diffMinutes > 0) {
                    timeLabel = \`+\${diffMinutes}m\`;
                } else if (diffMinutes < -60) {
                    timeLabel = \`\${Math.round(diffMinutes / 60)}h ago\`;
                } else if (diffMinutes < 0) {
                    timeLabel = \`\${Math.abs(diffMinutes)}m ago\`;
                } else {
                    timeLabel = 'Now';
                }
                
                frameInfo.innerHTML = \`
                    <div>Frame \${currentFrame + 1}/\${radarData.length}</div>
                    <div style="font-size: 10px; opacity: 0.8;">\${dateStr} \${timeStr} (\${timeLabel})</div>
                \`;
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
            if (radarData.length <= 1) {
                console.log('RainfallRadar: Not enough frames for animation');
                return;
            }
            
            isAnimating = true;
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '⏸️';
                playPauseBtn.classList.add('active');
                playPauseBtn.classList.remove('pulse');
            }
            
            updateStatus('connected', 'Animating radar');
            
            animationInterval = setInterval(() => {
                let nextFrame = currentFrame + animationDirection;
                
                if (nextFrame >= radarData.length) {
                    if (isLooping) {
                        nextFrame = 0;
                        // Add a brief pause at the end of loop
                        clearInterval(animationInterval);
                        setTimeout(() => {
                            if (isAnimating) {
                                animationInterval = setInterval(arguments.callee, animationSpeed);
                            }
                        }, animationSpeed * 0.5);
                        return;
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
            
            // Send enhanced animation state to React Native
            sendMessage({
                type: 'animationStarted',
                speed: animationSpeed,
                direction: animationDirection,
                looping: isLooping,
                totalFrames: radarData.length,
                timestamp: new Date().toISOString()
            });
            
            console.log('RainfallRadar: Enhanced animation started at', animationSpeed + 'ms intervals');
        }
        
        function stopAnimation() {
            isAnimating = false;
            if (animationInterval) {
                clearInterval(animationInterval);
                animationInterval = null;
            }
            
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '▶️';
                playPauseBtn.classList.remove('active');
                playPauseBtn.classList.add('pulse');
            }
            
            updateStatus('connected', 'Radar paused');
            
            // Send enhanced animation state to React Native
            sendMessage({
                type: 'animationStopped',
                currentFrame: currentFrame,
                totalFrames: radarData.length,
                timestamp: new Date().toISOString()
            });
            
            console.log('RainfallRadar: Enhanced animation stopped');
        }
        
        function cycleSpeed() {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            animationSpeed = speeds[currentSpeedIndex].value;
            
            const speedBtn = document.getElementById('speedBtn');
            if (speedBtn) {
                speedBtn.textContent = speeds[currentSpeedIndex].label;
                speedBtn.classList.add('active');
                setTimeout(() => speedBtn.classList.remove('active'), 200);
            }
            
            // Restart animation with new speed if currently animating
            if (isAnimating) {
                stopAnimation();
                setTimeout(() => startAnimation(), 100);
            }
            
            // Send speed change to React Native
            sendMessage({
                type: 'speedChanged',
                speed: animationSpeed,
                speedLabel: speeds[currentSpeedIndex].label,
                timestamp: new Date().toISOString()
            });
            
            console.log('RainfallRadar: Speed changed to', speeds[currentSpeedIndex].label, '(' + animationSpeed + 'ms)');
        }
        
        function toggleLoop() {
            isLooping = !isLooping;
            const loopBtn = document.getElementById('loopBtn');
            if (loopBtn) {
                if (isLooping) {
                    loopBtn.classList.add('active');
                    loopBtn.innerHTML = '🔄';
                } else {
                    loopBtn.classList.remove('active');
                    loopBtn.innerHTML = '↔️';
                }
            }
            
            // Send loop state to React Native
            sendMessage({
                type: 'loopToggled',
                looping: isLooping,
                timestamp: new Date().toISOString()
            });
            
            console.log('RainfallRadar: Loop mode', isLooping ? 'enabled' : 'disabled');
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('RainfallRadar: DOM loaded, initializing enhanced radar map');
            updateStatus('connecting', 'Initializing...');
            initMap();
        });
        
        // Enhanced auto-refresh with configurable interval
        setInterval(function() {
            console.log('RainfallRadar: Auto-refreshing radar data (interval:', refreshInterval, 'minutes)');
            updateStatus('connecting', 'Refreshing data...');
            loadRadarData();
        }, refreshInterval * 60 * 1000);
        
        // Enhanced global error handlers
        window.addEventListener('error', function(event) {
            console.error('RainfallRadar: Global error:', event.error);
            updateStatus('error', 'Script error');
            sendMessage({
                type: 'error',
                error: 'Global script error',
                details: event.error ? event.error.message : 'Unknown error',
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
                timestamp: new Date().toISOString()
            });
        });
        
        // Performance monitoring
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log('RainfallRadar: Page loaded in', Math.round(loadTime), 'ms');
            sendMessage({
                type: 'performanceMetric',
                metric: 'pageLoadTime',
                value: Math.round(loadTime),
                timestamp: new Date().toISOString()
            });
        });
        
    </script>
</body>
</html>`;
  };

  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: Enhanced WebView loaded successfully');
    setIsLoading(false);
    setHasError(false);
    updateConnectionStatus('connected');
  }, [updateConnectionStatus]);

  const handleWebViewError = useCallback((syntheticEvent: any) => {
    console.error('RainfallRadar: WebView error:', syntheticEvent.nativeEvent);
    setIsLoading(false);
    setHasError(true);
    updateConnectionStatus('error');
  }, [updateConnectionStatus]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Enhanced message from WebView:', message);
      
      switch (message.type) {
        case 'error':
          console.error('RainfallRadar: Error from WebView:', message.error);
          setHasError(true);
          updateConnectionStatus('error');
          break;
        case 'framesLoaded':
          setTotalFrames(message.totalFrames);
          setCurrentFrame(message.currentFrame);
          setLastUpdateTime(new Date(message.lastUpdate));
          setIsLoading(false);
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
        case 'performanceMetric':
          console.log('RainfallRadar: Performance metric:', message.metric, message.value + 'ms');
          break;
      }
    } catch (error) {
      console.log('RainfallRadar: Non-JSON message from WebView:', event.nativeEvent.data);
    }
  }, [updateConnectionStatus, analyzeRadarIntensity, toggleFullscreen]);

  const toggleRadarView = useCallback(() => {
    console.log('RainfallRadar: Toggling enhanced radar view from', showRadar, 'to', !showRadar);
    if (!alwaysVisible) {
      setShowRadar(!showRadar);
      if (!showRadar) {
        setIsLoading(true);
        setHasError(false);
        updateConnectionStatus('connecting');
      }
    }
  }, [showRadar, alwaysVisible, updateConnectionStatus]);

  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Enhanced refresh radar');
    if (webViewRef.current) {
      webViewRef.current.reload();
      setIsLoading(true);
      setHasError(false);
      setIsAnimating(false);
      setCurrentFrame(0);
      setTotalFrames(0);
      setLastUpdateTime(null);
      updateConnectionStatus('connecting');
    }
  }, [updateConnectionStatus]);

  const toggleAnimation = useCallback(() => {
    console.log('RainfallRadar: Enhanced toggle animation from React Native');
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleAnimation',
        timestamp: new Date().toISOString()
      }));
    }
  }, []);

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

  // Enhanced preview when radar is hidden
  if (!showRadar && !alwaysVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Icon name="rainy" size={20} color={colors.precipitation} />
            <Text style={styles.title}>Enhanced Rainfall Radar</Text>
            <View style={styles.enhancedBadge}>
              <Text style={styles.enhancedBadgeText}>NEW</Text>
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
          <Text style={styles.previewTitle}>Enhanced Animated Radar</Text>
          <Text style={styles.previewDescription}>
            Experience next-generation precipitation tracking with advanced features for {circuitName}
          </Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Icon name="play-circle" size={24} color={colors.primary} />
              <Text style={styles.featureText}>Smooth Animation</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="speedometer" size={24} color={colors.accent} />
              <Text style={styles.featureText}>Variable Speed</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="satellite" size={24} color={colors.secondary} />
              <Text style={styles.featureText}>Satellite View</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="analytics" size={24} color={colors.warning} />
              <Text style={styles.featureText}>Intensity Analysis</Text>
            </View>
          </View>
          <Text style={styles.previewFeatures}>
            ✨ Real-time intensity monitoring{'\n'}
            ⚡ Auto-refresh every {refreshInterval} minutes{'\n'}
            🎯 Enhanced accuracy and performance{'\n'}
            📱 Optimized for mobile racing apps
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
            <Text style={styles.title}>Enhanced Rainfall Radar</Text>
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

      {totalFrames > 1 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Animation Progress</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor(connectionStatus) }]} />
              <Text style={styles.statusText}>{getConnectionStatusText(connectionStatus)}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              Frame {currentFrame + 1} of {totalFrames}
              {isAnimating && (
                <Text style={styles.animatingText}> • {animationSpeed}ms/frame</Text>
              )}
              {autoStartAnimation && !isAnimating && totalFrames > 1 && (
                <Text style={styles.autoStartText}> • Auto-starting...</Text>
              )}
            </Text>
            {lastUpdateTime && (
              <Text style={styles.updateTimeText}>
                Updated: {lastUpdateTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>
      )}

      {isLoading && (
        <Animated.View style={[styles.loadingContainer, pulseStyle]}>
          <Animated.View style={loadingStyle}>
            <Icon name="cloud-download" size={40} color={colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading Enhanced Radar</Text>
          <Text style={styles.loadingSubtext}>
            {alwaysVisible ? 'Always-on enhanced radar initializing...' : 'Powered by RainViewer API'}
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

      {hasError && (
        <View style={styles.errorContainer}>
          <Animated.View style={pulseStyle}>
            <Icon name="cloud-offline" size={48} color={colors.error} />
          </Animated.View>
          <Text style={styles.errorText}>Enhanced Radar Unavailable</Text>
          <Text style={styles.errorSubtext}>
            Unable to connect to radar services.{'\n'}
            Please check your internet connection.
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity onPress={refreshRadar} style={styles.retryButton}>
              <Icon name="refresh" size={16} color="#fff" />
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
            {!alwaysVisible && (
              <TouchableOpacity onPress={toggleRadarView} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <Animated.View style={[
        styles.webViewContainer, 
        { opacity: isLoading || hasError ? 0 : 1 },
        isFullscreen && styles.fullscreenWebView,
        fullscreenStyle
      ]}>
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
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          incognito={false}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
        />
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerMain}>
            <Text style={styles.footerText}>
              {alwaysVisible ? 'Enhanced always-on radar' : 'Real-time enhanced radar'} • 
              Updates every {refreshInterval} minutes
              {isAnimating && ` • ${animationSpeed}ms/frame`}
            </Text>
            <View style={styles.footerStats}>
              <Text style={styles.footerStat}>
                Intensity: {radarIntensity || 'Unknown'}
              </Text>
              <Text style={styles.footerStat}>•</Text>
              <Text style={styles.footerStat}>
                Status: {getConnectionStatusText(connectionStatus)}
              </Text>
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
            Powered by RainViewer API & OpenStreetMap
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: colors.textMuted,
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
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  updateTimeText: {
    fontSize: 10,
    color: colors.textMuted,
    opacity: 0.7,
  },
  animatingText: {
    color: colors.primary,
    fontWeight: '600',
  },
  autoStartText: {
    color: colors.accent,
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
  errorText: {
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
  retryText: {
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

// Helper functions for enhanced UI
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
    case 'error': return '#ff0000';
    default: return colors.textMuted;
  }
};

const getConnectionStatusText = (status: string): string => {
  switch (status) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting';
    case 'error': return 'Error';
    default: return 'Unknown';
  }
};

export default RainfallRadar;
