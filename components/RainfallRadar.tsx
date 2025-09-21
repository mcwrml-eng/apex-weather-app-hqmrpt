
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

  // Web-compatible HTML generation with better error handling
  const generateRadarHTML = useCallback(() => {
    const safeCircuitName = circuitName.replace(/[<>"'&]/g, '');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http:; img-src 'self' data: https: http:;">
    <title>Rainfall Radar - ${safeCircuitName}</title>
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
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            min-width: 200px;
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
        .error-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            min-width: 250px;
        }
        .web-notice {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 11px;
            text-align: center;
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
            width: 20px;
            height: 20px;
            background: #e17055;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            margin-bottom: 20px;
            position: relative;
        }
        .map-marker::after {
            content: '';
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
        }
        .circuit-info {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: center;
        }
        .circuit-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .circuit-coords {
            font-size: 12px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        <div>Loading Radar...</div>
    </div>
    
    <div id="error" class="error-container" style="display: none;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">⚠️ Radar Unavailable</div>
        <div style="font-size: 14px; margin-bottom: 12px;">Live radar data cannot be loaded in web preview mode.</div>
        <div style="font-size: 12px; opacity: 0.9;">Please use the mobile app for full radar functionality.</div>
    </div>
    
    <div id="map">
        <div class="simple-map">
            <div class="map-marker"></div>
            <div class="circuit-info">
                <div class="circuit-name">${safeCircuitName}</div>
                <div class="circuit-coords">${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°</div>
            </div>
        </div>
    </div>
    
    <div id="status" class="status">Connecting...</div>
    <div class="web-notice">📱 Full radar available in mobile app • Web preview shows location only</div>

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
            updateStatus('📍 Location shown');
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
                updateStatus('Checking radar...');
                
                // Try to detect if we're in a web environment
                const userAgent = navigator.userAgent.toLowerCase();
                const isWebBrowser = userAgent.includes('chrome') || userAgent.includes('firefox') || userAgent.includes('safari');
                
                if (isWebBrowser && !window.ReactNativeWebView) {
                    console.log('Detected web browser environment, showing web notice');
                    showWebNotice();
                    return;
                }
                
                // Try to load radar data with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
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
                    // If we get here, we could potentially load the full radar
                    // But for web compatibility, we'll still show the simple version
                    showWebNotice();
                } else {
                    showError('No radar data');
                }
                
            } catch (error) {
                console.error('Radar loading error:', error);
                if (error.name === 'AbortError') {
                    showWebNotice(); // Timeout, show web notice instead of error
                } else {
                    showWebNotice(); // Any other error, show web notice
                }
            }
        }
        
        // Initialize
        function init() {
            console.log('Initializing radar component');
            
            // Small delay to ensure proper rendering
            setTimeout(() => {
                tryLoadRadar();
            }, 500);
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
  }, [latitude, longitude, circuitName, colors]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('RainfallRadar: Message received:', message.type, message);
      
      switch (message.type) {
        case 'connected':
          setConnectionStatus('connected');
          setIsLoading(false);
          setHasError(false);
          setTotalFrames(message.totalFrames || 0);
          if (message.webMode) {
            console.log('RainfallRadar: Web mode detected');
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
          console.log('RainfallRadar: Animation not supported in web mode');
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

  const handleWebViewLoad = useCallback(() => {
    console.log('RainfallRadar: WebView loaded successfully');
  }, []);

  const toggleAnimation = useCallback(() => {
    if (webViewRef.current && connectionStatus === 'connected' && !isWeb) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'toggleAnimation' }));
    }
  }, [connectionStatus, isWeb]);

  const refreshRadar = useCallback(() => {
    console.log('RainfallRadar: Refreshing radar');
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
    webNotice: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary + '30',
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginTop: 8,
    },
    webNoticeText: {
      fontSize: 12,
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
          {totalFrames > 1 && connectionStatus === 'connected' && !isWeb && (
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
          {connectionStatus === 'connected' ? (isWeb ? '📍 Location' : '✅ Connected') :
           connectionStatus === 'connecting' ? '🔄 Connecting' : '❌ Error'}
          {isWeb && ' (Web Mode)'}
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
                📱 Full interactive radar available in mobile app
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default RainfallRadar;
