
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../state/ThemeContext';
import { getColors, borderRadius, getShadows } from '../styles/commonStyles';
import Icon from './Icon';

interface WindyWindFlowProps {
  latitude: number;
  longitude: number;
  circuitName: string;
  zoom?: number;
  width?: number;
  height?: number;
  compact?: boolean;
}

const WindyWindFlow: React.FC<WindyWindFlowProps> = ({
  latitude,
  longitude,
  circuitName,
  zoom = 8,
  width = 340,
  height = 400,
  compact = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const shadows = getShadows(isDark);
  
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentLayer, setCurrentLayer] = useState<'wind' | 'gust' | 'temp'>('wind');

  // Generate Windy.com embed URL with wind overlay
  const windyUrl = useMemo(() => {
    const baseUrl = 'https://embed.windy.com/embed2.html';
    const params = new URLSearchParams({
      lat: latitude.toFixed(4),
      lon: longitude.toFixed(4),
      detailLat: latitude.toFixed(4),
      detailLon: longitude.toFixed(4),
      width: '650',
      height: '450',
      zoom: currentZoom.toString(),
      level: 'surface',
      overlay: currentLayer,
      product: 'ecmwf',
      menu: '',
      message: 'true',
      marker: 'true',
      calendar: 'now',
      pressure: '',
      type: 'map',
      location: 'coordinates',
      detail: 'true',
      metricWind: 'km/h',
      metricTemp: '°C',
      radarRange: '-1',
    });
    
    return `${baseUrl}?${params.toString()}`;
  }, [latitude, longitude, currentZoom, currentLayer]);

  const handleZoomIn = useCallback(() => {
    if (currentZoom < 12) {
      setCurrentZoom(prev => prev + 1);
    }
  }, [currentZoom]);

  const handleZoomOut = useCallback(() => {
    if (currentZoom > 4) {
      setCurrentZoom(prev => prev - 1);
    }
  }, [currentZoom]);

  const handleReset = useCallback(() => {
    setCurrentZoom(zoom);
    setCurrentLayer('wind');
  }, [zoom]);

  const handleLayerChange = useCallback((layer: 'wind' | 'gust' | 'temp') => {
    setCurrentLayer(layer);
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: compact ? 12 : 16,
      borderWidth: 1,
      borderColor: colors.divider,
      boxShadow: shadows.md,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    title: {
      fontSize: compact ? 16 : 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Roboto_700Bold',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginBottom: 16,
    },
    webviewContainer: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
      position: 'relative',
    },
    webview: {
      backgroundColor: 'transparent',
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundAlt,
      zIndex: 10,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Roboto_500Medium',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    controlButton: {
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    controlButtonDisabled: {
      opacity: 0.4,
    },
    controlButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    controlButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    controlButtonTextActive: {
      color: '#fff',
    },
    zoomLevel: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: 'Roboto_500Medium',
    },
    layerControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    layerButton: {
      backgroundColor: colors.backgroundAlt,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.divider,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    layerButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    layerButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Roboto_600SemiBold',
    },
    layerButtonTextActive: {
      color: '#fff',
    },
    infoText: {
      fontSize: 11,
      color: colors.textMuted,
      fontFamily: 'Roboto_400Regular',
      marginTop: 12,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    badge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    badgeText: {
      fontSize: 10,
      color: '#fff',
      fontFamily: 'Roboto_600SemiBold',
    },
  }), [colors, shadows, compact]);

  const webviewContainerStyle = useMemo(() => ({
    ...styles.webviewContainer,
    width: compact ? 280 : width,
    height: compact ? 320 : height,
  }), [styles.webviewContainer, compact, width, height]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="flag" size={20} color={colors.wind} />
          <Text style={styles.title}>Live Wind Flow</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WINDY.COM</Text>
        </View>
      </View>
      
      <Text style={styles.subtitle}>
        Real-time wind flow visualization from Windy.com for {circuitName}
      </Text>

      <View style={webviewContainerStyle}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading wind flow map...</Text>
          </View>
        )}
        
        <WebView
          source={{ uri: windyUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
        />
      </View>

      {/* Layer Selection Controls */}
      <View style={styles.layerControls}>
        <TouchableOpacity
          style={[styles.layerButton, currentLayer === 'wind' && styles.layerButtonActive]}
          onPress={() => handleLayerChange('wind')}
          activeOpacity={0.7}
        >
          <Icon 
            name="flag" 
            size={14} 
            color={currentLayer === 'wind' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, currentLayer === 'wind' && styles.layerButtonTextActive]}>
            Wind
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.layerButton, currentLayer === 'gust' && styles.layerButtonActive]}
          onPress={() => handleLayerChange('gust')}
          activeOpacity={0.7}
        >
          <Icon 
            name="flash" 
            size={14} 
            color={currentLayer === 'gust' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, currentLayer === 'gust' && styles.layerButtonTextActive]}>
            Gusts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.layerButton, currentLayer === 'temp' && styles.layerButtonActive]}
          onPress={() => handleLayerChange('temp')}
          activeOpacity={0.7}
        >
          <Icon 
            name="thermometer" 
            size={14} 
            color={currentLayer === 'temp' ? '#fff' : colors.text} 
          />
          <Text style={[styles.layerButtonText, currentLayer === 'temp' && styles.layerButtonTextActive]}>
            Temp
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zoom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentZoom >= 12 && styles.controlButtonDisabled]}
          onPress={handleZoomIn}
          disabled={currentZoom >= 12}
          activeOpacity={0.7}
        >
          <Icon name="add" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom In</Text>
        </TouchableOpacity>
        
        <Text style={styles.zoomLevel}>Zoom: {currentZoom}</Text>
        
        <TouchableOpacity
          style={[styles.controlButton, currentZoom <= 4 && styles.controlButtonDisabled]}
          onPress={handleZoomOut}
          disabled={currentZoom <= 4}
          activeOpacity={0.7}
        >
          <Icon name="remove" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Zoom Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={16} color={colors.text} />
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        Powered by Windy.com • Interactive wind flow with particle animation
      </Text>
    </View>
  );
};

export default WindyWindFlow;
