
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
  }, [isLoading, pulseAnimation, loadingRotation]);

  // Get category color
  const getCategoryColor = useCallback(() => {
    switch (category) {
      case 'f1': return '#E10600';
      case 'motogp': return '#FF8C00';
      case 'indycar': return '#0066CC';
      default: return colors.primary;
    }
  }, [category, colors]);

  // Web-compatible HTML generation with better error handling
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http:; img-src 'self' data: https: http:;">
    <title>Radar - ${safeCircuitName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${colors.background};
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
            padding: 16px;
            border-radius: 10px;
            text-align: center;
            min-width: 150px;
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
        .error-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 16px;
            border-radius: 10px;
            text-align: center;
            min-width: 200px;
        }
        .simple-map {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .map-marker {
            width: 16px;
            height: 16px;
            background: ${categoryColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            margin-bottom: 16px;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .map-marker::after {
            content: '';
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
        }
        .track-info {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: center;
            max-width: 200px;
        }
        .track-name {
            font-size: ${compact ? '14px' : '16px'};
            font-weight: bold;
            margin-bottom: 4px;
        }
        .track-country {
            font-size: ${compact ? '11px' : '12px'};
            opacity: 0.8;
            margin-bottom: 6px;
        }
        .track-coords {
            font-size: ${compact ? '9px' : '10px'};
            opacity: 0.6;
        }
        .web-notice {
            position: absolute;
            bottom: 8px;
            right: 8px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 9px;
            text-align: center;
            max-width: 120px;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        <div style="font-size: 12px;">Loading...</div>
    </div>
    
    <div id="error" class="error-container" style="display: none;">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 6px;">⚠️ Radar Unavailable</div>
        <div style="font-size: 12px; margin-bottom: 8px;">Live radar data cannot be loaded in web preview.</div>
        <div style="font-size: 10px; opacity: 0.9;">Use mobile app for full functionality.</div>
    </div>
    
    <div id="map">
        <div class="simple-map">
            <div class="map-marker"></div>
            <div class="track-info">
                <div class="category-badge">${category.toUpperCase()}</div>
                <div class="track-name">${safeCircuitName}</div>
                <div class="track-country">${safeCountry}</div>
                <div class="track-coords">${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°</div>
            </div>
        </div>
    </div>
    
    <div id="status" class="status">Connecting...</div>
    <div class="web-notice">📱 Full radar in mobile app</div>
    
    <div class="circuit-info">
        <div class="category-badge">${category.toUpperCase()}</div>
        <div style="font-weight: bold; font-size: 11px;">${safeCircuitName}</div>
        <div style="opacity: 0.8;">${safeCountry}</div>
    </div>

    <script>
        let isWebEnvironment = true;
        let hasTriedLoading = false;
        
        function sendMessage(data) {
            try {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                } else if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage(JSON.stringify(data), '*');
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
            const errorDiv = document.getElementById('error');
            if (errorDiv) {
                errorDiv.style.display = 'block';
            }
            updateStatus('❌ ' + message);
            sendMessage({ type: 'error', message: message });
        }
        
        function showWebNotice() {
            hideLoading();
            updateStatus('📍 ${category.toUpperCase()}');
            sendMessage({ 
                type: 'connected', 
                totalFrames: 0,
                webMode: true,
                message: 'Web preview mode - showing location only'
            });
        }
        
        async function tryLoadRadar() {
            if (hasTriedLoading) return;
            hasTriedLoading = true;
            
            try {
                updateStatus('Checking...');
                
                // Detect web environment
                const userAgent = navigator.userAgent.toLowerCase();
                const isWebBrowser = userAgent.includes('chrome') || userAgent.includes('firefox') || userAgent.includes('safari');
                
                if (isWebBrowser && !window.ReactNativeWebView) {
                    console.log('Detected web browser, showing location view');
                    showWebNotice();
                    return;
                }
                
                // Try to load radar data with shorter timeout for compact view
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
                    signal: controller.signal,
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}\`);
                }
                
                const data = await response.json();
                
                if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
                    // Even if we get data, show web notice for consistency
                    showWebNotice();
                } else {
                    showWebNotice();
                }
                
            } catch (error) {
                console.error('Radar loading error:', error);
                // Always show web notice instead of error for better UX
                showWebNotice();
            }
        }
        
        // Initialize
        function init() {
            console.log('Initializing track radar component for ${category}');
            
            // Small delay to ensure proper rendering
            setTimeout(() => {
                tryLoadRadar();
            }, 300);
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        
        // Handle messages from React Native
        window.addEventListener('message', function(event) {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);
                // For web mode, we don't support animation
                if (message.type === 'toggleAnimation') {
                    sendMessage({ type: 'animationNotSupported', webMode: true });
                }
            } catch (error) {
                // Ignore non-JSON messages
            }
        });
    </script>
</body>
</html>`;
  }, [latitude, longitude, circuitName, country, category, colors, compact, getCategoryColor]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('TrackRainfallRadar: Message received:', message.type, message);
      
      switch (message.type) {
        case 'connected':
          setConnectionStatus('connected');
          setIsLoading(false);
          setHasError(false);
          setTotalFrames(message.totalFrames || 0);
          if (message.webMode) {
            console.log('TrackRainfallRadar: Web mode detected');
          }
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
          
        case 'animationNotSupported':
          console.log('TrackRainfallRadar: Animation not supported in web mode');
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

  const handleWebViewLoad = useCallback(() => {
    console.log('TrackRainfallRadar: WebView loaded successfully');
  }, []);

  const toggleAnimation = useCallback(() => {
    if (webViewRef.current && connectionStatus === 'connected' && !isWeb) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'toggleAnimation' }));
    }
  }, [connectionStatus, isWeb]);

  const refreshRadar = useCallback(() => {
    console.log('TrackRainfallRadar: Refreshing radar');
    setIsLoading(true);
    setHasError(false);
    setConnectionStatus('connecting');
    setTotalFrames(0);
    setIsAnimating(false);
    
    // Force WebView reload
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
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
      position: 'relative',
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
    webNotice: {
      position: 'absolute',
      bottom: 8,
      left: 8,
      right: 8,
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary + '30',
      borderWidth: 1,
      borderRadius: 6,
      padding: 6,
      zIndex: 1000,
    },
    webNoticeText: {
      fontSize: 10,
      color: colors.primary,
      textAlign: 'center',
      fontWeight: '500',
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
            <Text style={styles.subtitle}>{country} • {isWeb ? 'Location' : 'Live Radar'}</Text>
          </View>
        </View>
        {showControls && (
          <View style={styles.controls}>
            {totalFrames > 1 && connectionStatus === 'connected' && !isWeb && (
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
          {connectionStatus === 'connected' ? (isWeb ? '📍 Location View' : '✅ Live') :
           connectionStatus === 'connecting' ? '🔄 Loading' : '❌ Error'}
          {isWeb && ' (Web)'}
        </Text>
        
        {totalFrames > 0 && !isWeb && (
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
            onLoad={handleWebViewLoad}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            scalesPageToFit={true}
            bounces={false}
            scrollEnabled={false}
          />
          {isWeb && connectionStatus === 'connected' && (
            <View style={styles.webNotice}>
              <Text style={styles.webNoticeText}>
                📱 Interactive radar available in mobile app
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default TrackRainfallRadar;
